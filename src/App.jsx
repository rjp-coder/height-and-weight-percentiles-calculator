import { useEffect, useState } from "react";
import { debounce } from "lodash";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { parseData, calculateWeightPercentile } from "./dataParser.js";
import { data as dataGirls5to10 } from "./data/girls_weight_percentages_age_5_to_10.js";
import { data as dataGirls0to5 } from "./data/girls_weight_percentages_age_0_to_5.js";
import { data as dataBoys5to10 } from "./data/boys_weight_percentages_age_5_to_10.js";
import { data as dataBoys0to5 } from "./data/boys_weight_percentages_age_0_to_5.js";
import { interpretDob } from "./dateLogic.js";

const skipFirstLine = true;
const allDataGirls = [
  ...parseData(dataGirls0to5, skipFirstLine, false, [4, 14]),
  ...parseData(dataGirls5to10, skipFirstLine, true),
];
const allDataBoys = [
  ...parseData(dataBoys0to5, skipFirstLine, false, [4, 14]),
  ...parseData(dataBoys5to10, skipFirstLine, true),
];

const inputStyle = "border-2 border-gray-300 rounded-md mb-2";
const labelStyle = "block text-lg font-bold mb-2";

function App() {
  const [age, setAge] = useState(undefined); // age in months
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState([undefined, undefined]);

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="pb-10">Weight Percentile Calculator</h1>
        <label className={labelStyle} htmlFor="age">
          Date of Birth or Age
        </label>
        <input
          className={inputStyle}
          id="age"
          onChange={debounce((e) => {
            setAge(interpretAge(e.target.value));
          }, 1000)}
        ></input>
        <label className={labelStyle} htmlFor="weight">
          Weight
        </label>
        <input
          className={inputStyle}
          id="weight"
          onChange={(e) => setWeight(e.target.value)}
          value={weight}
        ></input>
        <button
          id="calculate_weight"
          onClick={() => {
            let resultString = [];
            for (const dataset of [
              { gender: "girls", data: allDataGirls },
              { gender: "boys", data: allDataBoys },
            ]) {
              const result = calculateWeightPercentile(
                age,
                weight,
                dataset.data
              );
              const wp = result.percentile;
              if (result.error) {
                setResult([result.error, ""]);
                return;
              }
              const resultStringForGender = wp
                ? `This Person's weight is in the ${wp}${getOrdinalSuffix(
                    wp
                  )} percentile for ${dataset.gender} of this age.`
                : `Cannot calculate percentile for this age and weight for ${dataset.gender}. Expected a weight between ${result.lowerBound}, and ${result.upperBound}`;
              resultString.push(resultStringForGender);
            }
            setResult(resultString);
          }}
        >
          Go
        </button>
        <p className="text-2xl font-bold ">
          {age ? `Assuming age of ${formatAge(age)}` : ""}
        </p>
        <p className="text-2xl font-bold">{result[0]} </p>
        <p className="text-2xl font-bold">{result[1]} </p>
      </main>
      <footer className="p-20 text-sm text-gray-300 ">
        Age-weight data is from the World Health Organisation. It is not
        guaranteed to be completely accurate. If your height or weight falls
        between the data points, linear interpolation will be used and will not
        be entirely accurate to the curves often shown on the WHO graph. Data
        for 5-10 year olds is from 2007
        https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/weight-for-age-5to10-years
      </footer>
    </>
  );
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

export function formatAge(ageInMonths) {
  if (isNaN(ageInMonths)) {
    return "Invalid age";
  }
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  console.log(years, months);
  if (months % 1 == 0) {
    return `${years} years, ${months} months`;
  } else {
    return `${
      Math.round(100 * (ageInMonths / 12)) / 100
    } years (or about ${years} years, ${Math.round(months)} months)`;
  }
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

  const dob = interpretDob(strVal);
  if (dob) {
    const d = new Date(dob);
    const now = new Date();
    const ageInMonths = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return ageInMonths;
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

export default App;
