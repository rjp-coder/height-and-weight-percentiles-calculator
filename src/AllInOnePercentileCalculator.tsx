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

const inputStyle = "border-2 border-gray-300 rounded-md mb-2";
const labelStyle = "block text-lg font-bold mb-2";

export const AllInOnePercentileCalculator = ({ allData }) => {
  const [age, setAge] = useState(""); // age in months
  const [weight, setWeight] = useState(""); //weight
  const [height, setHeight] = useState(""); //height
  const [result, setResult] = useState(undefined);
  const interpretedAge = useRef(0);

  if (!allData) alert(234);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="pb-10">Percentile Calculator</h1>
      <div className="grid grid-cols-3">
        <div>
          <LabelledInput
            label="Date of Birth or Age"
            onChange={(e) => {
              setAge(e.target.value);
              interpretedAge.current = interpretAge(e.target.value);
            }}
            value={age}
          />
          <p>{formatAge(interpretedAge.current)}</p>
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
          className="grid grid-cols-2"
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

type CombinedResult = {
  boys: { height?: Result; weight?: Result; error?: string };
  girls: { height?: Result; weight?: Result; error?: string };
};

const CombinedResultBox = ({
  age,
  result,
  className,
}: {
  age: string;
  result: CombinedResult;
  className: string;
}) => {
  if (!result) return null;

  const { boys, girls } = result;

  return (
    <div className={className}>
      <p>With age of {age}</p>
      <SingleResultBox
        className="bg-blue-400 "
        gender="Boys"
        heightPercentile={boys.height.percentile}
        heightError={boys.height.error}
        weightPercentile={boys.weight.percentile}
        weightError={boys.weight.error}
      />
      <SingleResultBox
        className="bg-pink-400 "
        gender="Girls"
        heightPercentile={girls.height.percentile}
        heightError={girls.height.error}
        weightPercentile={girls.weight.percentile}
        weightError={girls.weight.error}
      />
    </div>
  );
};

const SingleResultBox = ({
  className,
  gender,
  heightPercentile,
  weightPercentile,
  heightError,
  weightError,
}) => {
  return (
    <div className={className}>
      <h3>{gender}</h3>
      {heightError || weightError ? (
        <>
          <p>{heightError}</p>
          <p>{weightError}</p>
        </>
      ) : (
        <>
          <h4>{getOrdinalSuffix(heightPercentile)}</h4>
          <span> for height</span>
          <h4>{getOrdinalSuffix(weightPercentile)}</h4>
          <span> for weight</span>
        </>
      )}
    </div>
  );
};
