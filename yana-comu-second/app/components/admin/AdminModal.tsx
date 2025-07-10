"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react"; // アイコン（shadcn用）
import Registration from "./Registration";
import EditUser from "./EditUser";
import DeleteUser from "./Delete";
import AISetting from "./AISetting";

interface RegisteredUser {
  id: number;
  name: string;
  icon: string | null;
  role: boolean;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpeaker: number;
}

export default function AdminModal({ isOpen, onClose, selectedSpeaker }: AdminModalProps) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const TABS = ["一覧", "登録", "編集", "削除"];
  type Tab = (typeof TABS)[number];

  const [activeTab, setActiveTab] = useState("一覧");

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("認証トークンがありません。");
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("http://localhost:8000/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error(`エラーが発生しました: ${res.statusText}`);
          }

          const data = await res.json();
          setUsers(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-pink-100/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="h-[45rem] bg-white/90 rounded-3xl shadow-2xl p-10 w-full max-w-2xl transition-all animate-fade-in flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-pink-600 text-center">💫 登録ユーザー一覧 💫</h2>

        {/* タブボタン */}
        <div className="flex justify-center mb-6">
          {TABS.map((tab) => (
            <button key={tab} className={`px-4 py-2 mx-2 rounded-full font-semibold transition-all ${activeTab === tab ? "bg-pink-500 text-white shadow" : "bg-pink-100 text-pink-600 hover:bg-pink-200"}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* ✅ ここがスクロール可能領域 */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading && <p className="text-center text-pink-500">読み込み中...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {!loading && !error && activeTab === "一覧" && (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user.id} className="mb-2 flex items-center border border-pink-200 bg-white rounded-xl p-3 shadow-sm hover:scale-105 transition-transform hover:animate-bounce">
                  <img src={user.icon ? `http://localhost:8000/user_icon/${user.icon}` : "/default-icon.png"} alt={user.name} className="w-12 h-12 rounded-full mr-4 border border-pink-300" />
                  <div className="flex-grow">
                    <p className="font-bold text-pink-700">{user.name}</p>
                    <p className="text-sm text-pink-500">ID: {user.id}</p>
                  </div>
                  {user.role && (
                    <span className="flex items-center gap-1 bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full">
                      <Heart className="w-4 h-4 fill-pink-400" /> 管理者
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* 他タブ表示 */}
          {activeTab === "登録" && <Registration />}
          {activeTab === "編集" && (
            <EditUser
              users={users}
              onUpdate={() => {
                /* 更新後の再取得など */
              }}
            />
          )}
          {activeTab === "削除" && (
            <DeleteUser
              users={users}
              onUserDeleted={() => {
                // 再取得して一覧を更新
                const fetchUsers = async () => {
                  const token = localStorage.getItem("token");
                  const res = await fetch("http://localhost:8000/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify,
                  });
                  const data = await res.json();
                  setUsers(data);
                };
                fetchUsers();
              }}
            />
          )}
        </div>

        {/* フッター部分（閉じるボタン） */}
        <button onClick={onClose} className="mt-6 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-full w-full shadow-md transition-all">
          ✨ 閉じる ✨
        </button>
      </div>
    </div>
  );
}
