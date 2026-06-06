/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Zap, Bot, MessageCircle, MessageSquare, Send, X, Instagram, Trash2, Copy } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 font-sans">
      <header className="bg-yellow-400 p-6 shadow-md">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-yellow-950">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Zap className="text-yellow-700" />
            </motion.div>
            <span>Pikachu.com</span>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-yellow-950 mb-6">
            Welcome to Pikachu AI
          </h1>
          <p className="text-xl text-yellow-800 max-w-2xl mx-auto">
            Your friendly, electric AI companion. Built to make your life more fun and efficient.
          </p>
        </motion.section>

        <section className="grid md:grid-cols-3 gap-8">
          <Card
            icon={<Bot className="w-10 h-10 text-yellow-600" />}
            title="Smart AI"
            description="Powered by advanced AI for all your needs."
          />
          <Card
            icon={<Zap className="w-10 h-10 text-yellow-600" />}
            title="Lightning Fast"
            description="Experience speed like never before."
          />
          <Card
            icon={<MessageCircle className="w-10 h-10 text-yellow-600" />}
            title="Interactive"
            description="Engage in meaningful conversations."
          />
        </section>
      </main>

      <PikachuChat />

      <footer className="bg-yellow-200 text-yellow-900 p-6 mt-16 text-center">
        <p className="mb-2">Developed by Rajeev Thakur | © {new Date().getFullYear()} Pikachu AI</p>
        <a href="https://www.instagram.com/__rajeev_thakur_01?igsh=Z2V2cHV1cHl1N2wz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
          <Instagram size={18} /> Follow me on Instagram
        </a>
      </footer>
    </div>
  );
}

function PikachuChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'user' | 'bot', text: string}[]>(() => {
    try {
      const saved = localStorage.getItem('pikachu-chat-history');
      return saved ? JSON.parse(saved) : [{sender: 'bot', text: 'Pika! Hello there! How can I help you today?'}];
    } catch (e) {
      return [{sender: 'bot', text: 'Pika! Hello there! How can I help you today?'}];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('pikachu-chat-history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function sendMessage() {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, {sender: 'user', text: userMessage}]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, {sender: 'bot', text: data.reply}]);
      
      // Play ping sound
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
      
    } catch (error) {
      setMessages(prev => [...prev, {sender: 'bot', text: 'Pika-Pika! Something went wrong, sorry!'}]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-400 p-4 rounded-full shadow-lg text-yellow-950 hover:scale-110 transition-transform"
      >
        <MessageSquare size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-yellow-50 flex flex-col"
          >
            <div className="bg-yellow-400 p-6 font-bold flex justify-between items-center text-yellow-950 text-lg">
              <div className="flex items-center gap-4">
                <span>Pikachu AI Chat</span>
                <button onClick={() => setMessages([{sender: 'bot', text: 'Pika! Chat cleared!'}])} title="Clear Chat">
                  <Trash2 size={20} />
                </button>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg relative group ${m.sender === 'user' ? 'bg-yellow-100 text-yellow-950 ml-auto w-fit' : 'bg-gray-100 text-gray-900 mr-auto w-fit'}`}>
                  {m.text}
                  {m.sender === 'bot' && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(m.text)}
                      className="absolute -right-10 top-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-900 transition-opacity"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              ))}
              {isLoading && <ThinkingDots />}
            </div>
            <div className="flex p-2 border-t">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Talk to Pikachu..."
                className="flex-1 p-2 outline-none"
              />
              <button onClick={sendMessage} className="p-2 text-yellow-600"><Send size={20} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 p-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.2,
          }}
          className="w-2 h-2 bg-yellow-500 rounded-full"
        />
      ))}
    </div>
  );
}

function Card({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-yellow-100"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-yellow-800">{description}</p>
    </motion.div>
  );
}

