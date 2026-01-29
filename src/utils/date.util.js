/**
 * Date utilities for recurring transactions and date calculations
 */

/**
 * Calculate next execution date for recurring transaction
 * @param {String} frequency - Frequency type (daily, weekly, monthly, yearly)
 * @param {Date} currentDate - Current execution date
 * @param {Number} dayOfWeek - Day of week for weekly frequency (0-6)
 * @param {Number} dayOfMonth - Day of month for monthly frequency (1-31)
 * @returns {Date} Next execution date
 */
export const calculateNextExecution = (frequency, currentDate, dayOfWeek = null, dayOfMonth = null) => {
    const nextDate = new Date(currentDate);

    switch (frequency) {
        case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;

        case "weekly":
            if (dayOfWeek !== null && dayOfWeek !== undefined) {
                const currentDay = nextDate.getDay();
                const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
                nextDate.setDate(nextDate.getDate() + (daysUntilTarget || 7));
            } else {
                nextDate.setDate(nextDate.getDate() + 7);
            }
            break;

        case "monthly":
            if (dayOfMonth) {
                nextDate.setMonth(nextDate.getMonth() + 1);
                const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                nextDate.setDate(Math.min(dayOfMonth, daysInMonth));
            } else {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            break;

        case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;

        default:
            throw new Error(`Invalid frequency: ${frequency}`);
    }

    return nextDate;
};

/**
 * Calculate first execution date based on frequency and settings
 * @param {Date} startDate - Start date
 * @param {String} frequency - Frequency type
 * @param {Number} dayOfWeek - Day of week for weekly frequency
 * @param {Number} dayOfMonth - Day of month for monthly frequency
 * @returns {Date} First execution date
 */
export const calculateFirstExecution = (startDate, frequency, dayOfWeek = null, dayOfMonth = null) => {
    const start = startDate ? new Date(startDate) : new Date();
    let nextExecution = new Date(start);

    if (frequency === "weekly" && dayOfWeek !== undefined && dayOfWeek !== null) {
        const currentDay = nextExecution.getDay();
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
        nextExecution.setDate(nextExecution.getDate() + (daysUntilTarget || 7));
    } else if (frequency === "monthly" && dayOfMonth) {
        const daysInMonth = new Date(nextExecution.getFullYear(), nextExecution.getMonth() + 1, 0).getDate();
        nextExecution.setDate(Math.min(dayOfMonth, daysInMonth));

        if (nextExecution <= new Date()) {
            nextExecution.setMonth(nextExecution.getMonth() + 1);
        }
    }

    return nextExecution;
};

/**
 * Check if a date is in the past
 * @param {Date} date - Date to check
 * @returns {Boolean} True if date is in the past
 */
export const isPastDate = (date) => {
    return new Date(date) < new Date();
};

/**
 * Check if end date has been reached
 * @param {Date} nextExecution - Next execution date
 * @param {Date} endDate - End date
 * @returns {Boolean} True if end date has been reached
 */
export const isEndDateReached = (nextExecution, endDate) => {
    if (!endDate) return false;
    return new Date(nextExecution) > new Date(endDate);
};
