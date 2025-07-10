"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { isAuthenticated, setAuthenticated, setUser } = useAuth();
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      const data = await res.json();

      setUser({
        id: data.user_id,
        name: data.user_name,
        icon: data.user_icon,
        role: data.user_role,
      });

      localStorage.setItem("token", data.access_token);
      setAuthenticated(true);
      onClose(); // モーダルを閉じる
    } else {
      alert("ログインに失敗しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-max bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-purple-600 p-8 rounded-2xl shadow-xl w-80 text-white border border-white/20 relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-white text-lg hover:text-pink-200 transition">
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="block text-sm mb-1">ユーザー名</span>
            <input type="text" value={name} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 rounded bg-white bg-opacity-20 border border-white/30 text-white placeholder-white" required />
          </label>
          <label className="block mb-6">
            <span className="block text-sm mb-1">パスワード</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded bg-white bg-opacity-20 border border-white/30 text-white placeholder-white" required />
          </label>
          <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-bold transition">
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
