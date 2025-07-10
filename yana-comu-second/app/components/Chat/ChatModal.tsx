"use client";

import React, { useState, useEffect, useRef } from "react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIconUrl?: string;
  selectedSpeaker: number;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  iconUrl?: string;
}

interface AffiliateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_ICON_URL = "http://localhost:8000/icon/AI.jpeg";

export default function ChatModal({ isOpen, onClose, userIconUrl, selectedSpeaker }: ChatModalProps) {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, text: "こんにちは、何を話したいですか？🌸", sender: "ai", iconUrl: AI_ICON_URL }]);
  const messageIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: messageIdRef.current++, text: input, sender: "user", iconUrl: userIconUrl };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input, speaker: selectedSpeaker }),
      });

      if (!res.ok) throw new Error("通信失敗");

      const data = await res.json();
      const aiMsg: Message = { id: messageIdRef.current++, text: data.text, sender: "ai", iconUrl: AI_ICON_URL };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.audio_base64) {
        const audioSrc = `data:audio/wav;base64,${data.audio_base64}`;
        const audio = new Audio(audioSrc);
        audio.play();
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: messageIdRef.current++, text: "通信エラーです😭", sender: "ai", iconUrl: AI_ICON_URL }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-[9999] fixed inset-0 flex justify-center items-center p-4">
      <div className="bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-100 border-4 border-white rounded-[2rem] shadow-[0_0_20px_rgba(255,182,193,0.6)] w-full max-w-md p-6 relative flex flex-col h-[45rem] font-['Comic Sans MS',cursive]">
        <button onClick={onClose} className="absolute top-3 right-3 text-pink-600 hover:text-pink-800 text-2xl font-bold drop-shadow" aria-label="閉じる">
          ×
        </button>

        <h2 className="text-3xl font-extrabold text-pink-700 mb-4 text-center animate-bounce">AIちゃんと会話💬</h2>

        <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 px-2 h-[500px] space-y-3 bg-white rounded-3xl p-4 shadow-inner border-2 border-pink-200 backdrop-blur-sm">
          {messages.map(({ id, text, sender, iconUrl }) => (
            <div key={id} className={`flex items-end ${sender === "user" ? "justify-end" : "justify-start"}`}>
              {sender === "ai" && iconUrl && <img src={iconUrl} alt="icon" className="w-10 h-10 rounded-full mr-2 border-2 border-pink-300" />}
              <div className={`max-w-[70%] px-4 py-2 rounded-[1.5rem] text-sm whitespace-pre-wrap break-words ${sender === "user" ? "bg-pink-400 text-white rounded-br-none" : "bg-yellow-100 text-pink-800 rounded-bl-none"} shadow-md drop-shadow`}>{text}</div>
              {sender === "user" && iconUrl && <img src={iconUrl} alt="icon" className="w-10 h-10 rounded-full ml-2 border-2 border-yellow-200" />}
            </div>
          ))}
          {loading && (
            <div className="flex items-end justify-start">
              <img src={AI_ICON_URL} alt="icon" className="w-10 h-10 rounded-full mr-2 border-2 border-pink-300" />
              <div className="bg-yellow-100 text-pink-700 px-4 py-2 rounded-[1.5rem] text-sm shadow animate-pulse">入力中...</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="メッセージを入力...🍬"
            className="flex-grow h-10 border border-pink-300 rounded-full px-4 py-0 focus:outline-none focus:ring-2 focus:ring-pink-400 text-pink-900 placeholder-pink-400 bg-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
              }
            }}
          />
          <button onClick={handleSend} className="h-10 bg-gradient-to-r from-pink-400 via-pink-300 to-yellow-200 hover:from-pink-500 hover:to-yellow-300 text-white font-bold rounded-full px-5 py-0 transition shadow-lg" aria-label="送信">
            💌
          </button>
        </div>
      </div>
    </div>
  );
}
