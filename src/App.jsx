import { AllInOnePercentileCalculator } from "./AllInOnePercentileCalculator.tsx";
import "./App.css";
import { data as dataBoysHeight0to2 } from "./data/boys_height_percentages_age_0_to_2.js";
import { data as dataBoysHeight2to5 } from "./data/boys_height_percentages_age_2_to_5.js";
import { data as dataBoysHeight5to19 } from "./data/boys_height_percentages_age_5_to_19.js";
import { data as dataBoysWeight0to5 } from "./data/boys_weight_percentages_age_0_to_5.js";
import { data as dataBoysWeight5to10 } from "./data/boys_weight_percentages_age_5_to_10.js";
import { data as dataGirlsHeight0to2 } from "./data/girls_height_percentages_age_0_to_2.js";
import { data as dataGirlsHeight2to5 } from "./data/girls_height_percentages_age_2_to_5.js";
import { data as dataGirlsHeight5to19 } from "./data/girls_height_percentages_age_5_to_19.js";
import { data as dataGirlsWeight0to5 } from "./data/girls_weight_percentages_age_0_to_5.js";
import { data as dataGirlsWeight5to10 } from "./data/girls_weight_percentages_age_5_to_10.js";
import { parseData, removeYearMonth } from "./dataParser.ts";

function getData() {
  return {
    girls: {
      height: [
        ...parseData(dataGirlsHeight0to2),
        ...parseData(dataGirlsHeight2to5),
        ...parseData(dataGirlsHeight5to19),
      ],
      weight: [
        ...parseData(dataGirlsWeight0to5),
        ...parseData(removeYearMonth(dataGirlsWeight5to10)),
      ],
    },
    boys: {
      height: [
        ...parseData(dataBoysHeight0to2),
        ...parseData(dataBoysHeight2to5),
        ...parseData(dataBoysHeight5to19),
      ],
      weight: [
        ...parseData(dataBoysWeight0to5),
        ...parseData(removeYearMonth(dataBoysWeight5to10)),
      ],
    },
  };
}

const allData = getData();
globalThis.allData = allData;

export function App() {
  globalThis.getAllData = getData.bind(this);
  return (
    <>
      <main>
        <AllInOnePercentileCalculator allData={allData} />
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

export default App;
