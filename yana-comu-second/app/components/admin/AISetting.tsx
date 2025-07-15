"use client";

import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedSpeakerId: number;
  selectedSpeakerCharacter: String;
}

export default function AISetting({ isOpen, onClose, selectedSpeakerId, selectedSpeakerCharacter }: Props) {
  const [name, setName] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [mode, setMode] = useState<"list" | "edit">("list");

  console.log("test");
  console.log(selectedSpeakerId);

  useEffect(() => {
    if (!selectedSpeakerId) return;

    fetch(`http://localhost:8000/speaker_prompt/${selectedSpeakerId}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setPrompt(data.prompt);
        setEditPrompt(data.prompt);
      })
      .catch((e) => {
        console.log("プロンプト取得エラー", e);
        setPrompt("");
      });
  }, [selectedSpeakerId]);

  const handleSave = () => {
    fetch(`http://localhost:8000/speaker_prompt/${selectedSpeakerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: selectedSpeakerId, name: selectedSpeakerCharacter, prompt: editPrompt }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("保存に失敗しました");
        return res.json();
      })
      .then(() => {
        setPrompt(editPrompt);
        setMode("list");
      })
      .catch((e) => {
        alert("保存エラー: " + e.message);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold">
          &times;
        </button>

        {/* タブ切り替え */}
        <div className="flex mb-4">
          <button className={`flex-1 py-2 px-4 rounded-t-lg ${mode === "list" ? "bg-pink-500 text-white" : "bg-gray-100"}`} onClick={() => setMode("list")}>
            一覧
          </button>
          <button className={`flex-1 py-2 px-4 rounded-t-lg ${mode === "edit" ? "bg-pink-500 text-white" : "bg-gray-100"}`} onClick={() => setMode("edit")}>
            編集
          </button>
        </div>

        {/* 内容 */}
        {mode === "list" ? (
          <div>
            <h2 className="text-lg font-bold text-pink-600 mb-2">{name ? name : selectedSpeakerCharacter}のプロンプト</h2>
            <p className="text-gray-800 whitespace-pre-wrap">{prompt || "プロンプトが設定されていません。"}</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-pink-600 mb-2">{name ? name : selectedSpeakerCharacter}のプロンプトを編集</h2>
            <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} className="w-full h-40 p-2 border border-gray-300 rounded mb-4" />
            <button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded">
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
