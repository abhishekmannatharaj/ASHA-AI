import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Send } from 'lucide-react';

interface AshaChatbotProps {
  patientId: string;
  onClose: () => void;
}

type Message = {
  role: 'user' | 'bot';
  text: string;
};

// ✅ SINGLE SOURCE OF TRUTH
const API_BASE = 'http://localhost:8000';

export function AshaChatbot({ patientId, onClose }: AshaChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '🩺 Fetching patient health summary…' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------------
     AUTO SCROLL
  ---------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ----------------------------------
     INITIAL ASSESSMENT
  ---------------------------------- */
  useEffect(() => {
    const fetchInitialRisk = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stored_data: {
              patient_id: patientId,
            },
          }),
        });

        if (!res.ok) throw new Error('Failed to load');

        const data = await res.json();

        setMessages([{ role: 'bot', text: data.reply }]);
      } catch (err) {
        console.error('Initial chat error:', err);
        setMessages([
          {
            role: 'bot',
            text:
              '⚠️ Unable to load patient health data right now.\nYou can still ask general questions.',
          },
        ]);
      }
    };

    fetchInitialRisk();
  }, [patientId]);

  /* ----------------------------------
     SEND MESSAGE
  ---------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
        }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();

      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            '❌ Sorry, I couldn’t respond right now.\nPlease try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 shadow-2xl z-50">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">ASHA Assistant</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-400">ASHA is typing…</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <Input
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
