import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './game.css';

const Game = ({ roomId, onExitGame }) => {
    const [words, setWords] = useState([]);
    const [originalWords, setOriginalWords] = useState([]);
    const [timer, setTimer] = useState(60);
    const [teamQueues, setTeamQueues] = useState({ team1: [], team2: [] });
    const [scores, setScores] = useState({ team1: 0, team2: 0 });
    const [currentTeam, setCurrentTeam] = useState(1);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const [aiHint, setAiHint] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomResponse = await axios.get(`/api/rooms/${roomId}/`);
                const playerIds = roomResponse.data.players;

                const playersResponse = await axios.get(`/api/players/`);
                const allPlayers = playersResponse.data.filter(player => playerIds.includes(player.id));

                const half = Math.ceil(allPlayers.length / 2);
                const team1Queue = allPlayers.slice(0, half);
                const team2Queue = allPlayers.slice(half);

                setTeamQueues({ team1: team1Queue, team2: team2Queue });
                setCurrentTeam(1);
            } catch (error) {
                console.error('Error fetching room or player data:', error);
            }

            try {
                const wordsResponse = await axios.get(`/api/rooms/${roomId}/words/`);
                setWords(wordsResponse.data);
                setOriginalWords(wordsResponse.data);
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
        setTimer(60);
        setAiHint('');

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

        setCurrentTeam(prevTeam => (prevTeam === 1 ? 2 : 1));
    };

    const guessWord = () => {
        const correctWord = words[0]?.toLowerCase();

        if (isGameStarted && correctWord) {
            setScores(prevScores => ({
                ...prevScores,
                [`team${currentTeam}`]: prevScores[`team${currentTeam}`] + 1
            }));

            const newWords = words.slice(1);
            setWords(newWords);

            if (newWords.length === 0) {
                alert("You guessed it all! Start next round?");
                const isReady = window.confirm("Start next round?");

                if (isReady) {
                    setWords(shuffleArray([...originalWords]));
                    startTimer();
                }
            }
            setAiHint('');
        }
    };

    const displayWord = () => {
        if (isGameStarted) {
            if (words.length > 0) {
                return <strong>{words[0]}</strong>;
            } else {
                return "Game Over!";
            }
        }
        return "Click 'Start' to reveal the word!";
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffleTeams = () => {
        const allPlayers = [...teamQueues.team1, ...teamQueues.team2];
        const shuffledPlayers = shuffleArray(allPlayers);

        const half = Math.ceil(shuffledPlayers.length / 2);
        const team1Queue = shuffledPlayers.slice(0, half);
        const team2Queue = shuffledPlayers.slice(half);

        setTeamQueues({ team1: team1Queue, team2: team2Queue });
    };

    const startGame = () => {
        const shuffledWords = shuffleArray([...words]);
        setWords(shuffledWords);
        setIsGameStarted(true);
        startTimer();
    };

    const nextPlayer = () => {
        const isReady = window.confirm("Are you ready for the next player?");

        if (isReady) {
            const shuffledWords = shuffleArray([...words]);
            setWords(shuffledWords);

            startTimer();
        }
    };

    const currentPlayer = teamQueues[`team${currentTeam}`][0]?.name;

    const fetchAIHint = async () => {
        const word = words[0];
        if (word) {
            try {
                const response = await axios.post(`/api/get-word-description/`, { word });
                setAiHint(response.data.description);
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
                    {(isGameStarted && isTimerRunning) ? displayWord() : null}
                </div>
            </div>

            {!isGameStarted && (
                <button className="btn shuffle-btn" onClick={shuffleTeams}>Shuffle Teams</button>
            )}

            {!isGameStarted ? (
                <button className="btn start-btn" onClick={startGame}>Start Game</button>
            ) : (
                <>
                    {isTimerRunning && (
                        <>
                            <button className="btn guess-btn" onClick={guessWord}>Guess</button>
                            <button className="btn" onClick={fetchAIHint}>AI Hint</button>
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

            {aiHint && (
                <div className="ai-hint">
                    <p>{aiHint}</p>
                </div>
            )}
        </div>
    );
};

export default Game;