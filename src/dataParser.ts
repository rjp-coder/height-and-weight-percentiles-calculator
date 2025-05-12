type DataRow = {
  lifeInMonths: number;
  L: number;
  M: number;
  S: number;
  percentiles: number[]; // Array of percentiles
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

export function parseData(
  rawData,
  skipFirstLine = false,
  removeYearMonth = false
) {
  if (!rawData) {
    const error = new Error("No data provided to parseData function");
    console.error(error.stack);
    throw error;
  }

  let lines = rawData.split("\n").filter((line) => line.trim().length);

  if (skipFirstLine) {
    lines = lines.slice(1); // Skip the first line if needed
  }
  const parsedData: DataRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    //Example line is of format:
    //Year: Month lifeInMonths L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
    //5: 1 61 -0.4681 18.2579 0.14295 13.4 14.2 14.6 15.8 16.6 18.3 20.2 21.3 23.4 24.3 26.2
    const line = lines[i];
    let relevantPartsOfLine = line.trim();
    if (removeYearMonth) {
      relevantPartsOfLine = line.split(/[0-9]{1,2}:\s?[0-9]{1,2}/)[1].trim(); // Extract the rest of the line
    }
    const partsWithMaybeInsufficientColumns = relevantPartsOfLine.split(/\s+/);
    if (partsWithMaybeInsufficientColumns.length < 15)
      console.warn(`Skipping line due to insufficient data: ${line}`);
    const parts: Array<string> = [];

    //TODO allow a percentages parameter to be passed into this function

    const lifeInMonths = parseInt(parts[0]);
    const L = parseFloat(parts[1]);
    const M = parseFloat(parts[2]);
    const S = parseFloat(parts[3]);
    //1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
    const percentiles = parts.slice(4).map(parseFloat);

    parsedData.push({
      lifeInMonths,
      L,
      M,
      S,
      percentiles,
    });
  }

  return parsedData;
}

// const percentiles = [1, 3, 5, 15, 25, 50, 75, 85, 95, 97, 99];

export function calculatePercentile(
  ageInMonths,
  measurement,
  measurementLabel,
  allData: DataRow[]
) {
  console.assert(ageInMonths > 0);
  ageInMonths = Math.round(ageInMonths);
  if (!measurement) return { error: `Need to specify ${measurementLabel}` };
  const row = allData.find((d) => d.lifeInMonths === ageInMonths);
  if (!row) {
    console.warn(`No data found for age ${ageInMonths} months`);
    console.table(allData);
    return {
      lowerBound: null,
      upperBound: null,
      percentile: null,
      error: `No data could be found for age ${ageInMonths} months. Data is only available up till ${Math.floor(
        allData.at(-1).lifeInMonths / 12
      )} years (${allData.at(-1).lifeInMonths} months)`,
    };
  }

  let w1 = row.percentiles.findIndex((p) => +measurement <= p);
  if (w1 === -1) {
    console.warn(
      `Weight ${measurement} not found in percentiles for age ${ageInMonths} months`
    );
    w1 = row.percentiles.at(-1);
  }
  let w0 = Math.max(w1 - 1, 0);

  const lowerEnd = row.percentiles[w0];
  const upperEnd = row.percentiles[w1];

  if (row.percentiles.length !== percentiles.length) {
    console.log(row);
    throw new Error(
      `Percentiles length mismatch: expected ${percentiles.length}, got ${row.percentiles.length}`
    );
  }

  const lowerPercentile = percentiles[w0];
  const upperPercentile = percentiles[w1];

  const p = getPrecisePercentile(
    lowerPercentile,
    lowerEnd,
    upperPercentile,
    upperEnd,
    measurement
  );
  return {
    lowerBound: row.percentiles[0],
    upperBound: row.percentiles.at(-1),
    percentile: p,
    error: null,
  };
}

export function getPrecisePercentile(
  lowerPercentile,
  lowerWeight,
  upperPercentile,
  upperWeight,
  weight
) {
  const percentileGap = upperPercentile - lowerPercentile;
  const weightGap = upperWeight - lowerWeight;
  const weightPerPercentile = weightGap / percentileGap;
  let w = lowerWeight;
  let p = lowerPercentile;
  while (w < weight) {
    w += weightPerPercentile;
    p++;
  }
  const w2 = w - weightPerPercentile;
  const p2 = p - 1;

  const diff = w - weight;
  const diff2 = weight - w2;

  if (diff <= diff2) {
    return p;
  } else {
    return p2;
  }
}
