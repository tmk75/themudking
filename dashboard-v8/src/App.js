import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KanbanDashboard from './KanbanDashboard';
import KanbanV8 from './KanbanV8';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KanbanDashboard />} />
        <Route path="/v8" element={<KanbanV8 />} />
      </Routes>
    </Router>
  );
};

export default App;