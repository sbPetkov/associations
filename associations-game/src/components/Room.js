// src/components/Room.js

import React from 'react';
import axios from 'axios';
import './Room.css'; // Import your CSS file

const Room = ({ room, onAddWords, onJoinRoom, onRoomDeleted }) => {

    const handleDelete = async () => {
        // Confirmation dialog
        const confirmDelete = window.confirm("Are you sure you want to delete this room?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/rooms/${room.id}/delete/`);
                onRoomDeleted(room.id); // Notify parent component to update the room list
            } catch (error) {
                console.error("Error deleting room:", error);
            }
        }
    };

    return (
        <div className="room">
            <h3>{room.name}</h3>
            <button onClick={() => onAddWords(room.id)}>Add Words</button>
            <button onClick={() => onJoinRoom(room.id)}>Join Room</button>
            <button className="delete-button" onClick={handleDelete}>Delete Room</button> {/* Delete button styled */}
        </div>
    );
};

export default Room;