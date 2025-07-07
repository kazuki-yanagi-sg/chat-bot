// UploadIcon.tsx
import React from "react";

interface UploadIconProps {
  userId: number;
}

const UploadIcon: React.FC<UploadIconProps> = ({ userId }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/upload-icon/${userId}`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("アイコンをアップロードしました！");
      } else {
        alert("アップロード失敗");
      }
    } catch (err) {
      alert("通信エラー");
    }
  };

  return (
    <>
      <a href="#" className="nav-icon-link" onClick={handleClick}>
        アイコンを設定
      </a>
      <input type="file" ref={fileInputRef} onChange={handleChange} style={{ display: "none" }} accept="image/*" />
    </>
  );
};

export default UploadIcon;
