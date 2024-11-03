// src/components/AddWordsForm.js

import React, { useState } from 'react';
import axios from 'axios';

const AddWordsForm = ({ roomId, onClose }) => {
    const [plant, setPlant] = useState('');
    const [animal, setAnimal] = useState('');
    const [famousPerson, setFamousPerson] = useState('');
    const [place, setPlace] = useState('');
    const [brand, setBrand] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://ec2-18-234-44-48.compute-1.amazonaws.com/api/words/', {
                related_to_room: roomId,
                plant,
                animal,
                famous_person: famousPerson,
                place,
                brand,
            });
            // Handle the response as needed
            console.log(response.data);
            onClose(); // Close the form after successful submission
        } catch (error) {
            console.error('There was an error adding the words!', error);
            // Optionally handle errors here
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-words-form">
            <h2>Add Words to Room {roomId}</h2>
            <input
                type="text"
                placeholder="Plant"
                value={plant}
                onChange={(e) => setPlant(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Animal"
                value={animal}
                onChange={(e) => setAnimal(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Famous Person"
                value={famousPerson}
                onChange={(e) => setFamousPerson(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Place"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
            />
            <button type="submit">Add Words</button>
            <button type="button" onClick={onClose}>Cancel</button>
        </form>
    );
};

export default AddWordsForm;