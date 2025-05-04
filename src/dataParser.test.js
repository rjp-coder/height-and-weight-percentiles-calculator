import { parseData, getPrecisePercentile } from "./dataParser"; // Adjust the import path as necessary

describe("dataParser", () => {
  it("should parse data correctly", () => {
    const data = `Year: Month Month L M S 1st 3rd 5th 15th 25th 50th 75th 85th 95th 97th 99th
5: 1 61 -0.4681 18.2579 0.14295 13.4 14.2 14.6 15.8 16.6 18.3 20.2 21.3 23.4 24.3 26.2`;
    const expected = {
      lifeInMonths: 61,
      L: -0.4681,
      M: 18.2579,
      S: 0.14295,
      percentiles: [
        13.4, 14.2, 14.6, 15.8, 16.6, 18.3, 20.2, 21.3, 23.4, 24.3, 26.2,
      ],
    };
    const result = parseData(data, true, 4)[0]; // Assuming parseData returns an array
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
    /* But for 29kg, (0.4kg * 22 = 28.8kg or  (0.4kg * 23 = 29.2kg) could be the answer. The function
    picks the nearest one, or if equidistant, the higher one, which in this case is 23.
    50+23  = 73*/
    [50, 20, 75, 30, 29, 73],
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
