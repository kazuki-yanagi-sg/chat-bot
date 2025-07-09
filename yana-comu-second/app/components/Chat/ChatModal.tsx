"use client";

import React, { useState, useEffect, useRef } from "react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIconUrl?: string; // ここでユーザーアイコンURLを受け取る
  selectedSpeaker: number;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  iconUrl?: string;
}

const AI_ICON_URL = "http://localhost:8000/icon/AI.jpeg";

export default function ChatModal({ isOpen, onClose, userIconUrl, selectedSpeaker }: ChatModalProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, text: "こんにちは、何を話したいですか？🌸", sender: "ai", iconUrl: AI_ICON_URL }]);
  const messageIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // チャットウィンドウ自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // ユーザーメッセージ（ユーザーアイコンURLを使う）
    const userMsg: Message = { id: messageIdRef.current++, text: input, sender: "user", iconUrl: userIconUrl };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    console.log(userIconUrl);
    try {
      const res = await fetch("http://localhost:8000/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input, speaker: selectedSpeaker }),
      });

      if (!res.ok) throw new Error("通信失敗");

      const data = await res.json();

      // AIメッセージ（AIアイコンURL固定）
      const aiMsg: Message = { id: messageIdRef.current++, text: data.text, sender: "ai", iconUrl: AI_ICON_URL };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.audio_base64) {
        const audioSrc = `data:audio/wav;base64,${data.audio_base64}`;
        const audio = new Audio(audioSrc);
        audio.play();
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: messageIdRef.current++, text: "通信エラーです😭", sender: "ai", iconUrl: AI_ICON_URL }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-gradient-to-br from-pink-50 to-pink-200 rounded-xl shadow-2xl w-full max-w-md p-6 relative flex flex-col h-[45rem]">
        {/* 閉じるボタン */}
        <button onClick={onClose} className="absolute top-3 right-3 text-pink-600 hover:text-pink-800 text-2xl font-bold" aria-label="閉じる">
          ×
        </button>

        {/* タイトル */}
        <h2 className="text-2xl font-extrabold text-pink-700 mb-4 select-none">AIちゃんと会話</h2>

        {/* チャット表示部分 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 px-2 h-[500px] space-y-3 bg-white rounded-lg p-3 shadow-inner">
          {messages.map(({ id, text, sender, iconUrl }) => (
            <div key={id} className={`flex items-end ${sender === "user" ? "justify-end" : "justify-start"}`}>
              {/* AIは左にアイコン */}
              {sender === "ai" && iconUrl && <img src={iconUrl} alt="icon" className="w-8 h-8 rounded-full mr-2" />}
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${sender === "user" ? "bg-pink-400 text-white rounded-br-none" : "bg-pink-100 text-pink-800 rounded-bl-none"} shadow`}>{text}</div>
              {/* ユーザーは右にアイコン */}
              {sender === "user" && iconUrl && <img src={iconUrl} alt="icon" className="w-8 h-8 rounded-full ml-2" />}
            </div>
          ))}
        </div>

        {/* 入力フォーム */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="メッセージを入力..."
            className="flex-grow h-10 border border-pink-300 rounded-full px-4 py-0 focus:outline-none focus:ring-2 focus:ring-pink-400 text-pink-900 placeholder-pink-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
              }
            }}
          />
          <button onClick={handleSend} className="h-10 bg-pink-500 hover:bg-pink-600 text-white rounded-full px-5 py-0 font-semibold transition" aria-label="送信">
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
