export const timezoneMap = {
    PST: "America/Los_Angeles", // UTC-8
    PDT: "America/Los_Angeles"  // UTC-7 (Auto-adjusts for DST)
};

/**
 * Converts a USGS timestamp with `PST/PDT` to UTC.
 * @param {string} timestampStr - USGS timestamp (e.g., "2024-11-27 00:00 PST").
 * @returns {string} - UTC timestamp in ISO format.
 */
export const convertUSGSToUTC = (timestampStr) => {
    try {
        const parts = timestampStr.trim().split(" ");
        if (parts.length !== 3) throw new Error(`Invalid timestamp format: ${timestampStr}`);

        const dateTime = `${parts[0]}T${parts[1]}`; // "YYYY-MM-DDTHH:MM:SS"
        const timezone = parts[2];

        if (!timezoneMap[timezone]) throw new Error(`Unknown timezone: ${timezone}`);

        // Convert to UTC using the correct timezone mapping
        const utcTimestamp = new Date(
            new Intl.DateTimeFormat("en-US", {
                timeZone: timezoneMap[timezone],
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(new Date(dateTime))
        ).toISOString();

        return utcTimestamp;
    } catch (error) {
        console.error(`❌ Timestamp conversion failed for ${timestampStr}:`, error.message);
        return null; // Return null if conversion fails
    }
};
