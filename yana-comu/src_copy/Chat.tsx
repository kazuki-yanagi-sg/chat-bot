import React, { useState } from "react";
import axios from "axios";
import "./Chat.css";

interface ChatProps {
  isDisabled: boolean;
  userIcon: string;
  userName: string;
}

export default function Chat({ isDisabled, userIcon, userName }: ChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await axios.post("http://localhost:8000/communication", null, {
        params: { user_input: input },
      });

      const botMsg = { from: "bot", text: res.data.text };
      setMessages((prev) => [...prev, botMsg]);

      const audio = new Audio(`data:audio/wav;base64,${res.data.audio_base64}`);
      audio.play();
    } catch (err) {
      console.error("通信または音声再生エラー:", err);
    }

    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-log">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-row ${msg.from}`}>
            {msg.from === "bot" && (
              <div className="avatar-wrapper left">
                <img src="http://localhost:8000/icon/AI.jpeg" className="avatar left" />
                <div className="user-name">AIちゃん</div>
              </div>
            )}
            {msg.from === "user" && (
              <div className="avatar-wrapper right">
                <img src={`http://localhost:8000/user_icon/${userIcon}`} className="avatar right" />
                <div className="user-name">{userName}</div>
              </div>
            )}
            <div className={`chat-bubble ${msg.from}`}>{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="コメントを入力" />
        <button onClick={handleSend}>送信</button>
      </div>
    </div>
  );
}
