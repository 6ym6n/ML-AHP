import React, { useState, useEffect } from "react";
import axios from "axios";

const MatrixDisplay = () => {
  const [matrix, setMatrix] = useState(null); // State to hold the matrix
  const [ic, setIC] = useState(null); // State to hold the IC value
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(true); // State to handle loading state

  useEffect(() => {
    // Fetch matrix and IC from the Django endpoint
    const fetchMatrix = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/matrix/");
        setMatrix(response.data.matrix); // Set the matrix from the response
        setIC(response.data.consistency.IC); // Set the IC from the response
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchMatrix();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const keys = Object.keys(matrix);

  return (
    <div>
      <table style={{ border: "1px solid #ddd", padding: "8px" }}>
        <thead>
          <tr>
            <th>Criterion</th>
            {keys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((rowKey) => (
            <tr key={rowKey}>
              <td>{rowKey}</td>
              {keys.map((colKey) => (
                <td key={colKey}>{matrix[rowKey][colKey]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "16px", fontWeight: "bold" }}>
        Inconsistency Index (IC): {ic}
      </div>
    </div>
  );
};

export default MatrixDisplay;
