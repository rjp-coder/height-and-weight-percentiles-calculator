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

export function getTimeTillNowInMonths(dateString: string) {
  const dob = interpretDob(dateString);
  if (dob) {
    const d = new Date(dob);
    const now = new Date();
    const tNow = now.getTime();
    const tThen = d.getTime();
    const ageInDays = Math.floor((tNow - tThen) / (1000 * 60 * 60 * 24));
    let fullYears = Math.floor(ageInDays / 365);
    let remainingDays = ageInDays % 365;

    //This is a crude approximation
    const AVG_DAYS_IN_A_MONTH = 30.4;

    //
    const ageInMonths =
      fullYears * 12 + Math.round(remainingDays / AVG_DAYS_IN_A_MONTH);

    return ageInMonths;
  }
}

export function getOrdinalSuffix(num) {
  const suffixes = ["th", "st", "nd", "rd"];
  if (num % 100 >= 11 && num % 100 <= 13) {
    //special case for 11, 12, 13 which always use "th"
    return suffixes[0];
  }
  const value = num % 10;
  const suffix = suffixes[value] || suffixes[0];
  return suffix;
}

export function interpretAge(val) {
  //oh boy
  // if this two numbers separated by comma or dot assume the second part is months
  const strVal = "" + val;

  // if the user has actually written years and months in the input, or something that
  // could be interpreted as such, like 5y6m or 5y 6m
  if (val.includes("y") && val.includes("m")) {
    const parts = strVal.split("y");
    const yearPart = parseInt(parts[0]);
    const monthPart = parseInt(parts[1].replace(/[a-zA-Z]/g, ""));
    if (!isNaN(monthPart) && !isNaN(yearPart)) {
      return yearPart * 12 + monthPart;
    }
  }

  const monthsSinceBirth = getTimeTillNowInMonths(val);
  if (monthsSinceBirth) {
    return monthsSinceBirth;
  }

  const parts = strVal.split(/[,]+/);

  if (parts.length === 1) {
    // if this is an int multiply by 12
    const intVal = +val;
    if (isNaN(intVal)) {
      return undefined;
    }
    return intVal * 12;
  }

  if (parts.length === 2) {
    const yearPart = parseInt(parts[0]);
    const monthPart = parseInt(parts[1]);
    if (!isNaN(monthPart) && !isNaN(yearPart)) {
      return yearPart * 12 + monthPart;
    }
  }

  return undefined;
}

export function formatAge(ageInMonths) {
  if (isNaN(ageInMonths)) {
    return "Invalid age";
  }
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  if (months % 1 == 0) {
    return `${years} years, ${months} months`;
  } else {
    return `${
      Math.round(100 * (ageInMonths / 12)) / 100
    } years (or about ${years} years, ${Math.round(months)} months)`;
  }
}
