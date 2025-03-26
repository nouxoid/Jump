import React, { useState } from 'react';
import Game from './components/Game';
import Score from './components/Score';
import StartButton from './components/StartButton';
import Instructions from './components/Instructions';
import Customization from './components/Customization';
import PlayerNameEntry from './components/PlayerNameEntry';

const App = () => {
  const [playerName, setPlayerName] = useState('');

  const handleDinoColorChange = (color) => {
    // Handle dinosaur color change
  };

  const handleBackgroundThemeChange = (theme) => {
    // Handle background theme change
  };

  const handlePlayerNameSubmit = (name) => {
    setPlayerName(name);
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
        <PlayerNameEntry onSubmit={handlePlayerNameSubmit} />
      </div>
    </div>
  );
};

export default App;
