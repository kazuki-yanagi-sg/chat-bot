import React, { useState } from "react";
import "./Signup.css"; // スタイルも別途整えると◎

interface SignupProps {
  onSignupSuccess: () => void; // 登録成功 or 「ログインはこちら」リンク用
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (res.ok) {
        alert("登録に成功しました！");
        onSignupSuccess(); // ログイン画面へ戻す
      } else {
        const data = await res.json();
        alert("登録エラー: " + data.detail);
      }
    } catch (err) {
      alert("通信エラー");
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="signup-form">
        <h1 className="form-title">🌱 新規登録 🌱</h1>
        <div className="form-row">
          <label>ユーザー名</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="yanasan" />
        </div>
        <div className="form-row">
          <label>パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
        </div>
        <button type="submit" className="signup-button">
          登録
        </button>

        {/* ✅ 「ログインはこちら」リンク */}
        <p className="switch-text">
          すでにアカウントをお持ちの方は{" "}
          <a href="#" onClick={onSignupSuccess}>
            ログインはこちら
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
