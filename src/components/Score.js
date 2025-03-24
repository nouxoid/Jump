import React, { useState, useEffect } from 'react';

const Score = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('dinoHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dinoHighScore', highScore);
  }, [highScore]);

  return (
    <div className="score-container">
      <div id="score">{score}</div>
      <div id="high-score">HI: {highScore}</div>
    </div>
  );
};

export default Score;
