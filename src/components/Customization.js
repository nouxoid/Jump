import React, { useState } from 'react';

const Customization = ({ onDinoColorChange, onBackgroundThemeChange }) => {
  const [dinoColor, setDinoColor] = useState('#5a5');
  const [backgroundTheme, setBackgroundTheme] = useState('desert');

  const handleDinoColorChange = (event) => {
    const newColor = event.target.value;
    setDinoColor(newColor);
    onDinoColorChange(newColor);
  };

  const handleBackgroundThemeChange = (event) => {
    const newTheme = event.target.value;
    setBackgroundTheme(newTheme);
    onBackgroundThemeChange(newTheme);
  };

  return (
    <div className="customization">
      <div className="customization-option">
        <label htmlFor="dino-color">Dinosaur Color:</label>
        <input
          type="color"
          id="dino-color"
          value={dinoColor}
          onChange={handleDinoColorChange}
        />
      </div>
      <div className="customization-option">
        <label htmlFor="background-theme">Background Theme:</label>
        <select
          id="background-theme"
          value={backgroundTheme}
          onChange={handleBackgroundThemeChange}
        >
          <option value="desert">Desert</option>
          <option value="forest">Forest</option>
          <option value="cityscape">Cityscape</option>
        </select>
      </div>
    </div>
  );
};

export default Customization;
