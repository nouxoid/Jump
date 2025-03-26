import React from 'react';
import Game from './components/Game';
import Score from './components/Score';
import StartButton from './components/StartButton';
import Instructions from './components/Instructions';
import Customization from './components/Customization';

const App = () => {
  const handleDinoColorChange = (color) => {
    // Handle dinosaur color change
  };

  const handleBackgroundThemeChange = (theme) => {
    // Handle background theme change
  };

  return (
    <div className="game-container">
      <Score />
      <Game />
      <div className="controls">
        <StartButton />
        <Instructions />
        <Customization
          onDinoColorChange={handleDinoColorChange}
          onBackgroundThemeChange={handleBackgroundThemeChange}
        />
      </div>
    </div>
  );
};

export default App;
