import { removeYearMonth } from "./dataParser"; // Adjust the import path as necessary

// describe("dataParser", () => {
//   it("should parse data correctly", () => {
//     const data = `Year: Month Month L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
// 5: 1 61 -0.4681 18.2579 0.14295 13.4 14.2 14.6 15.8 16.6 18.3 20.2 21.3 23.4 24.3 26.2`;
//     const expected = {
//       lifeInMonths: 61,
//       L: -0.4681,
//       M: 18.2579,
//       S: 0.14295,
//       percentiles: [
//         13.4, 14.2, 14.6, 15.8, 16.6, 18.3, 20.2, 21.3, 23.4, 24.3, 26.2,
//       ],
//     };
//     const result = parseData(data, true, 4)[0]; // Assuming parseData returns an array
//     expect(result).toEqual(expected);
//   });
//   it.each([
//     /*the 5th percentile is 10, the 10th percentile is 15,
//     that's one kg per percentile, 8kg is the 13th percentile */
//     [5, 10, 10, 15, 13, 8],
//     /*the 50th percentile is 20, the 75th percentile is 30, that's .4kg per percentile,
//     26kg = 20kg + ( 0.4kg * 15) .
//     50 + 15 is 65.*/
//     [50, 20, 75, 30, 26, 65],
//     /* similarly 28kg is (0.4kg * 20)
//     50 + 20 is 70.*/
//     [50, 20, 75, 30, 28, 70],
//     /* But for 29kg, (0.4kg * 22 = 28.8kg or  (0.4kg * 23 = 29.2kg) could be the answer. The function
//     picks the nearest one, or if equidistant, the higher one, which in this case is 23.
//     50+23  = 73*/
//     [50, 20, 75, 30, 29, 73],
//   ])(
//     "should be able to get the precise percentile for a given weight",
//     (
//       lowerPercentile,
//       lowerWeight,
//       upperPercentile,
//       upperWeight,
//       weight,
//       expected
//     ) => {
//       const percentile = getPrecisePercentile(
//         lowerPercentile,
//         lowerWeight,
//         upperPercentile,
//         upperWeight,
//         weight
//       ); // Implement this function to calculate the percentile based on the parsed data and weight
//       expect(percentile).toEqual(expected); // Adjust the expected value based on your logic
//     }
//   );
// });

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
    console.log("input", JSON.stringify(input));
    console.log("output", JSON.stringify(removeYearMonth(input)));
    console.log("expected", JSON.stringify(expected));
    expect(JSON.stringify(removeYearMonth(input))).toEqual(
      JSON.stringify(expected)
    );
  });
});
