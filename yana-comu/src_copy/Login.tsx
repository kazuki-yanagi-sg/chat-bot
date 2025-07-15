// Login.tsx
import React, { useState } from "react";
import "./Login.css";

interface LoginProps {
  onSubmit: (name: string, password: string) => void;
  onSwitchToSignup: () => void; // 追加
}

const Login: React.FC<LoginProps> = ({ onSubmit, onSwitchToSignup }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(name, password);
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="form-title">🌸 ログイン 🌸</h1>
        <div className="form-row">
          <label htmlFor="name">名前</label>
          <input id="name" type="text" placeholder="yanasan" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="password">パスワード</label>
          <input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="login-button">
          ログインする
        </button>

        {/* ✅ この部分が「ログインボタンの下」に来る文言 */}
        <p className="switch-text">
          <a href="#" onClick={onSwitchToSignup}>
            アカウントをお持ちでない方はこちらで新規登録
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
