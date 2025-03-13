// EditableMatrix.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

const EditableMatrix = () => {
  const [ic, setIC] = useState(null);
  const criteria = [
    "quality",
    "conditions and method of payment",
    "flexibility",
    "price",
    "delivery time",
  ];

  const matrixSize = criteria.length;


  const ahpValuesWithFractions = [
    { value: 1 / 9, label: "1/9" },
    { value: 1 / 8, label: "1/8" },
    { value: 1 / 7, label: "1/7" },
    { value: 1 / 6, label: "1/6" },
    { value: 1 / 5, label: "1/5" },
    { value: 1 / 4, label: "1/4" },
    { value: 1 / 3, label: "1/3" },
    { value: 1 / 2, label: "1/2" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
  ];

  
  const ahpValues = [1 / 9, 1 / 8, 1 / 7, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 1 / 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const [matrix, setMatrix] = useState(
    Array.from({ length: matrixSize }, (_, i) =>
      Array.from({ length: matrixSize }, (_, j) => (i === j ? 1 : ""))
    )
  );

  const handleDropdownChange = (row, col, value) => {
    const selectedValue = parseFloat(value);
  
    // Find the closest reciprocal value from AHP values
    const reciprocalValue = ahpValues.reduce(
      (prev, curr) => (Math.abs(curr - 1 / selectedValue) < Math.abs(prev - 1 / selectedValue) ? curr : prev)
    );
  
    const newMatrix = matrix.map((r, i) => [...r]); // Clone the matrix
    newMatrix[row][col] = selectedValue;
    newMatrix[col][row] = reciprocalValue; // Set reciprocal value from the closest match
    setMatrix(newMatrix);
  };
  


  const [icEditable, setICEditable] = useState(null);
  const [consistentMatrix, setConsistentMatrix] = useState([]);
  const [icConsistent, setICConsistent] = useState(null);
  const [matrice, setMatrice] = useState(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/matrix/");
        setMatrice(response.data.matrix);
        setIC(response.data.consistency.IC);
      } catch (err) {
        console.error("Error fetching Matrice:", err);
      }
    };

    fetchMatrix();
  }, []);

  const handleInputChange = (row, col, value) => {
    const parsedValue = parseFloat(value);
    const closestValue = ahpValues.reduce(
      (prev, curr) => (Math.abs(curr - parsedValue) < Math.abs(prev - parsedValue) ? curr : prev)
    );
    const reciprocalValue = (1 / closestValue).toFixed(2);

    const newMatrix = matrix.map((r, i) => [...r]);
    newMatrix[row][col] = closestValue;
    newMatrix[col][row] = reciprocalValue;
    setMatrix(newMatrix);
  };

  const calculatePriorities = (matrix) => {
    const columnSums = matrix.reduce(
      (acc, row) => acc.map((val, i) => val + parseFloat(row[i])),
      Array(matrix.length).fill(0)
    );
    const normalizedMatrix = matrix.map((row) =>
      row.map((val, i) => parseFloat(val) / columnSums[i])
    );
    return normalizedMatrix.map((row) => row.reduce((a, b) => a + b) / matrix.length);
  };

  const calculateIC = (matrix) => {
    const priorities = calculatePriorities(matrix);
    const weightedSum = matrix.map((row, i) =>
      row.reduce((acc, val, j) => acc + val * priorities[j], 0)
    );
    const lambdaMax = weightedSum.reduce((acc, val, i) => acc + val / priorities[i], 0) / matrix.length;
    const ic = (lambdaMax - matrix.length) / (matrix.length - 1);
    return ic.toFixed(3);
  };

  const generateConsistentMatrix = () => {
    if (!matrice) {
      alert("External Matrice not loaded yet.");
      return;
    }

    let consistentMatrix = [];
    let ic = 1.0;
    
    while (ic / 1.12 >= 0.1) {
      const newMatrix = matrix.map((row, i) => [...row]); // Clone the editable matrix
      let editableCount = 0;
      let externalCount = 0;
    
      // Try to build a consistent matrix using mainly editable values
      for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
          if (i !== j) {
            let source;
    
            // Give preference to editable values
            if (editableCount < matrixSize - 1) { // Allow most of the matrix to be filled with editable values
              source = "editable";
            } else if (externalCount < matrixSize) {
              source = "external"; // Use external values only when necessary
            } else {
              // Once most of the matrix is filled, we can randomly choose between the two
              source = Math.random() < 0.5 ? "editable" : "external";
            }
    
            if (source === "editable") {
              newMatrix[i][j] = matrix[i][j];
              editableCount++;
            } else {
              newMatrix[i][j] = parseFloat(matrice[criteria[i]][criteria[j]]);
              externalCount++;
            }
            newMatrix[j][i] = (1 / newMatrix[i][j]).toFixed(2); // Ensure reciprocity
          }
        }
      }
    
      // Recalculate IC for the newly generated matrix
      ic = calculateIC(newMatrix);
      consistentMatrix = newMatrix; // Update consistentMatrix
    }
    
    // After exiting the loop, set the consistent matrix and IC
    setConsistentMatrix(consistentMatrix);
    setICConsistent(ic);
    
  };

  const colors = ["#ff9999", "#ffcc99", "#ffff99", "#ccff99", "#99ccff"];

  return (
    <div>
            <div className="external-matrix">
        <h3>Matrice cohérente générée par apprentissage supervisé (ML)</h3>
        {matrice ? (
          <div>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th className="header-cell">Critères</th>
                  {criteria.map((criterion, index) => (
                    <th key={index} className={`header-cell color-${index % colors.length}`}>
                      {criterion}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(matrice).map((rowKey, rowIndex) => (
                  <tr key={rowKey}>
                    <td className={`header-cell color-${rowIndex % colors.length}`}>{criteria[rowIndex]}</td>
                    {Object.keys(matrice[rowKey]).map((colKey) => (
                      <td key={colKey}>{matrice[rowKey][colKey]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="result">
              <strong>Indice d'Incohérence (IC):</strong> {ic} <br />
              <strong>Ratio de Cohérence (RC):</strong> {ic / 1.12}

            </div>
          </div>
        ) : (
          <p>Chargement de la matrice...</p>
        )}
      </div>
<div>
  <h3>Matrice à ajuster</h3>
  <table className="matrix-table">
    <thead>
      <tr>
        <th className="header-cell">Critères</th>
        {criteria.map((criterion, index) => (
          <th key={index} className={`header-cell color-${index % colors.length}`}>
            {criterion}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {matrix.map((row, rowIndex) => (
        <tr key={rowIndex}>
          <td className={`header-cell color-${rowIndex % colors.length}`}>
            {criteria[rowIndex]}
          </td>
          {row.map((value, colIndex) => (
            <td key={colIndex}>
              {rowIndex === colIndex ? (
                <input
                  type="text"
                  value={1}
                  readOnly
                  className="readonly-input"
                />
              ) : (
                
                
                <select
                  value={value || ""}
                  onChange={(e) =>
                    handleDropdownChange(rowIndex, colIndex, e.target.value)
                  }
                  className="editable-dropdown"
                >
                  <option value="" disabled>
                    
                  </option>
                  {ahpValuesWithFractions.map((item, idx) => (
                    <option key={idx} value={item.value}>
                      {item.label} {/* Display the fraction label */}
                    </option>
                  ))}
                </select>
                
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

      <button onClick={() => setICEditable(calculateIC(matrix))} className="action-button">
        Calculer IC
      </button><br />
      {icEditable !== null && (
        <div className="result">
          <strong>Indice d'Incohérence (IC):</strong> {icEditable} <br />
          <strong>Ratio de Cohérence (RC):</strong> {icEditable / 1.12}
        </div>
      )}
      <button onClick={generateConsistentMatrix} className="action-button">
      Générer une matrice cohérente
      </button>
      <div className="consistent-matrix">
        <h3>Matrice finale obtenue
        </h3>
        {consistentMatrix.length > 0 ? (
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="header-cell">Critères</th>
                {criteria.map((criterion, index) => (
                  <th key={index} className={`header-cell color-${index % colors.length}`}>
                    {criterion}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consistentMatrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className={`header-cell color-${rowIndex % colors.length}`}>{criteria[rowIndex]}</td>
                  {row.map((value, colIndex) => (
                    <td key={colIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No consistent matrix generated yet.</p>
        )}
        {icConsistent !== null && (
          <div className="result">
            <strong>Indice d'Incohérence (IC):</strong> {icConsistent} <br />
            <strong>Ratio de Cohérence (RC):</strong> {icConsistent / 1.12}
          </div>
        )}
      </div>

    </div>
  );
};

export default EditableMatrix;
