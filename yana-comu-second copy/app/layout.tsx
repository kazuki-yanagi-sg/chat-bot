import "./globals.scss";
import Header from "./components/Header";
import CitypopBackground from "./components/CitypopBackground";
import { AuthProvider } from "./context/AuthContext";

interface User {
  id: number;
  name: string;
  icon: string;
}
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const metadata = {
  title: "My Chat App",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html lang="ja">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic&display=swap" rel="stylesheet" />
        </head>
        <body className="relative overflow-hidden">
          <AuthProvider>
            {" "}
            <Header />
            <CitypopBackground />
            <main className="relative z-10">{children}</main>
          </AuthProvider>
        </body>
      </html>
    </>
  );
}
