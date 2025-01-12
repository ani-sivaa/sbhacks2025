"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ChatbotInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotInterface({
  isOpen,
  onClose,
}: ChatbotInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ text: string; isUser: boolean }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("🚀 Starting submission with input:", input);

    // Add user message to chat
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    console.log("📝 Updated messages with user input:", messages);

    setIsLoading(true);
    console.log("⏳ Set loading state to true");

    try {
      console.log("🌐 Sending fetch request to /api/chat");
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      console.log("📨 Received response status:", response.status);
      console.log(
        "📨 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Parsed response data:", data);

      setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
      console.log("📝 Updated messages with bot response");
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      console.error("❌ Error stack:", error.stack);
      setMessages((prev) => [
        ...prev,
        {
          text:
            "Sorry, I encountered an error. Please try again. Error: " +
            error.message,
          isUser: false,
        },
      ]);
    } finally {
      console.log("🏁 Cleaning up - resetting loading state and input");
      setIsLoading(false);
      setInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mb-4 w-96 h-[500px] bg-gray-900 rounded-lg shadow-lg flex flex-col animate-slide-up">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Ask Oviya</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-200 p-3 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
