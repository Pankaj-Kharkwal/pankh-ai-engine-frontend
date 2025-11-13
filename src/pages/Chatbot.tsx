import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

interface ChatbotItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const GPTsPage: React.FC = () => {
  const [chatbots] = useState<ChatbotItem[]>([
    { id: '1', name: 'Travel Assistant', description: 'Plan trips, explore destinations, and manage itineraries with ease.', createdAt: new Date().toISOString() },
    { id: '2', name: 'Fitness Coach', description: 'Personalized fitness plans and motivation to stay active.', createdAt: new Date().toISOString() },
    { id: '3', name: 'Finance Buddy', description: 'Smart budgeting tips and spending analytics for better control.', createdAt: new Date().toISOString() },
    { id: '4', name: 'Career Mentor', description: 'Guidance for interviews, resume review, and skill development.', createdAt: new Date().toISOString() },
  ]);

  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; fromUser: boolean }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const openChatbot = (bot: ChatbotItem) => {
    setSelectedChatbot(bot);
    setMessages([]);
    setUserInput('');
  };

  const goBack = () => {
    setSelectedChatbot(null);
    setMessages([]);
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;
    const newMessage = { text: userInput, fromUser: true };
    setMessages(prev => [...prev, newMessage, { text: "Sorry, we can't fetch results.", fromUser: false }]);
    setUserInput('');
  };

  const filteredChatbots = useMemo(() => {
    return chatbots.filter(bot => bot.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, chatbots]);

  return (
    <div className="min-h-screen px-6 py-10 font-sans text-gray-900 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-6xl mx-auto">
        {!selectedChatbot ? (
          <>
            <header className="flex flex-col items-center justify-between mb-10 sm:flex-row">
              <div>
                <h1 className="mb-1 text-3xl font-bold tracking-tight">My Chatbots</h1>
                <p className="text-sm text-gray-500">All your custom-built chat assistants in one place</p>
              </div>
              <input
                type="text"
                placeholder="Search chatbots..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 mt-4 text-sm transition-all border border-gray-300 sm:mt-0 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </header>

            <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {filteredChatbots.map(bot => (
                <motion.div
                  key={bot.id}
                  whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                  className="transition-all duration-300 bg-white border border-gray-100 shadow-md cursor-pointer rounded-2xl hover:shadow-lg group"
                  onClick={() => openChatbot(bot)}
                >
                  <div className="flex items-center p-5 space-x-4">
                    <div className="p-3 rounded-full bg-indigo-50">
                      <FaRobot size={26} className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold transition-colors group-hover:text-indigo-600">{bot.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{bot.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 pb-4">
                    <small className="text-xs text-gray-400">Created {new Date(bot.createdAt).toLocaleDateString()}</small>
                    <button
                      className="text-sm font-medium text-indigo-600 hover:underline"
                      onClick={e => {
                        e.stopPropagation();
                        openChatbot(bot);
                      }}
                    >
                      Open
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="p-8 bg-white shadow-md rounded-2xl">
            <button onClick={goBack} className="px-4 py-2 mb-4 text-indigo-500 border border-indigo-500 rounded-lg hover:bg-indigo-50">← Back</button>
            <h2 className="mb-2 text-2xl font-bold">{selectedChatbot.name}</h2>
            <p className="mb-6 text-gray-600">{selectedChatbot.description}</p>

            <div className="flex flex-col p-4 mb-4 overflow-y-auto border rounded-lg h-96 bg-gray-50">
              {messages.length === 0 && <p className="mt-20 text-center text-gray-400">Start the conversation...</p>}
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-2 ${msg.fromUser ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-4 py-2 rounded-lg ${msg.fromUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>{msg.text}</span>
                </div>
              ))}
            </div>

            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="px-4 py-2 text-white bg-indigo-500 rounded-r-lg hover:bg-indigo-600">Send</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GPTsPage;
