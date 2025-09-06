import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex gap-3 p-4 bg-gray-800/70 border-t border-gray-700/50">
      <div className="flex-1 relative">
        <input
          className={`w-full p-4 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
            isFocused 
              ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/30" 
              : "border-gray-600/50 hover:border-gray-500/50"
          }`}
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {/* Microphone/Attachment Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-600/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-600/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </div>
      
      <button 
        onClick={send}
        disabled={!text.trim()}
        className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>Send</span>
      </button>
    </div>
  );
}