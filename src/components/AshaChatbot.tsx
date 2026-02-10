import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Send } from 'lucide-react';

interface AshaChatbotProps {
  onClose: () => void;
}

export function AshaChatbot({ onClose }: AshaChatbotProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hello! I am your ASHA assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Simple bot responses (in production, this would connect to an AI service)
    setTimeout(() => {
      const botResponse = getBotResponse(input.toLowerCase());
      setMessages((prev) => [...prev, { role: 'bot', text: botResponse }]);
    }, 500);

    setInput('');
  };

  const getBotResponse = (query: string): string => {
    if (query.includes('blood pressure') || query.includes('bp')) {
      return 'Normal blood pressure is around 120/80 mmHg. If systolic is above 140 or diastolic above 90, the patient may have hypertension. Recommend lifestyle changes and refer to a doctor if readings are consistently high.';
    }
    if (query.includes('blood sugar') || query.includes('diabetes')) {
      return 'Normal fasting blood sugar is 70-100 mg/dL. Pre-diabetic range is 100-125 mg/dL. Above 126 mg/dL indicates diabetes. Random blood sugar above 200 mg/dL with symptoms also indicates diabetes. Refer to a doctor for proper diagnosis.';
    }
    if (query.includes('pregnancy') || query.includes('pregnant')) {
      return 'For pregnant women, ensure regular checkups, monitor weight gain, check for signs of preeclampsia (high BP, swelling), and ensure proper nutrition. Refer to gynecologist for any complications.';
    }
    if (query.includes('cancer screening')) {
      return 'Look for unusual lumps, persistent sores, unexplained bleeding, changes in skin moles, or persistent cough. Any suspicious signs should be referred to a specialist immediately for proper screening.';
    }
    if (query.includes('emergency') || query.includes('sos')) {
      return 'In case of emergency: chest pain, difficulty breathing, severe bleeding, unconsciousness, or stroke symptoms (face drooping, arm weakness, speech difficulty), immediately create an SOS alert and call for ambulance.';
    }
    return 'I understand your question. For specific medical conditions, please consult with a doctor or use the SOS feature for emergencies. Is there anything else I can help clarify?';
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
