
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function BattlePage() {
    const router = useRouter();
    const [gameState, setGameState] = useState('lobby'); // lobby, matching, playing, result
    const [opponent, setOpponent] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [userScore, setUserScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [userAnswered, setUserAnswered] = useState(false);
    const [oppAnswered, setOppAnswered] = useState(false);
    const [logs, setLogs] = useState([]); // Battle log "Opponent answered correctly!"
    const [resultData, setResultData] = useState(null);

    // AI Simulation Refs
    const aiTimerRef = useRef(null);

    const startBattle = async () => {
        setGameState('matching');
        try {
            const res = await fetch('/api/battle/create', { method: 'POST', body: JSON.stringify({}) });
            const data = await res.json();
            if (res.ok) {
                setOpponent(data.opponent);
                setQuestions(data.questions);
                setTimeout(() => setGameState('playing'), 2000); // Dramatic pause
            } else {
                alert(data.error);
                setGameState('lobby');
            }
        } catch (e) {
            console.error(e);
            setGameState('lobby');
        }
    };

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        // Reset for new question
        setTimeLeft(15);
        setUserAnswered(false);
        setOppAnswered(false);

        // Simulate AI
        const aiTime = Math.random() * (opponent.maxTime - opponent.minTime) + opponent.minTime;
        const aiWillBeCorrect = Math.random() < opponent.accuracy;

        aiTimerRef.current = setTimeout(() => {
            setOppAnswered(true);
            if (aiWillBeCorrect) {
                setOppScore(prev => prev + 100);
                addLog(`${opponent.name} answered correctly!`);
            } else {
                addLog(`${opponent.name} got it wrong!`);
            }
        }, aiTime * 1000);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    nextQuestion();
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            clearTimeout(aiTimerRef.current);
        };
    }, [currentQ, gameState]);

    const handleUserAnswer = (option) => {
        if (userAnswered) return;
        setUserAnswered(true);

        const q = questions[currentQ];
        if (option === q.correct_option) {
            const points = 100 + (timeLeft * 2); // Speed bonus
            setUserScore(prev => prev + points);
            addLog(`You answered correctly! (+${points})`);
        } else {
            addLog(`You missed it!`);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
        } else {
            endBattle();
        }
    };

    const endBattle = async () => {
        setGameState('calculating');
        const outcome = userScore > oppScore ? 'win' : (userScore < oppScore ? 'loss' : 'draw');

        try {
            const res = await fetch('/api/battle/submit', {
                method: 'POST',
                body: JSON.stringify({
                    battleId: 'temp', // Using generic ID for now or from create
                    opponentId: opponent.id,
                    userScore,
                    opponentScore: oppScore,
                    outcome
                })
            });
            const data = await res.json();
            setResultData({ ...data, outcome });
            setGameState('result');
        } catch (e) {
            console.error(e);
        }
    };

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 3));
    };

    if (gameState === 'lobby') return (
        <div>
            <Navbar />
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-4xl mb-4">⚔️ Battle Arena</h1>
                <p className="mb-8">Challenge AI opponents in a rapid-fire quiz!</p>
                <div className="card max-w-md mx-auto">
                    <div className="text-6xl mb-4">🤖</div>
                    <button className="btn btn-primary w-full py-4 text-xl" onClick={startBattle}>FIND OPPONENT</button>
                </div>
            </div>
        </div>
    );

    if (gameState === 'matching') return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="text-center animate-pulse">
                <h1>SEARCHING FOR OPPONENT...</h1>
                <p>Matching skill levels...</p>
            </div>
        </div>
    );

    if (gameState === 'playing') return (
        <div className="h-screen flex flex-col" style={{ background: '#1a1a2e', color: '#fff' }}>
            {/* HUD */}
            <div className="flex justify-between p-4 bg-black/30">
                <div className="text-center">
                    <h3>YOU</h3>
                    <div className="text-2xl text-accent">{userScore}</div>
                </div>
                <div className="text-4xl font-bold">{timeLeft}s</div>
                <div className="text-center">
                    <h3>{opponent.name}</h3>
                    <div className="text-2xl text-danger">{oppScore}</div>
                </div>
            </div>

            {/* Battle Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl text-center mb-8">
                    <div className="mb-4 text-sm opacity-50">Question {currentQ + 1}/5</div>
                    <h2 className="text-2xl">{questions[currentQ].text}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                    {['A', 'B', 'C', 'D'].map(opt => (
                        <button key={opt}
                            disabled={userAnswered}
                            className={`p-6 rounded-xl border-2 transition-all ${userAnswered ? 'opacity-50' : 'hover:scale-105'} 
                            ${questions[currentQ].correct_option === opt && userAnswered ? 'border-green-500 bg-green-900/20' : 'border-white/20'}`}
                            onClick={() => handleUserAnswer(opt)}>
                            {questions[currentQ][`option_${opt.toLowerCase()}`]}
                        </button>
                    ))}
                </div>

                {/* Logs */}
                <div className="mt-8 h-20 overflow-hidden text-sm text-center opacity-70">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>

                {userAnswered && (
                    <button className="mt-8 btn btn-primary" onClick={nextQuestion}>
                        {currentQ < 4 ? 'Next Question' : 'Finish Battle'}
                    </button>
                )}
            </div>
        </div>
    );

    if (gameState === 'result') return (
        <div className="h-screen flex items-center justify-center bg-black text-white text-center">
            <div className="card bg-gray-900 p-12 border-2 border-accent animate-scale-in">
                <h1 className="text-6xl mb-4">{resultData.outcome === 'win' ? 'VICTORY! 🏆' : 'DEFEAT 💀'}</h1>
                <div className="flex justify-around text-2xl mb-8">
                    <div>You: {userScore}</div>
                    <div>{opponent.name}: {oppScore}</div>
                </div>
                <div className="text-xl mb-8">
                    New Elo: <span className="text-accent font-bold">{resultData.newElo}</span>
                    ({resultData.eloChange >= 0 ? '+' : ''}{resultData.eloChange})
                </div>
                <button className="btn btn-primary" onClick={() => setGameState('lobby')}>Back to Lobby</button>
            </div>
        </div>
    );

    return <div>Loading...</div>;
}
