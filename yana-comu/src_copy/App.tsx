import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import CloudBackground from "./CloudBackground";
import TimeCycleBackground from "./TimeCycleBackground";
import Chat from "./Chat";
import Login from "./Login";
import Signup from "./Signup";
import UploadIcon from "./UploadIcon";

function App() {
  const [timePhase, setTimePhase] = useState("morning");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理
  const [isLoginMode, setIsLoginMode] = useState(true); // ログイン/登録の切り替え
  const [userId, setUserId] = useState<number | null>(null); // ユーザーIDの状態
  const [userIcon, setUserIcon] = useState<string>("cat.jpeg");
  const [userName, setUserName] = useState<string>("");

  // 背景画面を制御
  useEffect(() => {
    const phases = ["morning", "noon", "evening", "night"];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % phases.length;
      setTimePhase(phases[index]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ログイン処理
  const handleLogin = async (name: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:8000/login", {
        name,
        password,
      });
      if (response.status === 200) {
        alert("ログインしました。");
        setIsLoggedIn(true);
        setUserId(response.data.user_id); // サーバーがuser_idを返すようにする
        setUserName(response.data.user_name);
        setUserIcon(response.data.user_icon || "cat.jpeg"); // ← これが必要！
        console.log(response.data.user_icon);
      } else {
        alert("ログインに失敗しました。");
      }
    } catch (error: any) {
      alert("ログインエラー:" + (error.response?.data.detail || error.message));
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("ログアウトしました。");
  };

  return (
    <>
      <TimeCycleBackground />
      <CloudBackground timePhase={timePhase} />
      {isLoggedIn && (
        <>
          <Chat isDisabled={!isLoggedIn} userIcon={userIcon || "cat.jpeg"} userName={userName} />
        </>
      )}
      ;
      <header className="app-header">
        <div className="header-inner">
          <h1 className="logo-text">YANAYANA 🐾</h1>{" "}
          <nav className="nav-menu">
            <ul>
              <li>
                <a href="#">ホーム</a>
              </li>
              <li>
                <a href="#">サービス</a>
              </li>
              <li>
                <a href="#">お問い合わせ</a>
              </li>
              {isLoggedIn && (
                <>
                  <li>
                    <a href="#" onClick={handleLogout}>
                      ログアウト
                    </a>
                  </li>
                  <li>
                    {/* アップロードコンポーネントをログアウトの下に追加 */}
                    {userId && <UploadIcon userId={userId} />}
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      {!isLoggedIn && (
        <div className="auth-modal">
          <div className="auth-card">
            {isLoginMode ? (
              <>
                <Login onSubmit={handleLogin} onSwitchToSignup={() => setIsLoginMode(false)} />
              </>
            ) : (
              <>
                <Signup onSignupSuccess={() => setIsLoginMode(true)} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
