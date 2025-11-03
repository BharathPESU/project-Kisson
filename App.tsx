import React, { useState, useEffect, useRef } from 'react';
import { Message, View } from './types';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { streamChat, getApiKeyError } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { DiseaseDiagnosis } from './components/DiseaseDiagnosis';
import { KisanAI_Icon, BackIcon } from './constants';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKeyError = getApiKeyError();
    if (apiKeyError) {
      setError(apiKeyError);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    // Clear initial prompt after use
    setChatPrompt(undefined);

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', content: '' }]);

    try {
      const stream = await streamChat(content);
      for await (const chunk of stream) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId
              ? { ...msg, content: msg.content + chunk.text }
              : msg
          )
        );
      }
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setMessages(prev => prev.filter(msg => msg.id !== modelMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (newView: View, prompt?: string) => {
    setView(newView);
    if (prompt) {
      setChatPrompt(prompt);
    }
    // Clear chat history when switching to a new chat session from dashboard
    if (newView === 'chat') {
        setMessages([]);
    }
    setError(null);
  };

  const renderView = () => {
    switch (view) {
      case 'diagnose':
        return <DiseaseDiagnosis />;
      case 'chat':
        return (
          <>
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <div className="max-w-4xl mx-auto h-full">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 pt-10">
                    <h2 className="text-2xl font-semibold">Kisan Dost Chat</h2>
                    <p>Ask me about market prices or government schemes.</p>
                  </div>
                )}
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {error && (
                  <div className="flex justify-center mt-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg max-w-md text-center">
                      <p><strong>Error:</strong> {error}</p>
                    </div>
                  </div>
                )}
              </div>
            </main>
            <footer className="sticky bottom-0">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} initialPrompt={chatPrompt} />
            </footer>
          </>
        );
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <header className="bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200 text-center sticky top-0 z-10 flex items-center justify-between">
        {view !== 'dashboard' ? (
          <button onClick={() => setView('dashboard')} className="p-2 rounded-full hover:bg-gray-200">
            <BackIcon />
          </button>
        ) : <div className="w-10"></div> /* spacer */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <KisanAI_Icon className="h-7 w-7 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">AgriSense</h1>
        </div>
        <div className="w-10"></div>  {/* spacer */}
      </header>
      
      {renderView()}

    </div>
  );
}

export default App;