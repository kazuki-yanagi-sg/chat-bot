// components/admin/EditUser.tsx
"use client";

import { useState } from "react";

interface RegisteredUser {
  id: number;
  name: string;
  icon: string | null;
  role: boolean;
}

interface Props {
  users: RegisteredUser[];
  onUpdate: () => void; // 更新後に呼び出す
}

export default function EditUser({ users, onUpdate }: Props) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const handleSelectChange = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setSelectedUserId(id);
    setName(user.name);
    setRole(user.role);
    setIconFile(null);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", String(role));
    if (iconFile) formData.append("icon", iconFile);

    const res = await fetch(`http://localhost:8000/users/${selectedUserId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("ユーザー情報を更新しました！");
      onUpdate();
    } else {
      alert("更新に失敗しました");
    }
  };

  return (
    <div className="space-y-4">
      <select value={selectedUserId ?? ""} onChange={(e) => handleSelectChange(Number(e.target.value))} className="w-full border border-pink-300 p-2 rounded text-pink-700">
        <option value="">ユーザーを選択してください</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}（ID: {user.id}）
          </option>
        ))}
      </select>

      {selectedUserId && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-6 items-start">
            {/* 左: アイコン表示 */}
            <div>{selectedUser?.icon && <img src={`http://localhost:8000/user_icon/${selectedUser.icon}`} alt="現在のアイコン" className="w-24 h-24 rounded-full border border-pink-300 shadow" />}</div>

            {/* 右: 入力項目 */}
            <div className="flex flex-col gap-3 flex-1">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-pink-300 rounded" placeholder="ユーザー名" />

              <label className="text-pink-700 flex items-center gap-2">
                <input type="checkbox" checked={role} onChange={(e) => setRole(e.target.checked)} />
                管理者にする
              </label>

              <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)} className="text-pink-700" />
            </div>
          </div>

          {/* 更新ボタン */}
          <div className="text-center pt-4">
            <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-full font-bold shadow">
              更新する
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
