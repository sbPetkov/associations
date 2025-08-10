// src/components/PlayerForm.js

import React, { useState } from 'react';
import axios from 'axios';

const PlayerForm = ({ onPlayerCreated }) => {
    const [playerName, setPlayerName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await axios.post('/api/players/', { name: playerName });
        onPlayerCreated(response.data);
        setPlayerName('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter Player Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
            />
            <button type="submit">Create Player</button>
        </form>
    );
};

export default PlayerForm;