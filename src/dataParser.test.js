import {
  removeYearMonth,
  parseData,
  interpretPercentageKey,
  getPrecisePercentile,
  calculatePercentile,
} from "./dataParser"; // Adjust the import path as necessary

describe("dataParser", () => {
  it("should parse data correctly", () => {
    const data = `Month L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
61 -0.4681 18.2579 0.14295 13.4 14.2 14.6 15.8 16.6 18.3 20.2 21.3 23.4 24.3 26.2`;
    const expected = {
      Month: "61",
      L: "-0.4681",
      M: "18.2579",
      S: "0.14295",
      "1st": "13.4",
      "3rd": "14.2",
      "5th": "14.6",
      "15th": "15.8",
      "25th": "16.6",
      "50th": "18.3",
      "75th": "20.2",
      "85th": "21.3",
      "95th": "23.4",
      "97th": "24.3",
      "99th": "26.2",
    };
    const result = parseData(data)[0]; // Assuming parseData returns an array
    expect(result).toEqual(expected);
  });
  it.each([
    /*the 5th percentile is 10, the 10th percentile is 15,
    that's one kg per percentile, 8kg is the 13th percentile */
    [5, 10, 10, 15, 13, 8],
    /*the 50th percentile is 20, the 75th percentile is 30, that's .4kg per percentile,
    26kg = 20kg + ( 0.4kg * 15) .
    50 + 15 is 65.*/
    [50, 20, 75, 30, 26, 65],
    /* similarly 28kg is (0.4kg * 20)
    50 + 20 is 70.*/
    [50, 20, 75, 30, 28, 70],
    /* But for 29kg, (0.4kg * 22 = 28.8kg or  (0.4kg * 23 = 29.2kg) could be the answer. The answer is exactly 
    between 22 and 23, so 22.5
    50+22.5  = 72.5*/
    [50, 20, 75, 30, 29, 72.5],
    /* between the extreme values of 99th percentile and 100th. 
    With a weight gap of 50kg. 20 kg would correspond to two fifths of 1, i.e. 0.4
    therefore the percentile would be 99.4. */
    [99, 100, 100, 150, 120, 99.4],
  ])(
    "should be able to get the precise percentile for a given weight",
    (
      lowerPercentile,
      lowerWeight,
      upperPercentile,
      upperWeight,
      weight,
      expected
    ) => {
      const percentile = getPrecisePercentile(
        lowerPercentile,
        lowerWeight,
        upperPercentile,
        upperWeight,
        weight
      ); // Implement this function to calculate the percentile based on the parsed data and weight
      expect(percentile).toEqual(expected); // Adjust the expected value based on your logic
    }
  );
});

describe("interpretPercentageKey", () => {
  it.each([
    ["1st", 1],
    ["3rd", 3],
    ["5th", 5],
    ["15th", 15],
    ["25th", 25],
    ["50th", 50],
    ["75th", 75],
    ["85th", 85],
    ["95th", 95],
    ["97th", 97],
    ["99th", 99],
  ])("should interpret ordinal percentage key %s as %d", (key, expected) => {
    expect(interpretPercentageKey(key)).toEqual(expected);
  });
  it.each([
    ["P01", 0.1],
    ["P1", 1],
    ["P3", 3],
    ["P23", 23],
    ["P999", 99.9],
  ])("should interpret percentage key %s as %d", (key, expected) => {
    expect(interpretPercentageKey(key)).toEqual(expected);
  });
  it("should interpret non-percentage keys as undefined", () => {
    expect(interpretPercentageKey("L")).toEqual(undefined);
    expect(interpretPercentageKey("M")).toEqual(undefined);
    expect(interpretPercentageKey("S")).toEqual(undefined);
  });
});

describe("removeYearMonth", () => {
  const girlsWeightAge5to10 = `Year: Month Month L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th 
5: 1 61 -0.2026 18.5057 0.12988 13.8 14.6 15.0 16.2 17.0 18.5 20.2 21.2 23.0 23.8 25.3
5: 2 62 -0.2130 18.6802 0.13028 13.9 14.7 15.1 16.4 17.1 18.7 20.4 21.4 23.3 24.0 25.6
`;
  const expectedGirlsWeightAge5to10 = `Month L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th 
61 -0.2026 18.5057 0.12988 13.8 14.6 15.0 16.2 17.0 18.5 20.2 21.2 23.0 23.8 25.3
62 -0.2130 18.6802 0.13028 13.9 14.7 15.1 16.4 17.1 18.7 20.4 21.4 23.3 24.0 25.6
`;

  const twoDigitMonth = `Year: Month Month L M S 
5: 1 61 -0.2026 18.5057 0.12988 
5:11 62 -0.2130 18.6802 0.13028 
`;

  const expectedTwoDigitMonth = `Month L M S 
61 -0.2026 18.5057 0.12988 
62 -0.2130 18.6802 0.13028 
`;

  const twoDigitYear = `Year: Month Month L M S 
5: 1 61 -0.2026 18.5057 0.12988 
10: 1 62 -0.2130 18.6802 0.13028 
`;

  const expectedTwoDigitYear = `Month L M S 
61 -0.2026 18.5057 0.12988 
62 -0.2130 18.6802 0.13028 
`;

  const twoDigitMonthYear = `Year: Month Month L M S 
15:10 61 -0.2026 18.5057 0.12988 
12:11 62 -0.2130 18.6802 0.13028 `;

  const expectedTwoDigitMonthYear = `Month L M S 
61 -0.2026 18.5057 0.12988 
62 -0.2130 18.6802 0.13028 `;

  it.each([
    [girlsWeightAge5to10, expectedGirlsWeightAge5to10],
    [twoDigitMonth, expectedTwoDigitMonth],
    [twoDigitYear, expectedTwoDigitYear],
    [twoDigitMonthYear, expectedTwoDigitMonthYear],
  ])("should remove the year month from input", (input, expected) => {
    expect(JSON.stringify(removeYearMonth(input))).toEqual(
      JSON.stringify(expected)
    );
  });
});

describe("calculatePercentile", () => {
  it("should calculate the percentile correctly", () => {
    const ageInMonths = 61;
    const weight = 15.0;
    const allData = [
      {
        Month: "61",
        L: "-0.2026",
        M: "18.5057",
        S: "0.12988",
        "1st": "13.8",
        "3rd": "14.6",
        "5th": "15.0",
        "15th": "16.2",
        "25th": "17.0",
        "50th": "18.5",
        "75th": "20.2",
        "85th": "21.2",
        "95th": "23.0",
        "97th": "23.8",
        "99th": "25.3",
      },
      {
        Month: "62",
        L: "-0.2130",
        M: "18.6802",
        S: "0.13028",
        "1st": "13.9",
        "3rd": "14.7",
        "5th": "15.1",
        "15th": "16.4",
        "25th": "17.1",
        "50th": "18.7",
        "75th": "20.4",
        "85th": "21.4",
        "95th": "23.3",
        "97th": "24.0",
        "99th": "25.6",
      },
    ];
    const result = calculatePercentile(ageInMonths, weight, "weight", allData);
    expect(result.percentile).toEqual(5);
    expect(result.lowestPossibleValue).toEqual(13.8);
    expect(result.highestPossibleValue).toEqual(25.3);
  });
});
