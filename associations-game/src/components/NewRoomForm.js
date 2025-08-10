import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewRoomForm.css'; // Import the CSS file

const NewRoomForm = ({ onRoomCreated }) => {
    const [roomName, setRoomName] = useState('');
    const [players, setPlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await axios.get('/api/players/');
            setPlayers(response.data);
        };
        fetchPlayers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await axios.post('/api/rooms/', {
            name: roomName,
            players: selectedPlayers,  // assuming your Room model has a ManyToMany field for players
        });
        console.log(response.data);
        onRoomCreated(response.data); // Notify parent component
        setRoomName('');
        setSelectedPlayers([]);
    };

    const togglePlayerSelection = (id) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(playerId => playerId !== id)); // Remove from selected
        } else {
            setSelectedPlayers(prev => [...prev, id]); // Add to selected
        }
    };

    return (
        <div className="new-room-form-container">
            <form onSubmit={handleSubmit} className="form">
                <h2>Create a New Room</h2>
                <input
                    type="text"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                    className="room-name-input"
                />
                <div className="players-selection">
                    <div className="available-players">
                        <h3>Available Players</h3>
                        {players
                            .filter(player => !selectedPlayers.includes(player.id)) // Only show unselected players
                            .map(player => (
                                <div
                                    key={player.id}
                                    className="player-item"
                                    onClick={() => togglePlayerSelection(player.id)} // Toggle selection on click
                                >
                                    {player.name}
                                </div>
                            ))}
                    </div>
                    <div className="selected-players">
                        <h3>Selected Players</h3>
                        {selectedPlayers.map(id => {
                            const player = players.find(p => p.id === id);
                            return player ? (
                                <div
                                    key={player.id}
                                    className="player-item"
                                    onClick={() => togglePlayerSelection(player.id)} // Toggle selection on click
                                >
                                    {player.name}
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
                <button type="submit" className="submit-button">Create Room</button>
            </form>
        </div>
    );
};

export default NewRoomForm;