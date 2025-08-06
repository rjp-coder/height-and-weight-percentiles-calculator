import { useRef, useState } from "react";
import { formatAge, getOrdinalSuffix, interpretAge } from "./dateLogic";
import "./App.css";
import { calculatePercentile, Result } from "./dataParser";

export const AllInOnePercentileCalculator = ({ allData, setWhoTable }) => {
  const [age, setAge] = useState(""); // age in months
  const [weight, setWeight] = useState(""); //weight
  const [height, setHeight] = useState(""); //height
  const [result, setResult] = useState(undefined);
  const interpretedAge = useRef(0);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="pb-10 text-center">Percentile Calculator</h1>
      <div className={`grid ${result ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
        <div className="text-center">
          <LabelledInput
            label="Date of Birth or Age"
            onChange={(e) => {
              setAge(e.target.value);
              interpretedAge.current = interpretAge(e.target.value);
            }}
            value={age}
          />
          <p className="text-center italic -mt-5 mb-5">
            {formatAge(interpretedAge.current)}
          </p>
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
            className="w-4/5 mt-4 border-1 border-gray-300 "
            onClick={() => {
              const result = {
                age: interpretedAge.current,
                boys: {},
                girls: {},
              };
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
          age={"" + formatAge(result?.age)}
          result={result}
          setWhoTable={setWhoTable}
        />
      </div>
    </section>
  );
};

const LabelledInput = ({ label, value, onChange }) => {
  return (
    <>
      <label
        className="block text-lg font-bold mb-1 text-center"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        className="border-2 border-gray-300 rounded-md mb-5 m-auto text-center w-4/5"
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
  setWhoTable,
}: {
  age: string;
  result: CombinedResult;
}) => {
  if (!result) return null;

  const { boys, girls } = result;

  return (
    <div className="grid sm:grid-cols-2 sm:col-span-2 py-10">
      <p className="sm:col-span-2 text-center text-2xl m-auto">Age {age}</p>
      <SingleResultBox
        className="bg-blue-400 "
        gender="Boys"
        results={boys}
        setWhoTable={setWhoTable}
      />
      <SingleResultBox
        className="bg-pink-400 "
        gender="Girls"
        results={girls}
        setWhoTable={setWhoTable}
      />
    </div>
  );
};

const SingleResultBox = ({ className, gender, results, setWhoTable }) => {
  console.log(results);
  return (
    <div className={className + " border-4 rounded-xl mx-2 my-2"}>
      <h3 className="text-center">{gender}' percentile</h3>
      <>
        {!results.height.error && (
          <ResultRow
            onClick={() => {
              console.log("About to set who table", results);
              setWhoTable({
                title: `Heights for ${gender.toLowerCase()}`,
                dataset: globalThis.allData[gender.toLowerCase()].height,
                relevantMonth: 0,
                targetValue: results.height.percentile,
              });
            }}
            percentile={results.height.percentile}
            measurement="height"
          />
        )}
        {!results.weight.error && (
          <ResultRow
            onClick={() =>
              setWhoTable({
                title: `Weights for ${gender.toLowerCase()}`,
                dataset: globalThis.allData[gender.toLowerCase()].weight,
                relevantMonth: 3,
                targetValue: 10,
              })
            }
            percentile={results.weight.percentile}
            measurement="weight"
          />
        )}
      </>
    </div>
  );
};

const ResultRow = ({ percentile, measurement, onClick }) => {
  return (
    <h4 onClick={onClick} className="text-4xl text-center">
      {percentile < 2 || percentile > 98 ? percentile : Math.round(percentile)}
      <span className="text-2xl">{getOrdinalSuffix(percentile)}</span>
      <span className="text-xs"> for {measurement}</span>
    </h4>
  );
};
