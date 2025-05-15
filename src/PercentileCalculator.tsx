import { useRef, useState } from "react";
import "./App.css";
import { formatAge, getOrdinalSuffix, interpretAge } from "./dateLogic";

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

const Result = ({ age, measure, result }) => {
  if (result?.girls?.error || result?.boys?.error) {
    return <p>{result.girls.error || result.boys.error}</p>;
  }
  const resultStrings = [];
  for (let key in result) {
    const wp = result?.[key]?.percentile;
    const resultStringForGender = wp
      ? `This Person's ${measure} is in the ${Math.round(wp)}${getOrdinalSuffix(
          Math.round(wp)
        )} percentile ${
          wp != Math.round(wp) ? `(${wp})` : ""
        } for ${key} of this age.`
      : `Cannot calculate percentile for this age and ${measure} for ${key}. Expected a weight between ${result.lowestPossibleValue}, and ${result.highestPossibleValue}`;
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
