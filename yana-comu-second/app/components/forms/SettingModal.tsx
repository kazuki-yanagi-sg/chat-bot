"use client";

import React, { useState, useEffect, ChangeEvent } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentName: string;
  currentIconUrl?: string;
  onUpdateSuccess?: () => void;
}

export default function SettingModal({ isOpen, onClose, userId, currentName, currentIconUrl, onUpdateSuccess }: SettingsModalProps) {
  const [name, setName] = useState(currentName);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentIconUrl);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!iconFile) {
      setPreviewUrl(currentIconUrl);
      return;
    }
    const objectUrl = URL.createObjectURL(iconFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [iconFile, currentIconUrl]);

  // モーダルが開いたら現在のユーザー名をセット（初期化）
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setIconFile(null);
      setMessage("");
    }
  }, [isOpen, currentName]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      // ユーザー名更新
      const res1 = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res1.ok) {
        const data = await res1.json();
        setMessage(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
        return;
      }

      // アイコン画像アップロード
      if (iconFile) {
        const formData = new FormData();
        formData.append("file", iconFile);

        const res2 = await fetch(`http://localhost:8000/upload_icon/${userId}`, {
          method: "POST",
          body: formData,
        });

        if (!res2.ok) {
          setMessage("アイコン画像のアップロードに失敗しました");
          return;
        }
      }

      setMessage("更新しました🎉");
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (e) {
      setMessage("通信エラーが発生しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold">
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-pink-600">設定</h2>

        <label className="block mb-2 font-semibold text-gray-700">ユーザー名</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="text-gray-800 w-full mb-4 border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" />

        <label className="block mb-2 font-semibold text-gray-700">アイコン画像</label>
        {previewUrl && <img src={previewUrl} alt="アイコンプレビュー" className="w-20 h-20 mb-2 rounded-full object-cover" />}
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button onClick={handleUpdate} className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-semibold">
          更新
        </button>

        {message && <p className="mt-4 text-center text-pink-600">{message}</p>}
      </div>
    </div>
  );
}
