// src/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game'); // Cambia a la ruta del juego
  };

  return (
    <div style={{ textAlign: 'center', margin: '50px' }}>
      <h1>SPACE INVADERS</h1>
      <button onClick={handleStartGame}>Iniciar Juego</button>
    </div>
  );
};

export default Home;