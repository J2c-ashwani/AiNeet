'use client';
import { Textarea } from '@/components/ui/Textarea';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SnapSolver from '@/components/SnapSolver';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { TrustBadge } from '@/components/trust/TrustBadge';

export default function DoubtSolver() {
    const router = useRouter();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const draft = localStorage.getItem('doubt_draft');
        if (draft) setInput(draft);
    }, []);

    useEffect(() => {
        if (!input.trim()) return;
        const t = setTimeout(() => {
            localStorage.setItem('doubt_draft', input);
            setLastSaved(Date.now());
        }, 1000);
        return () => clearTimeout(t);
    }, [input]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSnapshotSolution = (solutionText) => {
        // Add user image placeholder (optional, complexities involved in showing image in chat bubble for now just show text)
        const userMsg = { role: 'user', content: '[📸 Shared an Image Question]' };
        const aiMsg = { role: 'assistant', content: solutionText };

        setMessages(prev => [...prev, userMsg, aiMsg]);
    };

    const doubtMutation = useMutation({
        mutationFn: async ({ message, conversationId, signal }) => {
            const res = await fetch('/api/doubt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, conversationId }),
                signal
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI returned an error');
            return data;
        },
        onSuccess: (data) => {
            setConversationId(data.conversationId);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        },
        onError: (err, variables) => {
            const isTimeout = err.name === 'AbortError';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: isTimeout
                    ? <><Icon name="Clock" size={14} /> Our AI is a bit busy right now. Please try again in a moment.</>
                    : <><Icon name="AlertCircle" size={14} /> Something went wrong. Please try again.</>,
                isError: true,
                retryMsg: variables.message
            }]);
        }
    });

    const handleSend = async (retryMsg = null) => {
        if (!user) {
            window.location.href = '/login?redirect=/doubts';
            return;
        }
        const userMsg = retryMsg || input.trim();
        if (!userMsg || doubtMutation.isPending) return;
        if (!retryMsg) {
            setInput('');
            localStorage.removeItem('doubt_draft');
            setLastSaved(null);
        }
        if (!retryMsg) setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        // 20-second timeout — if AI hangs longer, student gets a clear retry option
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        doubtMutation.mutate({ message: userMsg, conversationId, signal: controller.signal }, {
            onSettled: () => clearTimeout(timeout)
        });
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
            

            <div className="page" style={{ maxWidth: 800, margin: '0 auto', minHeight: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column' }}>

                <h1 className="text-2xl font-bold mb-4">AI Doubt Solver <Icon name="Cpu" /></h1>

                {/* Vision Camera Feature */}
                <SnapSolver
                    userTier={user?.subscription_tier}
                    onSolutionReceived={handleSnapshotSolution}
                />

                <div className="card flex-1 flex flex-col overflow-hidden" style={{ padding: 0 }}>
                    <div className="chat-messages" ref={chatContainerRef} style={{ scrollBehavior: 'smooth' }}>
                        {messages.length === 0 && (
                            <div className="text-center animate-fade-in" style={{ padding: '40px 0' }}>
                                <div style={{ marginBottom: 16 }}><Icon name="Cpu" /></div>
                                <h2>AI Doubt Solver</h2>
                                <p className="text-secondary text-sm mt-2 mb-6">Ask me anything about Physics, Chemistry, or Biology. I'll explain in NEET-focused, easy-to-understand language.</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {quickPrompts.map((p, i) => (
                                        <Button key={i} className="chip" onClick={() => { setInput(p); }}>
                                            {p}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.role}`}>
                                <div className="chat-avatar">
                                    {msg.role === 'user' ? '👤' : <Icon name="Cpu" size={16} />}
                                </div>
                                <div className="chat-bubble">
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-invert max-w-none text-gray-200">
                                            {!msg.isError && (
                                                <div className="mb-3">
                                                    <TrustBadge type="ai-confidence" meta={{ score: 0.95 }} />
                                                </div>
                                            )}
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            {msg.isError && (
                                                <Button
                                                    onClick={() => handleSend(msg.retryMsg)}
                                                    style={{ marginTop: 10, padding: '6px 14px', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', fontWeight: 600 }}
                                                >
                                                    <Icon name="RefreshCw" /> Retry
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {doubtMutation.isPending && (
                            <div className="chat-message assistant">
                                <div className="chat-avatar"><Icon name="Cpu" /></div>
                                <div className="chat-bubble">
                                    <div className="flex items-center gap-2">
                                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                                        <span className="text-muted text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area" style={{ position: 'sticky', bottom: 0, }}>
                        {lastSaved && (
                            <div style={{ position: 'absolute', top: '-30px', right: 16 }}>
                                <TrustBadge type="autosave" meta={{ seconds: Math.floor((Date.now() - lastSaved)/1000) }} />
                            </div>
                        )}
                        <div className="chat-input-wrapper">
                            <Textarea
                                className="chat-input"
                                placeholder="Ask your doubt... (e.g., Explain the Krebs cycle)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                rows={1}
                            />
                            <Button className="chat-send-btn" onClick={() => handleSend(null)} disabled={!input.trim() || doubtMutation.isPending}>
                                ➤
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
