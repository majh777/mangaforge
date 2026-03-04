'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  status: string;
  personality: string;
}

interface Message {
  id: string;
  sender: 'user' | 'character';
  characterId?: string;
  text: string;
  emotion?: string;
  timestamp: Date;
}

const DEMO_CHARACTERS: Character[] = [
  { id: 'akari', name: 'Akari Kurogane', role: 'Protagonist', avatar: '⭐', color: '#FF6B9D', status: 'Ready to talk', personality: 'Bold, fiery, determined' },
  { id: 'rei', name: 'Rei Shimizu', role: 'Supporting', avatar: '❄️', color: '#00F5FF', status: 'Meditating...', personality: 'Calm, mysterious, conflicted' },
  { id: 'hollow', name: 'The Hollow King', role: 'Antagonist', avatar: '👑', color: '#8B5CF6', status: 'Watching...', personality: 'Philosophical, patient, terrifying' },
];

const DEMO_MESSAGES: Message[] = [
  { id: '1', sender: 'character', characterId: 'akari', text: "Hey! I've been waiting for you. That last battle was intense... I still can't believe what Rei did.", emotion: 'excited', timestamp: new Date(Date.now() - 300000) },
  { id: '2', sender: 'user', text: "How are you holding up after everything?", timestamp: new Date(Date.now() - 240000) },
  { id: '3', sender: 'character', characterId: 'akari', text: "Honestly? *clenches fist* I'm angry. Not at the Hollow King — at myself. I should have been stronger. I should have seen it coming.\n\nBut the forge... it's calling to me again. Something's different this time. The flames burn blue instead of orange.", emotion: 'determined', timestamp: new Date(Date.now() - 180000) },
  { id: '4', sender: 'user', text: "Blue flames? That sounds like the Primordial Flame your grandfather mentioned!", timestamp: new Date(Date.now() - 120000) },
  { id: '5', sender: 'character', characterId: 'akari', text: "Don't... don't say that name. *turns away* Grandfather vanished for a reason. If this is what he was hiding from...\n\n...then maybe I understand why he ran.\n\nBut I won't run. Not this time. 🔥", emotion: 'emotional', timestamp: new Date(Date.now() - 60000) },
];

const EXPRESSION_EMOJIS: Record<string, string> = {
  excited: '😄',
  determined: '😤',
  emotional: '😢',
  angry: '😠',
  happy: '😊',
  mysterious: '🤔',
  neutral: '😐',
};

export default function ChatPage() {
  const [selectedChar, setSelectedChar] = useState(DEMO_CHARACTERS[0]);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        { text: "That's... actually a really good point. I hadn't thought about it that way. *scratches head* Maybe you're right.", emotion: 'happy' },
        { text: "*stares into the forge flames*\n\nYou know, for someone who isn't from this world, you understand more than most people here.\n\nKeep that insight sharp. We'll need it.", emotion: 'determined' },
        { text: "Ha! *laughs and punches the air* That's exactly what I was thinking! We really are on the same wavelength.\n\nOkay, new plan. Let's do this. Together. 🔥", emotion: 'excited' },
      ];
      const resp = responses[Math.floor(Math.random() * responses.length)];
      const charMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'character',
        characterId: selectedChar.id,
        text: resp.text,
        emotion: resp.emotion,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, charMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  return (
    <main className="h-screen flex bg-ink-void">
      {/* Sidebar — Character List */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-ink-deep border-r border-ink-mid/20 flex flex-col"
          >
            <div className="p-4 border-b border-ink-mid/20">
              <Link href="/library" className="text-sm text-ink-light hover:text-paper-warm transition-colors flex items-center gap-2">
                ← Back to Library
              </Link>
              <h2 className="font-[family-name:var(--font-heading)] text-lg mt-3">Characters</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {DEMO_CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    selectedChar.id === char.id
                      ? 'bg-ink-wash border border-ink-mid'
                      : 'hover:bg-ink-wash/50'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: `${char.color}20` }}
                  >
                    {char.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{char.name}</div>
                    <div className="text-xs text-ink-light truncate">{char.status}</div>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: char.color }}
                  />
                </button>
              ))}
            </div>

            {/* Character Info Panel */}
            <div className="p-4 border-t border-ink-mid/20 bg-ink-deep">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: `${selectedChar.color}20` }}
                >
                  {selectedChar.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm">{selectedChar.name}</div>
                  <div className="text-xs" style={{ color: selectedChar.color }}>{selectedChar.role}</div>
                </div>
              </div>
              <p className="text-xs text-ink-light">{selectedChar.personality}</p>
              <div className="mt-3 flex gap-2">
                <div className="text-xs px-2 py-1 rounded bg-ink-wash text-ink-light">🧠 10-Model Matrix</div>
                <div className="text-xs px-2 py-1 rounded bg-ink-wash text-ink-light">📝 Memory Active</div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 bg-ink-deep/80 backdrop-blur-xl border-b border-ink-mid/20 flex items-center px-4 gap-4">
          <button onClick={() => setShowSidebar(!showSidebar)} className="text-ink-light hover:text-paper-warm transition-colors">
            ☰
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: `${selectedChar.color}20` }}
            >
              {selectedChar.avatar}
            </div>
            <div>
              <div className="font-medium text-sm">{selectedChar.name}</div>
              <div className="text-xs text-ink-light">{isTyping ? 'typing...' : 'online'}</div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-xs text-neon-cyan font-mono">
            ⚡ 0.1/msg
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'character' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0"
                  style={{ background: `${selectedChar.color}20` }}
                >
                  {msg.emotion ? EXPRESSION_EMOJIS[msg.emotion] || selectedChar.avatar : selectedChar.avatar}
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-sakura-pink/20 border border-sakura-pink/20 rounded-br-sm'
                    : 'bg-ink-wash border border-ink-mid/30 rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                <div className="text-[10px] text-ink-light/30 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: `${selectedChar.color}20` }}
              >
                {selectedChar.avatar}
              </div>
              <div className="bg-ink-wash rounded-2xl px-4 py-3 border border-ink-mid/30 rounded-bl-sm">
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: selectedChar.color }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-ink-mid/20 bg-ink-deep/50">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${selectedChar.name}...`}
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-ink-deep border border-ink-mid focus:border-neon-cyan/50 text-sm text-paper-warm placeholder-ink-light/30 outline-none resize-none transition-colors"
              />
            </div>
            <motion.button
              onClick={handleSend}
              disabled={!inputText.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-sakura-pink text-paper-pure font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sakura-soft transition-colors"
            >
              Send
            </motion.button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-ink-light/30">
            <span>Shift+Enter for new line</span>
            <span>·</span>
            <span>🧠 Personality matrix active</span>
            <span>·</span>
            <span>📝 Memory: 47 exchanges</span>
          </div>
        </div>
      </div>
    </main>
  );
}
