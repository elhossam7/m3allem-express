
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, Artisan, Customer, JobRequest } from '../../types';
import { getArtisanChatReply } from '../../services/geminiService';
import { addChatMessageToJob } from '../../services/api';
import Icon from '../Icon';

interface ChatWindowProps {
  job: JobRequest;
  customer: Customer;
  artisan: Artisan;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ job, artisan, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(job.chatHistory || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    await addChatMessageToJob(job.id, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await getArtisanChatReply(input, artisan.specialization, job.chatHistory || []);
      let modelReply = '';
      const modelMessageId = `msg-model-${Date.now()}`;

      setMessages(prev => [...prev, { id: modelMessageId, sender: 'model', text: '' }]);

      for await (const chunk of stream) {
        modelReply += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, text: modelReply + '...' } : msg
          )
        );
      }
      
      const finalModelMessage: ChatMessage = { id: modelMessageId, sender: 'model', text: modelReply };
      setMessages(prev => prev.map(msg => msg.id === modelMessageId ? finalModelMessage : msg));
      await addChatMessageToJob(job.id, finalModelMessage);

    } catch (error) {
      console.error("Error getting chat reply:", error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'model',
        text: "Apologies, I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, artisan.specialization, job.id, job.chatHistory]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-full max-h-[70vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 className="font-bold text-slate-800">{artisan.name}</h3>
            <p className="text-sm text-slate-500">{artisan.specialization}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-slate-100">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md shadow-sm ${msg.sender === 'user' ? 'bg-cyan-500 text-white' : 'bg-white text-slate-700'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
           {isLoading && messages[messages.length-1]?.sender === 'user' && (
             <div className="flex justify-start mb-4">
               <div className="rounded-lg px-4 py-2 bg-white text-slate-700 shadow-sm">
                 <p className="text-sm animate-pulse">Typing...</p>
               </div>
             </div>
           )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question..."
              className="flex-1 border-slate-300 rounded-l-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input}
              className="bg-cyan-500 text-white p-2 rounded-r-md disabled:bg-slate-300 flex items-center justify-center w-12 h-[42px]"
            >
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Icon name="send" className="h-5 w-5"/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;