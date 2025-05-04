export function interpretDob(dob) {
  const delimiter = dob.trim().match(/[\/\.\-\s]/)?.[0];
  if (!delimiter) return undefined;
  const parts = dob.trim().split(delimiter);
  if (parts.length !== 3) {
    return undefined;
  }
  let yearPart = parseInt(parts[2]);
  if (yearPart < 50) {
    //if a two-digit year is passed in, assume it's 2000s
    yearPart += 2000;
  }

  if (validateDateParts(yearPart, parts[1] - 1, parts[0]) === false) {
    return undefined;
  }

  const d = new Date(Date.UTC(yearPart, parts[1] - 1, parts[0]));
  return d.toISOString().split("T")[0];
}

export function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function validateDateParts(yearPart, monthPart, dayPart) {
  const yearIsValid = yearPart > 1900 && yearPart < 2100;
  const monthIsValid = monthPart >= 0 && monthPart <= 11;
  const maxDayVal = {
    0: 31,
    1: isLeapYear(yearPart) ? 29 : 28,
    2: 31,
    3: 30,
    4: 31,
    5: 30,
    6: 31,
    7: 31,
    8: 30,
    9: 31,
    10: 30,
    11: 31,
  };
  const dayIsValid = dayPart >= 0 && dayPart <= maxDayVal[monthPart];

  if (!yearIsValid || !monthIsValid || !dayIsValid) {
    return false;
  }

  return true;
}
// function to check if a year is a leap year
