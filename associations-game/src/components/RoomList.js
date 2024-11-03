// src/components/RoomList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Room from './Room';

const RoomList = ({ onAddWords, onJoinRoom }) => {
    const [rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        const response = await axios.get('http://ec2-18-234-44-48.compute-1.amazonaws.com/api/rooms/');
        setRooms(response.data);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleRoomDeleted = (roomId) => {
        // Remove the deleted room from the state
        setRooms(rooms.filter(room => room.id !== roomId));
    };

    return (
        <div className="room-list">
            <h2>Available Rooms</h2>
            {rooms.map((room) => (
                <Room
                    key={room.id}
                    room={room}
                    onAddWords={onAddWords}
                    onJoinRoom={onJoinRoom}
                    onRoomDeleted={handleRoomDeleted} // Pass onRoomDeleted to Room
                />
            ))}
        </div>
    );
};

export default RoomList;