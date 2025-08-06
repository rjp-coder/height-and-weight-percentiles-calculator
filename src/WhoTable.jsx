import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
export const WhoTable = ({
  title,
  dataset,
  relevantMonth,
  targetValue,
  ref,
}) => {
  if (!dataset || !dataset.length) {
    return null;
  }
  const getCellClass = useCallback(
    (params) => {
      //console.log("params", params);
      if (targetValue === params.value) {
        //if an exact match, highlight that cell
        return "highlightedTableCell";
      } else {
        //more likely, if target is not an exact match,
        //find the closest values to the targetValue
        //call them tSmaller and tLarger
        let tSmaller = null;
        let tLarger = null;
        for (let entry of Object.entries(params.data)) {
          const [key, value] = entry;
          if (
            value < targetValue &&
            targetValue - value < (targetValue - tSmaller || Infinity)
          ) {
            tSmaller = value;
          } else if (
            value > targetValue &&
            value - targetValue < (tLarger - targetValue || Infinity)
          ) {
            tLarger = value;
          }
        }
        if (
          [tSmaller, tLarger].includes(params.value) &&
          +params.data.Month === +relevantMonth
        ) {
          //highlight the two near cells of the relevant row/month
          return "highlightedTableCell";
        }
      }
    },
    [relevantMonth, targetValue]
  );

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    { field: "Month", cellClass: getCellClass },
    { field: "1st", cellClass: getCellClass },
    { field: "5th", cellClass: getCellClass },
    { field: "10th", cellClass: getCellClass },
    { field: "25th", cellClass: getCellClass },
    { field: "50th", cellClass: getCellClass },
    { field: "75th", cellClass: getCellClass },
    { field: "90th", cellClass: getCellClass },
    { field: "95th", cellClass: getCellClass },
    { field: "99th", cellClass: getCellClass },
  ]);

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

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitCellContents",
    };
  }, []);

  //const relevantMonth = 3;
  const getRowClass = useCallback((params) => {
    if (+params.data.Month === +relevantMonth) {
      return "highlightedTableRow";
    }
  }, []);

  const onGridReady = (params) => {
    params.api.ensureIndexVisible(relevantMonth, "middle"); // Ensure the last row is visible
  };

  return (
    // Data Grid will fill the size of the parent container
    <div style={{ height: 500 }}>
      <h2 className="text-2xl text-center mb-4">{title}</h2>
      {/* Ag-Grid React Component */}
      <AgGridReact
        rowData={mapPercentiles(dataset)}
        columnDefs={colDefs}
        autoSizeStrategy={autoSizeStrategy}
        suppressColumnVirtualisation={true}
        getRowClass={getRowClass}
        onGridReady={onGridReady}
        ref={ref}
      />
    </div>
  );
};
