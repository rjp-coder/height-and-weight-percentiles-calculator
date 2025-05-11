type DataRow = {
  lifeInMonths: number;
  L: number;
  M: number;
  S: number;
  percentiles: number[]; // Array of percentiles
};

export function parseData(
  rawData,
  skipFirstLine = false,
  removeYearMonth = false,
  ignoreColumns: Array<number> = []
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
    const partsWithMaybeExtraColumns = relevantPartsOfLine.split(/\s+/);
    if (partsWithMaybeExtraColumns.length < 15)
      console.warn(`Skipping line due to insufficient data: ${line}`);
    const parts: Array<string> = [];
    for (let i = 0; i < partsWithMaybeExtraColumns.length; i++) {
      if (ignoreColumns.includes(i)) {
        continue; // Skip ignored columns
      }
      const part = partsWithMaybeExtraColumns[i];
      parts.push(part);
    }

    if (ignoreColumns.length > 0) {
      for (const col of ignoreColumns) {
        if (col < parts.length) {
          parts.splice(col, 1); // Remove the ignored column
        }
      }
    }
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

const percentiles = [1, 3, 5, 15, 25, 50, 75, 85, 95, 97, 99];

export function calculateWeightPercentile(
  ageInMonths,
  weight,
  allData: DataRow[]
) {
  console.assert(ageInMonths > 0);
  ageInMonths = Math.round(ageInMonths);
  if (!weight) return { error: "Need to specify weight" };
  const row = allData.find((d) => d.lifeInMonths === ageInMonths);
  if (!row) {
    console.warn(`No data found for age ${ageInMonths} months`);
    console.table(allData);
    return {
      lowerBound: null,
      upperBound: null,
      percentile: null,
      error: `No data could be found for age ${ageInMonths} months. Data is only available up till 10 years old (120 months)`,
    };
  }

  let w1 = row.percentiles.findIndex((p) => +weight <= p);
  if (w1 === -1) {
    console.warn(
      `Weight ${weight} not found in percentiles for age ${ageInMonths} months`
    );
    w1 = row.percentiles.at(-1);
  }
  let w0 = Math.max(w1 - 1, 0);

  const lowerEnd = row.percentiles[w0];
  const upperEnd = row.percentiles[w1];

  if (row.percentiles.length !== percentiles.length) {
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
    weight
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
