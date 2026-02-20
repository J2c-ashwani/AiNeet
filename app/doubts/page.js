'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SnapSolver from '@/components/SnapSolver';

export default function DoubtSolver() {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [user, setUser] = useState(null);
    const messagesEnd = useRef(null);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            if (!data.user) router.push('/login');
            else setUser(data.user);
        });
    }, [router]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSnapshotSolution = (solutionText) => {
        // Add user image placeholder (optional, complexities involved in showing image in chat bubble for now just show text)
        const userMsg = { role: 'user', content: '[📸 Shared an Image Question]' };
        const aiMsg = { role: 'assistant', content: solutionText };

        setMessages(prev => [...prev, userMsg, aiMsg]);
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim() && !sending) return; // Changed 'loading' to 'sending' to match existing state
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setSending(true);

        try {
            const res = await fetch('/api/doubt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, conversationId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setConversationId(data.conversationId);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        } finally { setSending(false); }
    };

    const quickPrompts = [
        'Explain photosynthesis in simple words',
        'What is the difference between mitosis and meiosis?',
        'Explain Newton\'s laws of motion',
        'What is hybridization in chemistry?',
        'How does DNA replication work?',
        'Explain the Nernst equation',
    ];

    return (
        <div>
            <Navbar />

            <div className="page" style={{ maxWidth: 800, margin: '0 auto', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

                <h1 className="text-2xl font-bold mb-4">AI Doubt Solver 🤖</h1>

                {/* Vision Camera Feature */}
                <SnapSolver
                    userTier={user?.subscription_tier}
                    onSolutionReceived={handleSnapshotSolution}
                />

                <div className="card flex-1 flex flex-col overflow-hidden" style={{ padding: 0 }}>
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="text-center animate-fade-in" style={{ padding: '40px 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
                                <h2>AI Doubt Solver</h2>
                                <p className="text-secondary text-sm mt-2 mb-6">Ask me anything about Physics, Chemistry, or Biology. I'll explain in NEET-focused, easy-to-understand language.</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {quickPrompts.map((p, i) => (
                                        <button key={i} className="chip" onClick={() => { setInput(p); }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.role}`}>
                                <div className="chat-avatar">
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="chat-bubble">
                                    {msg.role === 'assistant' ? (
                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>').replace(/##\s(.*)/g, '<strong>$1</strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="chat-message assistant">
                                <div className="chat-avatar">🤖</div>
                                <div className="chat-bubble">
                                    <div className="flex items-center gap-2">
                                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                                        <span className="text-muted text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEnd} />
                    </div>

                    <div className="chat-input-area">
                        <div className="chat-input-wrapper">
                            <textarea
                                className="chat-input"
                                placeholder="Ask your doubt... (e.g., Explain the Krebs cycle)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                rows={1}
                            />
                            <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || sending}>
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
