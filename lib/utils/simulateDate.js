"use strict";

/**
 * Returns the current date or a simulated date for testing
 * @param {boolean} simulateFuture - Whether to simulate a future date (for testing trial expiration)
 * @param {number} daysToAdd - Number of days to add to current date (default: 15)
 * @returns {Date} - Current date or simulated future date
 */
export function getCurrentDateOrSimulated(
  simulateFuture = false,
  daysToAdd = 15
) {
  // Base date is always the current date
  let now = new Date();

  // ! SIMULATION MODE - enable to test trial expiration
  // ! If simulateFuture is true, add days to current date to simulate future date
  if (simulateFuture) {
    now = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    console.log(`[SIMULATION] Using future date: ${now.toISOString()}`);
  }

  return now;
}

// By default, this is FALSE - set to TRUE to simulate trial expiration
// This acts as a global switch for the entire application
export const SIMULATE_FUTURE_DATE = false;
