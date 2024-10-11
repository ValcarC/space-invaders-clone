// src/App.jsx
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Space from './Space';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Space />} />
    </Routes>
  );
}

export default App;