import { useRef, useState } from "react";
import {
  interpretDob,
  getTimeTillNowInMonths,
  formatAge,
  getOrdinalSuffix,
  interpretAge,
} from "./dateLogic";
import "./App.css";
import { calculatePercentile, Result } from "./dataParser";

export const AllInOnePercentileCalculator = ({ allData }) => {
  const [age, setAge] = useState(""); // age in months
  const [weight, setWeight] = useState(""); //weight
  const [height, setHeight] = useState(""); //height
  const [result, setResult] = useState(undefined);
  const interpretedAge = useRef(0);

  if (!allData) alert(234);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="pb-10 text-center">Percentile Calculator</h1>
      <div className="grid sm:grid-cols-3">
        <div>
          <LabelledInput
            label="Date of Birth or Age"
            onChange={(e) => {
              setAge(e.target.value);
              interpretedAge.current = interpretAge(e.target.value);
            }}
            value={age}
          />
          <p className="text-center">{formatAge(interpretedAge.current)}</p>
          <LabelledInput
            label="Weight"
            onChange={(e) => setWeight(e.target.value)}
            value={weight}
          />
          <LabelledInput
            label="Height"
            onChange={(e) => setHeight(e.target.value)}
            value={height}
          />
          <button
            id="calculate_percentile"
            className="w-1/1"
            onClick={() => {
              const result = { boys: {}, girls: {} };
              const measurements = { height, weight };
              for (let measure in measurements) {
                for (let sex of ["boys", "girls"]) {
                  console.log(sex, measure);
                  result[sex][measure] = calculatePercentile(
                    interpretedAge.current,
                    measurements[measure],
                    measure,
                    allData[sex][measure]
                  );
                }
              }
              setResult(result);
            }}
          >
            Go
          </button>
        </div>
        <CombinedResultBox
          age={"" + formatAge(interpretedAge.current)}
          result={result}
        />
      </div>
    </section>
  );
};

const LabelledInput = ({ label, value, onChange }) => {
  return (
    <>
      <label
        className="block text-lg font-bold mb-2 text-center"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        className="border-2 border-gray-300 rounded-md mb-2 text-center w-1/1"
        id={label}
        onChange={(e) => onChange(e)}
        value={value}
      ></input>
    </>
  );
};

type CombinedResult = {
  boys: { height?: Result; weight?: Result; error?: string };
  girls: { height?: Result; weight?: Result; error?: string };
};

const CombinedResultBox = ({
  age,
  result,
}: {
  age: string;
  result: CombinedResult;
  className: string;
}) => {
  if (!result) return null;

  const { boys, girls } = result;

  return (
    <div className="grid sm:grid-cols-2 sm:col-span-2 py-10">
      <p className="sm:col-span-2 text-center text-2xl m-auto">Age {age}</p>
      <SingleResultBox className="bg-blue-400 " gender="Boys" results={boys} />
      <SingleResultBox
        className="bg-pink-400 "
        gender="Girls"
        results={girls}
      />
    </div>
  );
};

const SingleResultBox = ({ className, gender, results }) => {
  console.log(results);
  return (
    <div className={className + " border-4 rounded-xl mx-2 my-2"}>
      <h3 className="text-center">{gender}' percentile</h3>
      {results.height.error || results.weight.error ? (
        <>
          <p>{results.height.error}</p>
          <p>{results.weight.error}</p>
        </>
      ) : (
        <>
          <h4 className="text-4xl text-center">
            {Math.round(results.height.percentile)}
            <span className="text-2xl">
              {getOrdinalSuffix(Math.round(results.height.percentile))}
            </span>
            <span className="text-xs"> for height</span>
          </h4>
          <h4 className="text-4xl text-center">
            {Math.round(results.weight.percentile)}
            <span className="text-2xl">
              {getOrdinalSuffix(Math.round(results.weight.percentile))}
            </span>
            <span className="text-xs"> for weight</span>
          </h4>
        </>
      )}
    </div>
  );
};
