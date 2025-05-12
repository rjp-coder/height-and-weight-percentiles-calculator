import { useRef, useState } from "react";
import { interpretDob } from "./dateLogic";
import "./App.css";

const inputStyle = "border-2 border-gray-300 rounded-md mb-2";
const labelStyle = "block text-lg font-bold mb-2";

export const PercentileCalculator = ({
  allData,
  title,
  measure,
  calculationMethod,
}) => {
  const [age, setAge] = useState(""); // age in months
  const [val, setVal] = useState(""); //weight or height
  const [result, setResult] = useState(undefined);
  const interpretedAge = useRef(0);
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="pb-10">{title}</h1>
      <LabelledInput
        label="Date of Birth or Age"
        onChange={(e) => {
          setAge(e.target.value);
          interpretedAge.current = interpretAge(e.target.value);
        }}
        value={age}
      />
      <LabelledInput
        label={measure}
        onChange={(e) => setVal(e.target.value)}
        value={val}
      />
      <button
        id={`calculate_${measure}`}
        onClick={() => {
          const result = {};
          result.boys = calculationMethod(
            interpretedAge.current,
            val,
            allData.boys
          );
          result.girls = calculationMethod(
            interpretedAge.current,
            val,
            allData.girls
          );
          setResult(result);
        }}
      >
        Go
      </button>
      <Result age={interpretedAge.current} result={result} measure={measure} />
    </section>
  );
};

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

  const dob = interpretDob(strVal);
  if (dob) {
    const d = new Date(dob);
    const now = new Date();
    const ageInMonths = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    //FIXME There appears to be a bug where at 1am the month will overflow
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

const LabelledInput = ({ label, value, onChange }) => {
  return (
    <>
      <label className={labelStyle} htmlFor={label}>
        {label}
      </label>
      <input
        className={inputStyle}
        id={label}
        onChange={(e) => onChange(e)}
        value={value}
      ></input>
    </>
  );
};

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

const Result = ({ age, measure, result }) => {
  if (result?.girls?.error || result?.boys?.error) {
    return <p>{result.girls.error || result.boys.error}</p>;
  }
  const resultStrings = [];
  for (let key in result) {
    const wp = result?.[key]?.percentile;
    const resultStringForGender = wp
      ? `This Person's ${measure} is in the ${wp}${getOrdinalSuffix(
          wp
        )} percentile for ${key} of this age.`
      : `Cannot calculate percentile for this age and ${measure} for ${key}. Expected a weight between ${result.lowerBound}, and ${result.upperBound}`;
    resultStrings.push(resultStringForGender);
  }
  return (
    <>
      <p className="text-2xl font-bold ">
        {age ? `Assuming age of ${formatAge(age)}` : ""}
      </p>
      <p className="text-2xl font-bold">{resultStrings[0]} </p>
      <p className="text-2xl font-bold">{resultStrings[1]} </p>
    </>
  );
};
