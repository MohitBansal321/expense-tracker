/**
 * Security utilities
 */

/**
 * Escapes special characters in a string for use in a regular expression
 * @param {string} string - The string to escape
 * @returns {string} The escaped string
 */
export const escapeRegex = (string) => {
    if (typeof string !== "string") {
        return "";
    }
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
