/**
 * String similarity utilities
 * Implements Dice coefficient for comparing strings
 */

/**
 * Calculate string similarity using Dice coefficient
 * @param {String} str1 - First string
 * @param {String} str2 - Second string
 * @returns {Number} Similarity score (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;

    const normalize = (str) => str.toLowerCase().trim();
    const s1 = normalize(str1);
    const s2 = normalize(str2);

    if (s1 === s2) return 1;
    if (s1.length < 2 || s2.length < 2) return 0;

    // Create bigrams
    const bigrams1 = new Map();
    for (let i = 0; i < s1.length - 1; i++) {
        const bigram = s1.substring(i, i + 2);
        bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
    }

    // Count matching bigrams
    let matches = 0;
    for (let i = 0; i < s2.length - 1; i++) {
        const bigram = s2.substring(i, i + 2);
        const count = bigrams1.get(bigram) || 0;
        if (count > 0) {
            matches++;
            bigrams1.set(bigram, count - 1);
        }
    }

    // Calculate Dice coefficient
    const totalBigrams = s1.length + s2.length - 2;
    return (2 * matches) / totalBigrams;
};

/**
 * Check if two strings are similar based on threshold
 * @param {String} str1 - First string
 * @param {String} str2 - Second string
 * @param {Number} threshold - Similarity threshold (0-1, default: 0.7)
 * @returns {Boolean} True if strings are similar
 */
export const isSimilar = (str1, str2, threshold = 0.7) => {
    return calculateSimilarity(str1, str2) >= threshold;
};
