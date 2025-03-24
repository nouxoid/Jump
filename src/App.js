import React from 'react';
import Game from './components/Game';
import Score from './components/Score';
import StartButton from './components/StartButton';
import Instructions from './components/Instructions';

const App = () => {
  return (
    <div className="game-container">
      <Score />
      <Game />
      <div className="controls">
        <StartButton />
        <Instructions />
      </div>
    </div>
  );
};

export default App;
