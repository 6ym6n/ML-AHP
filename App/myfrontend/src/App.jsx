import React from 'react';
import EditableMatrix from './Components/EditableMatrix';
import MatrixDisplay from './Components/Matrice';
function App() {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Matrice de Comparaison des critères</h1>
      <EditableMatrix />
    {/* <MatrixDisplay /> */}
    </div>
  );
}

export default App;
