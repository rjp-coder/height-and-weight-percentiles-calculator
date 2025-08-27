import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useState, useMemo, useCallback, useContext } from "react";
import { DataContext } from "./App.jsx";
import { AgGridReact } from "ag-grid-react";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
export const WhoTable = () => {
  const { whoTableParams, gridRef } = useContext(DataContext);
  let title, dataset, relevantMonth, targetValue;
  if (whoTableParams)
    ({ title, dataset, relevantMonth, targetValue } = whoTableParams);
  console.log("WhoTable rendered with props:", {
    title,
    dataset,
    relevantMonth,
    targetValue,
  });

  //TODO the first relevant month sticks forever
  const columnHeadings = [
    "Month",
    "1st",
    "5th",
    "10th",
    "25th",
    "50th",
    "75th",
    "90th",
    "95th",
    "99th",
  ];

  const getCellClass = (params) => {
    if (params.data.Month != relevantMonth) {
      return; // don't bother deciding whether to highlight individual cells on non-relevant months
    }
    console.log(
      "get cell class has been called with params, ",
      JSON.stringify({ targetValue })
    );
    if (targetValue == params.value) {
      //if an exact match, highlight that cell
      return "highlightedTableCell";
    } else {
      //more likely, if target is not an exact match,
      //find the closest values to the targetValue
      //call them tSmaller and tLarger
      let tSmaller = -Infinity;
      let tLarger = Infinity;
      for (let entry of Object.entries(params.data)) {
        const [key, value] = entry;
        /*skip fields that are not percentiles. Percentiles must contain a number, 
          so if there's no number it's not a percentile. */
        if (!/[0-9]/.test(key)) continue;
        if (!columnHeadings.includes(key))
          continue; /* exclude any hidden percentile columns by checking the column headings */

        if (
          +value < +targetValue &&
          +targetValue - value < +targetValue - tSmaller
        ) {
          tSmaller = value;
        } else if (
          +value > +targetValue &&
          +value - targetValue < tLarger - targetValue
        ) {
          tLarger = value;
        }
      }
      console.log({ tSmaller, tLarger, targetValue, value: params.value });
      if (
        [tSmaller, tLarger].includes(params.value) &&
        +params.data.Month === +relevantMonth
      ) {
        //highlight the two near cells of the relevant row/month
        return "highlightedTableCell";
      }
    }
  };

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState(
    columnHeadings.map((heading) => ({
      field: heading,
      cellClass: getCellClass,
    }))
  );

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitGridWidth",
      defaultMinWidth: 60,
    };
  }, []);

  const getRowClass = useCallback((params) => {
    if (+params.data.Month === +relevantMonth) {
      return "highlightedTableRow";
    }
  }, []);

  const scrollToMonth = (params) => {
    params.api.ensureIndexVisible(relevantMonth, "middle"); // Ensure the last row is visible
    params.api.redrawRows();
  };

  if (!dataset || !dataset.length) {
    return null;
  }

  const mapPercentiles = (dataset) => {
    return dataset.map((row) => {
      const mapped = {
        "1st": row.P1,
        "5th": row.P5,
        "10th": row.P10,
        "25th": row.P25,
        "50th": row.P50,
        "75th": row.P75,
        "90th": row.P90,
        "95th": row.P95,
        "99th": row.P99,
      };
      return {
        ...mapped,
        ...row,
      };
    });
  };

  return (
    // Data Grid will fill the size of the parent container
    <div className="m-4 lg:m-auto max-w-4xl" style={{ height: 500 }}>
      <h2 className="text-2xl text-center mb-4">{title}</h2>
      {/* Ag-Grid React Component */}
      <AgGridReact
        rowData={mapPercentiles(dataset)}
        columnDefs={colDefs}
        autoSizeStrategy={autoSizeStrategy}
        suppressColumnVirtualisation={true}
        getRowClass={getRowClass}
        onGridReady={scrollToMonth}
        onRowDataUpdated={scrollToMonth}
        ref={gridRef}
      />
    </div>
  );
};
