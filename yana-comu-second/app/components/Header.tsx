"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ChatModal from "@/components/Chat/ChatModal";
import SignUpModal from "@/components/forms/SignUpModal";
import SettingModal from "@/components/forms/SettingModal";

export default function Header() {
  const [speakers, setSpeakers] = useState<{ id: number; character: string; state?: string }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTabletSidebar, setIsTabletSidebar] = useState(false);

  useEffect(() => {
    fetch("/data/speakers.json")
      .then((res) => res.json())
      .then((data) => setSpeakers(data))
      .catch((e) => console.error("speakers.json の読み込みに失敗しました", e));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletSidebar(width <= 1073 && width > 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isAuthenticated, setAuthenticated, user } = useAuth();
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isSettingModalOpen, setSettingModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<number>(46);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  const handleSpeakerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speakerId = Number(e.target.value);
    setSelectedSpeaker(speakerId);
    localStorage.setItem("voiceSpeaker", speakerId.toString());
  };

  const userIconUrl = user ? `http://localhost:8000/user_icon/${user.icon}` : undefined;

  console.log(isChatModalOpen);

  return (
    <div className="relative">
      {/* タブレット向けサイドバー */}
      {isTabletSidebar && (
        <aside className="fixed top-0 left-0 w-64 h-full bg-pink-100 p-4 shadow-lg z-40 space-y-4">
          <div className="text-3xl font-bold text-pink-700 tracking-wide select-none" style={{ fontFamily: "'Baloo 2', cursive" }}>
            YANAYANA 🐾
          </div>
          <Link href="/" className="block text-pink-700 font-semibold">
            ホーム
          </Link>
          {isAuthenticated && (
            <>
              <button onClick={() => setChatModalOpen(true)} className="block text-pink-700">
                AIちゃんと会話
              </button>
              <select value={selectedSpeaker} onChange={handleSpeakerChange} className="w-full text-pink-700 border border-pink-300 rounded px-2 py-1">
                {speakers.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.character}
                    {sp.state ? `(${sp.state})` : ""}
                  </option>
                ))}
              </select>
              <button onClick={() => setSettingModalOpen(true)} className="block text-pink-700">
                ユーザ情報設定
              </button>
              <button onClick={handleLogout} className="block text-pink-700">
                ログアウト
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link href="/login" className="block text-pink-700 font-semibold">
                ログイン
              </Link>
              <button onClick={() => setSignUpModalOpen(true)} className="block text-pink-700 font-semibold">
                登録
              </button>
            </>
          )}
        </aside>
      )}

      {/* モバイル用スライドメニュー */}
      {!isTabletSidebar && (
        <>
          {menuOpen && <div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>}
          <div className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}>
            <div className="p-4 space-y-4">
              <Link href="/" onClick={() => setMenuOpen(false)} className="block text-pink-700 font-semibold">
                ホーム
              </Link>
              {isAuthenticated && (
                <>
                  <button onClick={() => setChatModalOpen(true)} className="block text-pink-700">
                    AIちゃんと会話
                  </button>
                  <select value={selectedSpeaker} onChange={handleSpeakerChange} className="w-full text-pink-700 border border-pink-300 rounded px-2 py-1">
                    {speakers.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.character}
                        {sp.state ? `(${sp.state})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSettingModalOpen(true);
                      setMenuOpen(false);
                    }}
                    className="block text-pink-700"
                  >
                    ユーザ情報設定
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block text-pink-700"
                  >
                    ログアウト
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link href="/login" className="block text-pink-700 font-semibold">
                    ログイン
                  </Link>
                  <button onClick={() => setChatModalOpen(true)} className="block text-pink-700 font-semibold">
                    登録
                  </button>
                </>
              )}
            </div>
          </div>
          {/* ハンバーガーボタン */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-pink-700 focus:outline-none ml-auto absolute top-4 right-4 z-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </>
      )}

      {/* デスクトップナビゲーション（サイドメニューある場合は非表示） */}
      {!isTabletSidebar && (
        <header className="bg-gradient-to-r from-pink-300 via-pink-200 to-pink-100 text-pink-900 shadow-lg p-4 flex flex-wrap items-center justify-between rounded-b-3xl relative md:pl-64">
          <div className="text-3xl font-bold text-pink-700 tracking-wide select-none" style={{ fontFamily: "'Baloo 2', cursive" }}>
            YANAYANA <span className="text-pink-500 text-4xl">🐾</span>
          </div>
          <nav className="hidden md:flex md:items-center space-x-6">
            <Link href="/" className="px-4 py-2 rounded-full text-pink-700 font-semibold hover:text-pink-500 hover:scale-110 transition-transform duration-200">
              ホーム
            </Link>
            {isAuthenticated && (
              <>
                <button onClick={() => setChatModalOpen(true)} className="px-4 py-2 rounded-full text-pink-700 font-semibold hover:text-pink-500 hover:scale-110 transition">
                  AIちゃんと会話
                </button>
                <select id="voice-speaker-select" value={selectedSpeaker} onChange={handleSpeakerChange} className="text-gray-900 rounded border border-pink-400 bg-pink-50 text-pink-700 px-3 py-1 cursor-pointer hover:bg-pink-100 transition">
                  <option value="" disabled hidden>
                    声を選択
                  </option>
                  {speakers.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.character}
                      {sp.state ? `(${sp.state})` : ""}
                    </option>
                  ))}
                </select>
              </>
            )}
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="px-4 py-2 rounded-full text-pink-700 font-semibold hover:text-pink-500 hover:scale-110 transition">
                  ログイン
                </Link>
                <button onClick={() => setSignUpModalOpen(true)} className="px-4 py-2 rounded-full text-pink-700 font-semibold hover:text-pink-500 hover:scale-110 transition">
                  登録
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLogout} className="px-4 py-2 rounded-full text-pink-700 font-semibold hover:text-pink-500 hover:scale-110 transition">
                  ログアウト
                </button>
                <button onClick={() => setSettingModalOpen(true)} className="px-4 py-2 rounded-full text-pink-700 font-semibold hover:text-pink-500 hover:scale-110 transition">
                  ユーザ情報設定
                </button>
                {userIconUrl && <img src={userIconUrl} alt="ユーザーアイコン" className="w-10 h-10 rounded-full border-2 border-pink-400 shadow-md ml-4" />}
              </>
            )}
          </nav>
        </header>
      )}

      {/* モーダル */}
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setSignUpModalOpen(false)} />
      <ChatModal isOpen={isChatModalOpen} onClose={() => setChatModalOpen(false)} userIconUrl={userIconUrl} selectedSpeaker={selectedSpeaker} />
      {user && <SettingModal isOpen={isSettingModalOpen} onClose={() => setSettingModalOpen(false)} userId={user.id} currentName={user.name} currentIconUrl={`http://localhost:8000/user_icons/${user.icon}`} onUpdateSuccess={() => {}} />}
    </div>
  );
}
