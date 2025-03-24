import React, { useState } from 'react';

const StartButton = ({ onStart }) => {
  const [isGameRunning, setIsGameRunning] = useState(false);

  const handleClick = () => {
    setIsGameRunning(true);
    onStart();
  };

  return (
    <div
      id="start-button"
      className="button"
      onClick={handleClick}
      style={{ display: isGameRunning ? 'none' : 'block' }}
    >
      START
    </div>
  );
};

export default StartButton;
