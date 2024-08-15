const ADODB = require("node-adodb"); // Import the node-adodb library

const connection = ADODB.open(
  `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=path-to-your-access-database.accdb;`
);
// Replace "path-to-your-access-database.accdb" with the actual path to your Access database file

const LegacyAccessOrder = {
  // getAllOrders: async () => {
  // Use the connection to fetch orders from the legacy Access database
  // const result = await connection.query("SELECT * FROM Orders");
  getOrdersWithJoin: async () => {
    const query = `
      SELECT o.*, c.CustomerName
      FROM Orders o
      INNER JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderDate > #2023-01-01#`;

    const result = await connection.query(query);

    return result;
  },
  // Add other methods to interact with the legacy database
};

module.exports = LegacyAccessOrder;
