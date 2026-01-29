/**
 * CSV utilities for exporting transaction data
 */

/**
 * Convert transactions to CSV format
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} categoryMap - Map of category IDs to category objects
 * @returns {String} CSV formatted string
 */
export const convertToCSV = (transactions, categoryMap = {}) => {
    if (!transactions || transactions.length === 0) {
        return "No data available";
    }

    // CSV headers
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const csvRows = [headers.join(",")];

    // Convert each transaction to CSV row
    transactions.forEach((transaction) => {
        const categoryName = categoryMap[transaction.category_id?.toString()]?.label || "Uncategorized";
        const date = new Date(transaction.date).toLocaleDateString();
        const description = `"${transaction.description.replace(/"/g, '""')}"`;
        const type = transaction.type;
        const amount = transaction.amount;

        const row = [date, description, categoryName, type, amount];
        csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
};

/**
 * Generate CSV filename with timestamp
 * @param {String} prefix - Filename prefix (default: "transactions")
 * @returns {String} Filename with timestamp
 */
export const generateCSVFilename = (prefix = "transactions") => {
    const timestamp = new Date().toISOString().split("T")[0];
    return `${prefix}_${timestamp}.csv`;
};

/**
 * Set CSV response headers
 * @param {Object} res - Express response object
 * @param {String} filename - CSV filename
 */
export const setCSVHeaders = (res, filename) => {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
};
