// components/admin/Registration.tsx
"use client";

import { useState } from "react";

interface Props {
  onSuccess?: () => void;
}

export default function Registration({ onSuccess }: Props) {
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          password: newPassword,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error("登録に失敗しました");

      if (onSuccess) onSuccess();

      setNewName("");
      setNewPassword("");
      setNewRole(false);
      alert("ユーザーが登録されました！");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-inner">
      <div>
        <label className="block text-pink-700 font-semibold mb-1">名前</label>
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" required />
      </div>
      <div>
        <label className="block text-pink-700 font-semibold mb-1">パスワード</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" required />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="new-role" checked={newRole} onChange={(e) => setNewRole(e.target.checked)} className="accent-pink-500" />
        <label htmlFor="new-role" className="text-pink-700">
          管理者にする
        </label>
      </div>
      <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition">
        登録する
      </button>
    </form>
  );
}
