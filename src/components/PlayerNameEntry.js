import React, { useState } from 'react';

const PlayerNameEntry = ({ onSubmit }) => {
  const [playerName, setPlayerName] = useState('');

  const handleChange = (event) => {
    setPlayerName(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(playerName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="player-name">Enter your name:</label>
      <input
        type="text"
        id="player-name"
        value={playerName}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default PlayerNameEntry;
