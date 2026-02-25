import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Job Portal - Minimal Test</h1>
        <Routes>
          <Route path="/" element={<div>Home Page Works!</div>} />
          <Route path="/test" element={<div>Test Page Works!</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
