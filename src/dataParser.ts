type DataRow = {
  Month: string;
  L: string;
  M: string;
  S: string;
};

export function removeColumns(array, indexes) {
  const parts = [];
  indexes.forEach((columnIndexToIgnore, i) => {
    if (columnIndexToIgnore < 0) {
      // if the index is negative, this allows it to count down from the right
      // just like in the array.at() function.
      indexes[i] += array.length;
    }
  });
  for (let j = 0; j < array.length; j++) {
    if (indexes.includes(j) || indexes.includes(j + array.length)) {
      continue; // Skip ignored columns
    }
    const part = array[j];
    parts.push(part);
  }
  return parts;
}

export function removeYearMonth(rawData) {
  if (!rawData) {
    const error = new Error("No data provided to parseData function");
    console.error(error.stack);
    throw error;
  }

  let lines = rawData.split("\n");

  const parsedData: DataRow[] = [];

  //special case, this is the header line
  if (!lines[0].toLowerCase().includes("year: month")) {
    throw "While parsing the first line of raw input, expected it to be the header line with 'year: month' inside";
  }
  const headerLineWithYearMonthRemoved = lines[0].replace(/year: month/i, "");
  parsedData.push(headerLineWithYearMonthRemoved.trimLeft());

  let trailingCharacter = null;
  //deliberately skip first line, as that's the header line
  for (let i = 1; i < lines.length; i++) {
    //Example line is of format:
    //Year: Month lifeInMonths L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
    //5: 1 61 -0.4681 18.2579 0.14295 13.4 14.2 14.6 15.8 16.6 18.3 20.2 21.3 23.4 24.3 26.2
    const line = lines[i];
    // if the line is just a newline, we want to keep it as is. This is to maintain any trailing newline in the
    // raw data.
    if (i == lines.length - 1) {
      if (line.length === 1) {
        trailingCharacter = line;
      } else if (line.length == 0) {
        //must have split on the newline
        trailingCharacter = "\n";
      }
    }
    if (line.length == 0) continue; // Skip empty lines so long as it's not the last line
    const lineWithYearMonthRemoved = line.split(/[0-9]{1,2}:\s?[0-9]{1,2}/)[1];
    parsedData.push(lineWithYearMonthRemoved.trimLeft());
  }
  return parsedData.join("\n") + (trailingCharacter ? trailingCharacter : "");
}

export function parseData(rawData) {
  if (!rawData) {
    const error = new Error("No data provided to parseData function");
    console.error(error.stack);
    throw error;
  }
  let lines = rawData.split("\n").filter((line) => line.trim().length);

  let headerLine = lines[0];
  const headers = headerLine.split(/\s+/).filter((h) => h.length > 0);

  const rows: Array<Record<string, number>> = [];
  for (let i = 1; i < lines.length; i++) {
    //Example line is of format:
    //lifeInMonths L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
    //61 -0.4681 18.2579 0.14295 13.4 14.2 14.6 15.8 16.6 18.3 20.2 21.3 23.4 24.3 26.2
    const line = lines[i].trim();
    const lineParts = line.split(/\s+/);
    if (lineParts.length < 15)
      console.warn(`Skipping line due to insufficient data: ${line}`);

    const dataRow: Record<string, number> = {};
    for (let j = 0; j < lineParts.length; j++) {
      const part = lineParts[j];
      const key = headers[j];
      dataRow[key] = part;
    }
    rows.push(dataRow);
  }

  return rows;
}

/** given a key like 'P99' or '50th', return just the number: e.g. 99 or 50 */
export function interpretPercentageKey(key) {
  if (
    key.endsWith("th") ||
    key.endsWith("st") ||
    key.endsWith("nd") ||
    key.endsWith("rd")
  ) {
    return parseInt(key.substring(0, key.length - 2));
  }
  if (key.toUpperCase().startsWith("P")) {
    const str = key.replace(/[a-zA-Z]/g, "");
    const int = parseInt(str);
    if ((int < 10 && str.length > 1) || (str.length > 2 && int > 100)) {
      // special case, the key has leading zeroes, interpret that as a division by that many zeroes
      return int / 10;
    }
    return int;
  }
}

export type Result = {
  lowestPossibleValue: number;
  highestPossibleValue: number;
  percentile: number;
  error?: string;
};

export function calculatePercentile(
  ageInMonths: number,
  measurement: number,
  measurementLabel: string,
  allData: DataRow[]
): Result | { error: string } {
  console.assert(ageInMonths > 0);
  ageInMonths = Math.round(ageInMonths);
  if (!measurement) return { error: `Need to specify ${measurementLabel}` };
  const row = allData.find((d) => +d.Month === ageInMonths);
  if (!row) {
    console.warn(`No data found for age ${ageInMonths} months`);
    console.log(allData);
    return {
      error: `No data could be found for age ${ageInMonths} months. Data is only available up till ${Math.floor(
        +allData.at(-1).Month / 12
      )} years (${allData.at(-1).Month} months)`,
    };
  }
  const rowPercentiles = [];
  for (let key in row) {
    const percentageKey = interpretPercentageKey(key);
    if (percentageKey) {
      rowPercentiles[percentageKey] = row[key];
    }
  }

  /* rowPercentiles is a special array with non-standard indexes,
  e.g. 0.1. When calling Object keys on an array like this, the keys are
  not guaranteed to be in order, so we need to sort them.*/
  const unsortedRowPercentileKeys = Object.keys(rowPercentiles);
  const rowPercentileKeys = unsortedRowPercentileKeys.sort((a, b) => {
    return +a - +b;
  });

  let m1 = rowPercentileKeys.findIndex(
    (k) => +measurement <= rowPercentiles[k]
  );
  if (m1 === -1) {
    console.warn(
      `${measurementLabel} ${measurement} not found in percentiles for age ${ageInMonths} months`
    );
    const lastKey = rowPercentileKeys.length - 1;
    m1 = lastKey;
  }
  let m0 = Math.max(m1 - 1, 0);
  if (rowPercentiles[rowPercentileKeys[m1]] === measurement) {
    m0 = m1;
  }

  const lowerEndKey = parseFloat(rowPercentileKeys[m0]);
  const upperEndKey = parseFloat(rowPercentileKeys[m1]);

  const lowerPercentile = +rowPercentiles[lowerEndKey];
  const upperPercentile = +rowPercentiles[upperEndKey];

  let p;
  try {
    p = getPrecisePercentile(
      lowerEndKey,
      lowerPercentile,
      upperEndKey,
      upperPercentile,
      measurement
    );
  } catch (e) {
    return {
      error:
        "A data error has occured. Percentage values for interpolation can have a maximum of 1 decimal places. Please report the error by raising an issue on github.",
    };
  }

  const k0 = rowPercentileKeys[0];
  const kLast = rowPercentileKeys.at(-1);
  const percentile = Math.max(Math.min(+kLast, +p), +k0);

  return {
    lowestPossibleValue: +rowPercentiles[k0],
    highestPossibleValue: +rowPercentiles[kLast],
    percentile,
    error: null,
  };
}

export function getPrecisePercentile(
  lowerPercentile: number,
  lowerMeasure: number,
  upperPercentile: number,
  upperMeasure: number,
  measurementValue: number
) {
  if (lowerPercentile === upperPercentile) {
    // if the percentiles are the same, we can just return that percentile
    return lowerPercentile;
  }
  const maxAcceptableLength = lowerPercentile > 99 ? 4 : 3; //e.g.  99.9 is 4 characters long and 0.1 is 3 characters long,
  if (
    ("" + lowerPercentile).length > maxAcceptableLength ||
    ("" + upperPercentile).length > maxAcceptableLength
  ) {
    throw new Error(
      "Percentile values passed in are not supported when more than one decimal place"
    );
  }
  const percentileGap = upperPercentile - lowerPercentile;
  const weightGap = Math.round((upperMeasure - lowerMeasure) * 1000) / 1000;
  const weightPerPercentile = weightGap / percentileGap;
  const weightPerTenthPercentile = weightPerPercentile / 10;
  let m1 = lowerMeasure;
  let p1 = lowerPercentile;
  while (m1 < measurementValue) {
    // find the first measure that would exceed the target value
    m1 += weightPerTenthPercentile;
    // and with it the corresponding percentile
    p1 += 0.1;
  }

  // it might be that the measurement before m1 is closer to the target
  // so define this
  const m0 = m1 - weightPerTenthPercentile;
  // and its corresponding percentile
  const p0 = p1 - 0.1;

  // and check whether m1 is further over the target than m0 is under
  const diff = m1 - measurementValue;
  const diff2 = measurementValue - m0;

  // then choose the percentile that would have the smallest diff -- i.e. be the least innacurate
  if (diff <= diff2) {
    return Math.round(p1 * 10) / 10;
  } else {
    return Math.round(p0 * 10) / 10;
  }
}
