import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './game.css';

const Game = ({ roomId, onExitGame }) => {
    const [words, setWords] = useState([]);
    const [timer, setTimer] = useState(60);
    const [teamQueues, setTeamQueues] = useState({ team1: [], team2: [] });
    const [scores, setScores] = useState({ team1: 0, team2: 0 });
    const [currentTeam, setCurrentTeam] = useState(1);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const [images, setImages] = useState([]);  // State for images
    const [showImages, setShowImages] = useState(false);  // State to toggle image visibility
    const [aiHint, setAiHint] = useState(''); // State for AI hint description

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomResponse = await axios.get(`http://ec2-18-234-44-48.compute-1.amazonaws.com/api/rooms/${roomId}/`);
                const playerIds = roomResponse.data.players;

                const playersResponse = await axios.get(`http://ec2-18-234-44-48.compute-1.amazonaws.com/api/players/`);
                const allPlayers = playersResponse.data.filter(player => playerIds.includes(player.id));

                // Split players into two teams and initialize as queues
                const half = Math.ceil(allPlayers.length / 2);
                const team1Queue = allPlayers.slice(0, half);
                const team2Queue = allPlayers.slice(half);

                setTeamQueues({ team1: team1Queue, team2: team2Queue });
                setCurrentTeam(1);
            } catch (error) {
                console.error('Error fetching room or player data:', error);
            }

            try {
                const wordsResponse = await axios.get(`http://ec2-18-234-44-48.compute-1.amazonaws.com/api/rooms/${roomId}/words/`);
                setWords(wordsResponse.data);
            } catch (error) {
                console.error('Error fetching words:', error);
            }
        };

        fetchData();
    }, [roomId]);

    const startTimer = () => {
        if (timerId) clearInterval(timerId);
        setIsTimerRunning(true);

        const id = setInterval(() => {
            setTimer(prevTimer => {
                if (prevTimer <= 1) {
                    clearInterval(id);
                    setIsTimerRunning(false);
                    endTurn();
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
        setTimerId(id);
    };

    const endTurn = () => {
        clearInterval(timerId);
        setIsTimerRunning(false);
        setTimer(60); // Reset timer for the new turn
        setShowImages(false); // Hide images after turn ends
        setAiHint(''); // Clear AI hint after turn ends

        // Rotate the current player by moving them to the end of their team's queue
        setTeamQueues(prevQueues => {
            const currentTeamKey = `team${currentTeam}`;
            const updatedCurrentTeamQueue = [...prevQueues[currentTeamKey]];
            const currentPlayer = updatedCurrentTeamQueue.shift();
            updatedCurrentTeamQueue.push(currentPlayer);

            return {
                ...prevQueues,
                [currentTeamKey]: updatedCurrentTeamQueue
            };
        });

        // Switch to the opposite team for the next turn
        setCurrentTeam(prevTeam => (prevTeam === 1 ? 2 : 1));
    };

    const guessWord = () => {
        const correctWord = words[0]?.toLowerCase();

        if (isGameStarted && correctWord) {
            setScores(prevScores => ({
                ...prevScores,
                [`team${currentTeam}`]: prevScores[`team${currentTeam}`] + 1
            }));

            const newWords = words.slice(1); // Take all words except the first one
            setWords(newWords);

            if (newWords.length === 0) {
                alert("Game Over!");
            }
            setShowImages(false); // Hide images after guessing
            setAiHint(''); // Clear AI hint after guessing
        }
    };

    const displayWord = () => {
        if (isGameStarted) {
            if (words.length > 0) {
                return <strong>{words[0]}</strong>; // Make the word bold
            } else {
                return "Game Over!";
            }
        }
        return "Click 'Start' to reveal the word!";
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    };

    const startGame = () => {
        const shuffledWords = shuffleArray([...words]); // Create a shuffled copy of the words
        setWords(shuffledWords); // Update the words state with the shuffled array
        setIsGameStarted(true);
        startTimer();
    };

    const nextPlayer = () => {
        const isReady = window.confirm("Are you ready for the next player?");

        if (isReady) {
            const shuffledWords = shuffleArray([...words]); // Create a shuffled copy of the words
            setWords(shuffledWords); // Update the words state with the shuffled array

            startTimer(); // Start the timer for the next player
        }
    };

    const currentPlayer = teamQueues[`team${currentTeam}`][0]?.name;

    // Function to fetch images from the API
    const fetchImages = async () => {
        const word = words[0]; // Get the current word for the hint
        if (word) {
            try {
                const response = await axios.get(`http://ec2-18-234-44-48.compute-1.amazonaws.com/api/image-search/?word=${word}`);
                setImages(response.data.images); // Set images to state
                setShowImages(true); // Show images
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        }
    };

    // Function to fetch AI hint from the API
    const fetchAIHint = async () => {
        const word = words[0]; // Get the current word
        if (word) {
            try {
                const response = await axios.post(`http://ec2-18-234-44-48.compute-1.amazonaws.com/api/get-word-description/`, { word });
                setAiHint(response.data.description); // Set AI hint to state
            } catch (error) {
                console.error('Error fetching AI hint:', error);
            }
        }
    };

    return (
        <div className="game-container">
            <h1>Word Guessing Game</h1>
            <div className="game-info">
                <div className={`timer ${timer < 10 ? 'timer-danger' : 'timer-normal'}`}>
                    Timer: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </div>

                <div className="word-display">
                    {/* Hide word when time is up or game hasn't started */}
                    {(isGameStarted && isTimerRunning) ? displayWord() : null}
                </div>
            </div>

            {!isGameStarted ? (
                <button className="btn start-btn" onClick={startGame}>Start Game</button>
            ) : (
                <>
                    {isTimerRunning && (
                        <>
                            <button className="btn guess-btn" onClick={guessWord}>Guess</button>
                            <button className="btn" onClick={fetchImages}>Image</button> {/* Image button */}
                            <button className="btn" onClick={fetchAIHint}>AI Hint</button> {/* AI Hint button */}
                        </>
                    )}
                    {!isTimerRunning && (
                        <button className="btn next-btn" onClick={nextPlayer}>Next Player</button>
                    )}
                </>
            )}
            <div className="current-player">Current Player: {currentPlayer}</div>
            <div className="teams">
                <div className="team">
                    <div className="score">Score : {scores.team1}</div>
                    <h3>Team 1</h3>
                    <ul>
                        {teamQueues.team1.map((player, index) => (
                            <li key={index}>{player.name}</li>
                        ))}
                    </ul>
                </div>
                <div className="team">
                    <div className="score">Score : {scores.team2}</div>
                    <h3>Team 2</h3>
                    <ul>
                        {teamQueues.team2.map((player, index) => (
                            <li key={index}>{player.name}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {showImages && images.length > 0 && (
                <div className="image-gallery">
                    {images.map((image, index) => (
                        <img key={index} src={image} alt={`Hint for ${words[0]}`} className="hint-image" />
                    ))}
                </div>
            )}

            {aiHint && (
                <div className="ai-hint">
                    <p>{aiHint}</p>
                </div>
            )}
        </div>
    );
};

export default Game;
