"use client";

import React, { useState } from "react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (res.ok) {
        setMessage("登録成功しました🎉");
        setTimeout(() => {
          setMessage("");
          onClose(); // モーダル閉じる
        }, 1000);
      } else {
        const data = await res.json();
        setMessage(data.detail || "登録に失敗しました");
      }
    } catch (error) {
      setMessage("通信エラーが発生しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold">
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-pink-600">アカウント登録</h2>

        <div className="space-y-3">
          <input type="text" placeholder="ユーザー名" className="text-gray-800 w-full border border-pink-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" value={name} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="パスワード" className="text-gray-800 w-full border border-pink-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleSignUp} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-semibold">
            登録
          </button>
          {message && <p className="text-sm text-center text-pink-600 mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
}
