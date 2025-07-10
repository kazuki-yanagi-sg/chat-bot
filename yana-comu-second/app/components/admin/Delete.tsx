"use client";

import { useState } from "react";

interface DeleteUserProps {
  users: { id: number; name: string; icon: string | null; role: boolean }[];
  onUserDeleted: () => void;
}

export default function DeleteUser({ users, onUserDeleted }: DeleteUserProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("本当にこのユーザーを削除しますか？")) return;
    setDeletingId(id);

    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("削除しました");
      onUserDeleted();
    } else {
      alert("削除に失敗しました");
    }
    setDeletingId(null);
  };

  return (
    <ul className="p-4 max-h-96 overflow-y-auto space-y-2">
      {users.map((user) => (
        <li key={user.id} className="flex justify-between items-center bg-white p-3 rounded-xl border shadow">
          <div className="flex items-center">
            <img src={user.icon ? `http://localhost:8000/user_icon/${user.icon}` : "/default-icon.png"} className="w-10 h-10 rounded-full mr-3 border" alt="icon" />
            <span className="font-semibold text-pink-700">{user.name}</span>
          </div>
          <button onClick={() => handleDelete(user.id)} disabled={deletingId === user.id} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm">
            {deletingId === user.id ? "削除中..." : "削除"}
          </button>
        </li>
      ))}
    </ul>
  );
}
