import { prisma } from "@/utils/db";

// Middleware to generate dynamic reports
//CREATE TABLE customreports (
//     id SERIAL PRIMARY KEY,
//     name TEXT NOT NULL,
//     description TEXT,
//     permissions JSONB,  -- Permissions required to view this report
//     query JSONB NOT NULL,  -- Query structure as JSON
//     created_by UUID REFERENCES users(id),
//     created_at TIMESTAMPTZ DEFAULT now(),
//     updated_at TIMESTAMPTZ DEFAULT now()
// );

// {
//     "table": "orders",
//     "filters": [
//         { "field": "status", "operator": "=", "value": "completed" },
//         { "field": "created_at", "operator": ">", "value": "2024-01-01" }
//     ],
//     "relations": [
//         { "table": "users", "on": "orders.user_id = users.id" }
//     ],
//     "columns": ["orders.id", "orders.status", "users.name"]
// }



export const getCustomReport = async (req, res, next) => {
    try {
        const { reportId } = req.params; // Get report ID from URL

        // 1️⃣ Fetch the report configuration
        const userReport = await prisma.customreports.findUnique({
            where: { id: parseInt(reportId) }
        });

        if (!userReport) {
            return res.status(404).json({ error: "Report not found" });
        }

        const { table, filters, columns } = userReport.query;

        let prismaQuery = { where: {} };

        // 2️⃣ Build WHERE clause dynamically
        filters.forEach(({ field, operator, value }) => {
            if (operator === "=") prismaQuery.where[field] = value;
            else if (operator === ">") prismaQuery.where[field] = { gt: value };
            else if (operator === "<") prismaQuery.where[field] = { lt: value };
            else if (operator === "!=") prismaQuery.where[field] = { not: value };
        });

        // 3️⃣ Convert column list into Prisma `select` object
        const selectColumns = columns.reduce((acc, col) => ({ ...acc, [col]: true }), {});

        // 4️⃣ Execute Prisma query dynamically
        const results = await prisma[table].findMany({
            where: prismaQuery.where,
            select: selectColumns
        });

        res.json({ success: true, data: results });

    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
};

export { getCustomReport };