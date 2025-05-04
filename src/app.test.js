import { getOrdinalSuffix, interpretAge } from "./App";

describe("getOrdinalSuffix", () => {
  it("returns the correct ordinal suffix for a given number", () => {
    expect(getOrdinalSuffix(1)).toBe("st");
    expect(getOrdinalSuffix(2)).toBe("nd");
    expect(getOrdinalSuffix(3)).toBe("rd");
    expect(getOrdinalSuffix(4)).toBe("th");
    expect(getOrdinalSuffix(11)).toBe("th");
    expect(getOrdinalSuffix(12)).toBe("th");
    expect(getOrdinalSuffix(13)).toBe("th");
    expect(getOrdinalSuffix(21)).toBe("st");
    expect(getOrdinalSuffix(22)).toBe("nd");
    expect(getOrdinalSuffix(23)).toBe("rd");
  });
});

describe("interpretAge", () => {
  it("should interpret age correctly", () => {
    expect(interpretAge("5")).toBe(60);
    expect(interpretAge("5.5")).toBe(66);
    expect(interpretAge("5,5")).toBe(65);
    expect(interpretAge("5/6")).toBe(undefined);
    expect(interpretAge("5-6")).toBe(undefined);
    expect(interpretAge("4.6")).toBeCloseTo(55.2, 1);
    expect(interpretAge("8,11")).toBe(107);
  });
});
