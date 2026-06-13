'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BattleClient() {
    const { user } = useAuth();
    const router = useRouter();
    const [gameState, setGameState] = useState('lobby'); // lobby | matching | playing | calculating | result
    const [opponent, setOpponent] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [userScore, setUserScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [userAnswered, setUserAnswered] = useState(false);
    const [oppAnswered, setOppAnswered] = useState(false);
    const [logs, setLogs] = useState([]);
    const [resultData, setResultData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    const aiTimerRef = useRef(null);
    const countdownRef = useRef(null);

    const startBattle = async () => {
        // Guard: redirect unauthenticated users to login
        if (!user) {
            window.location.href = '/login?redirect=/battle';
            return;
        }
        setGameState('matching');
        setUserScore(0);
        setOppScore(0);
        setCurrentQ(0);
        setLogs([]);
        setSelectedOption(null);

        try {
            const res = await fetch('/api/battle/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (res.ok) {
                setOpponent(data.opponent);
                setQuestions(data.questions);
                setTimeout(() => setGameState('playing'), 2000);
            } else {
                alert(data.error || 'Could not start battle. Please try again.');
                setGameState('lobby');
            }
        } catch (e) {
            console.error('Battle start error:', e);
            alert('Connection error. Please check your network and try again.');
            setGameState('lobby');
        }
    };

    // Game loop — runs per question
    useEffect(() => {
        if (gameState !== 'playing' || !questions.length) return;

        setTimeLeft(15);
        setUserAnswered(false);
        setOppAnswered(false);
        setSelectedOption(null);

        // AI opponent simulation  
        const aiTime = Math.random() * (opponent.maxTime - opponent.minTime) + opponent.minTime;
        const aiWillBeCorrect = Math.random() < opponent.accuracy;

        aiTimerRef.current = setTimeout(() => {
            setOppAnswered(true);
            if (aiWillBeCorrect) {
                setOppScore(prev => prev + 100);
                addLog(`${opponent.name} answered correctly! 🎯`);
            } else {
                addLog(`${opponent.name} got it wrong! ❌`);
            }
        }, aiTime * 1000);

        // Countdown timer
        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    nextQuestion();
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownRef.current);
            clearTimeout(aiTimerRef.current);
        };
    }, [currentQ, gameState]);

    const handleUserAnswer = (option) => {
        if (userAnswered) return;
        setUserAnswered(true);
        setSelectedOption(option);

        const q = questions[currentQ];
        if (option === q.correct_option) {
            const points = 100 + (timeLeft * 2);
            setUserScore(prev => prev + points);
            addLog(`You answered correctly! ✅ (+${points})`);
        } else {
            addLog(`Wrong answer! The correct one was ${q.correct_option} 😬`);
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
        clearInterval(countdownRef.current);
        clearTimeout(aiTimerRef.current);

        const outcome = userScore > oppScore ? 'win' : (userScore < oppScore ? 'loss' : 'draw');

        try {
            const res = await fetch('/api/battle/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    battleId: `battle-${Date.now()}`,
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
            setGameState('lobby');
        }
    };

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 4));
    };

    // ===== LOBBY =====
    if (gameState === 'lobby') return (
        <div>
            <div className="page" style={{ maxWidth: 700, textAlign: 'center' }}>
                <div className="page-header">
                    <h1 className="page-title"><Icon name="Star" size={16} /> 1v1 AI Battle Arena</h1>
                    <p className="page-subtitle">Challenge AI opponents in a rapid-fire 5-question duel. Gain ELO to climb the ranks!</p>
                </div>

                <div className="card" style={{ padding: '48px 32px' }}>
                    <div style={{ marginBottom: 24 }}><Icon name="Cpu" /></div>
                    <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Ready for Battle?</h2>
                    <p className="text-muted" style={{ marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                        You'll face an AI opponent matched to your skill level. 5 questions, 15 seconds each. Fastest and most accurate wins!
                    </p>
                    <Button className="btn btn-primary btn-lg" onClick={startBattle} style={{ padding: '18px 48px' }}>
                        🎮 Find Opponent
                    </Button>
                </div>

                <div className="card" style={{ marginTop: 24, textAlign: 'left' }}>
                    <h3 className="space_mb_3"><Icon name="BarChart2" /> How ELO Works</h3>
                    <div className="text-sm text-muted" style={{ lineHeight: 1.8 }}>
                        <div><Icon name="Star" size={16} /> <strong>Win against stronger opponent</strong> → Big ELO gain</div>
                        <div><Icon name="Star" size={16} /> <strong>Win against weaker opponent</strong> → Small ELO gain</div>
                        <div><Icon name="Star" size={16} /> <strong>Lose against weaker opponent</strong> → Big ELO drop</div>
                        <div style={{ marginTop: 12, opacity: 0.7 }}>Starting ELO: 1000 • K-factor: 32</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ===== MATCHMAKING =====
    if (gameState === 'matching') return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div>
                <div className="spinner" style={{ width: 60, height: 60, margin: '0 auto 24px' }}></div>
                <h1 style={{ fontWeight: 900, marginBottom: 12 }}>SEARCHING FOR OPPONENT...</h1>
                <p className="text-muted">Matching skill levels based on your ELO rating...</p>
            </div>
        </div>
    );

    // ===== PLAYING =====
    if (gameState === 'playing' && questions.length > 0) {
        const q = questions[currentQ];
        const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#10b981';

        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* HUD */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ textTransform: 'uppercase', letterSpacing: 1 }}>You</div>
                        <div style={{ fontWeight: 900, }}>{userScore}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 900, color: timerColor, fontFamily: 'monospace' }}>{timeLeft}</div>
                        <div >Q{currentQ + 1}/5</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{opponent?.name}</div>
                        <div style={{ fontWeight: 900, }}>{oppScore}</div>
                        {oppAnswered && <div ><Icon name="Star" size={16} /> Answered</div>}
                    </div>
                </div>

                {/* Question */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, maxWidth: 700, margin: '0 auto', width: '100%' }}>
                    <div style={{ width: '100%', marginBottom: 32 }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <span style={{ padding: '6px 16px', }}>
                                Question {currentQ + 1} of {questions.length}
                            </span>
                        </div>
                        <h2 style={{ lineHeight: 1.6, textAlign: 'center', fontWeight: 600 }}>{q.text}</h2>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
                        {['A', 'B', 'C', 'D'].map(opt => {
                            const isSelected = selectedOption === opt;
                            const isCorrect = q.correct_option === opt;
                            const showResult = userAnswered;

                            let borderColor = 'rgba(255,255,255,0.1)';
                            let bg = 'rgba(255,255,255,0.03)';
                            if (showResult && isCorrect) { borderColor = '#10b981'; bg = 'rgba(16,185,129,0.1)'; }
                            else if (showResult && isSelected && !isCorrect) { borderColor = '#ef4444'; bg = 'rgba(239,68,68,0.1)'; }
                            else if (!showResult) { borderColor = 'rgba(255,255,255,0.15)'; }

                            return (
                                <Button
                                    key={opt}
                                    disabled={userAnswered}
                                    onClick={() => handleUserAnswer(opt)}
                                    style={{
                                        padding: '20px 16px', border: `2px solid ${borderColor}`,
                                        background: bg, cursor: userAnswered ? 'default' : 'pointer',
                                        transition: 'all 0.2s', textAlign: 'left',
                                        transform: !userAnswered ? undefined : undefined,
                                    }}
                                    onMouseOver={(e) => { if (!userAnswered) e.target.style.transform = 'scale(1.03)'; }}
                                    onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
                                >
                                    <span style={{ fontWeight: 700, marginRight: 10, opacity: 0.5 }}>{opt}.</span>
                                    {q[`option_${opt.toLowerCase()}`]}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Next button */}
                    {userAnswered && (
                        <Button onClick={nextQuestion} className="btn btn-primary" style={{ marginTop: 24, padding: '14px 48px', }}>
                            {currentQ < questions.length - 1 ? 'Next Question →' : '🏁 Finish Battle'}
                        </Button>
                    )}

                    {/* Battle Log */}
                    <div style={{ marginTop: 24, minHeight: 80, textAlign: 'center' }}>
                        {logs.map((l, i) => (
                            <div key={i} style={{ opacity: 1 - (i * 0.25), padding: '4px 0' }}>{l}</div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ===== CALCULATING =====
    if (gameState === 'calculating') return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: 50, height: 50, margin: '0 auto 24px' }}></div>
                <h2 style={{ fontWeight: 800 }}>Calculating ELO...</h2>
            </div>
        </div>
    );

    // ===== RESULT =====
    if (gameState === 'result' && resultData) {
        const isWin = resultData.outcome === 'win';
        const isDraw = resultData.outcome === 'draw';

        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '48px 32px', border: `2px solid ${isWin ? 'var(--text-primary)' : isDraw ? 'var(--text-primary)' : 'var(--text-primary)'}30` }}>
                    <div style={{ marginBottom: 16 }}>
                        {isWin ? <Icon name="Trophy" size={48} /> : isDraw ? '🤝' : '💀'}
                    </div>
                    <h1 style={{ fontWeight: 900, marginBottom: 8, color: isWin ? 'var(--text-primary)' : isDraw ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                        {isWin ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEAT'}
                    </h1>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 48, margin: '32px 0', }}>
                        <div>
                            <div className="text-muted text-sm">You</div>
                            <div style={{ fontWeight: 900, }}>{userScore}</div>
                        </div>
                        <div style={{ opacity: 0.3 }}>vs</div>
                        <div>
                            <div className="text-muted text-sm">{opponent?.name}</div>
                            <div style={{ fontWeight: 900, }}>{oppScore}</div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 32 }}>
                        <div className="text-muted text-sm" style={{ marginBottom: 8 }}>New ELO Rating</div>
                        <div style={{ fontWeight: 900, }}>{resultData.newElo}</div>
                        <div style={{ fontWeight: 700, color: resultData.eloChange >= 0 ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                            {resultData.eloChange >= 0 ? '+' : ''}{resultData.eloChange} ELO
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Button onClick={startBattle} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                            ⚔️ Battle Again
                        </Button>
                        <a href="/dashboard" className="btn btn-secondary" style={{ padding: '14px 32px' }}>
                            🏠 Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );
}
