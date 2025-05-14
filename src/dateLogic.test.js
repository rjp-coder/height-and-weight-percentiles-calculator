import {
  interpretDob,
  isLeapYear,
  validateDateParts,
  getTimeTillNowInMonths,
} from "./dateLogic";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("interpretDob", () => {
  it.each([
    ["02-04-2023", "2023-04-02"],
    ["01-01-23", "2023-01-01"],
    ["04-06-47", "2047-06-04"],
    ["01/02/03", "2003-02-01"],
    ["01.02.03", "2003-02-01"],
    ["01 02 2023 ", "2023-02-01"],
  ])("should interpret dob %s correctly", (dob, expected) => {
    expect(interpretDob(dob)).toBe(expected);
  });
  it.each([
    ["invalid-date"],
    ["01-13-2023"],
    ["32/10/23"],
    ["2023.10.01"],
    ["01.2/23"],
  ])("should return undefined for invalid dob format %s", (invalidDob) => {
    expect(interpretDob(invalidDob)).toBe(undefined);
  });
});

describe("isLeapYear", () => {
  it("should return true for leap years", () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2004)).toBe(true);
    expect(isLeapYear(1600)).toBe(true);
  });
  it("should return false for non-leap years", () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2001)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });
});

describe("validateDateParts", () => {
  it("should return true for valid date parts", () => {
    expect(validateDateParts(2023, 0, 1)).toBe(true); // January 1, 2023
    expect(validateDateParts(2020, 1, 29)).toBe(true); // February 29, 2020 (leap year)
    expect(validateDateParts(2023, 11, 31)).toBe(true); // December 31, 2023
  });
  it("should return false for invalid date parts", () => {
    expect(validateDateParts(2023, 0, 32)).toBe(false); // Invalid day
    expect(validateDateParts(2023, 1, 30)).toBe(false); // Invalid day in February
    expect(validateDateParts(2023, 12, 1)).toBe(false); // Invalid month
    expect(validateDateParts(2023, 11, -1)).toBe(false); // Invalid day
  });
});

describe("getTimeTillNowInMonths", () => {
  vi.useFakeTimers();
  it.each([
    ["08-02-20", "May 14 2025 13:00:00", 63],
    ["01-01-20", "February 15 2020 13:00", 1],
    ["01-01-20", "February 16 2020 13:00", 2],
  ])(
    "should return the correct number of months between a given time and now",
    (dateString, now, expectedNumMonths) => {
      const date = new Date(now); // 14th May 2025, 13:00
      vi.setSystemTime(date);
      const m = getTimeTillNowInMonths(dateString);
      expect(m).toEqual(expectedNumMonths);
    }
  );
  vi.useRealTimers();
});
