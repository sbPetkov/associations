import React, { useState } from 'react';
import './App.css'; // Import the CSS file
import PlayerForm from './components/PlayerForm';
import RoomList from './components/RoomList';
import AddWordsForm from './components/AddWordsForm';
import NewRoomForm from './components/NewRoomForm'; // Import the new room form
import Game from './components/Game';

const App = () => {
    const [showAddWords, setShowAddWords] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [showNewRoomForm, setShowNewRoomForm] = useState(false);
    const [showGame, setShowGame] = useState(false); // Track if the game is being played
    const [players, setPlayers] = useState([]); // Players array to pass to Game component
    const [showPlayerForm, setShowPlayerForm] = useState(true); // Track if the player form is displayed

    const handlePlayerCreated = (player) => {
        console.log('Player created:', player);
    };

    const handleAddWords = (roomId) => {
        setCurrentRoomId(roomId);
        setShowAddWords(true); // Show only the Add Words form
    };

    const handleCloseForm = () => {
        setShowAddWords(false);
        setCurrentRoomId(null); // Reset the room ID when closing the form
    };

    const handleRoomCreated = () => {
        setShowNewRoomForm(false); // Hide the new room form after creation
    };

    const handleJoinRoom = (roomId) => {
        setCurrentRoomId(roomId);
        setShowGame(true); // Show the game when a room is joined
        setShowPlayerForm(false); // Hide the player form when a room is joined
    };

    return (
        <div className="app">
            <h1>Associations Game</h1>

            {/* Show only Add Words Form if it's enabled */}
            {showAddWords ? (
                <div className="add-words-form-container">
                    <AddWordsForm roomId={currentRoomId} onClose={handleCloseForm}/>
                </div>
            ) : (
                <>
                    {/* Show Player Form only if game is not started */}
                    {!showGame && showPlayerForm && <PlayerForm onPlayerCreated={handlePlayerCreated}/>}

                    {/* Show New Room Button only if game is not started */}
                    {!showGame && (
                        <button
                            className="new-room-button"
                            onClick={() => setShowNewRoomForm(!showNewRoomForm)}
                        >
                            New Room
                        </button>
                    )}

                    {/* Show New Room Form only if game is not started */}
                    {!showGame && showNewRoomForm && (
                        <div className="new-room-form slide-in">
                            <NewRoomForm onRoomCreated={handleRoomCreated}/>
                        </div>
                    )}

                    {/* Show Game Component if game has started */}
                    {showGame && (
                        <Game roomId={currentRoomId} players={players} onExitGame={() => setShowGame(false)}/>
                    )}

                    {/* Show Room List only if game is not started */}
                    {!showGame && (
                        <div className={`room-list ${showAddWords ? 'fade-out' : ''}`}>
                            <RoomList onAddWords={handleAddWords} onJoinRoom={handleJoinRoom}/>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default App;