import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIdToken } from "firebase/auth";
import { auth } from "../firebase";

interface CreateUserRequest {
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    if (!auth.currentUser) {
      setError("ログインしてください");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = await getIdToken(auth.currentUser, true);
      const response = await fetch("http://localhost:8080/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        } as CreateUserRequest),
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "ユーザー作成に失敗しました");
      }

      setSuccess(`ユーザーを作成しました: ${email}`);
      setEmail("");
      setPassword("");
      setRole("viewer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ユーザー作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480 }}>
      <h1>ユーザー管理</h1>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {success ? <p style={{ color: "green" }}>{success}</p> : null}

      <h2>新規ユーザー作成</h2>
      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as "admin" | "editor" | "viewer")}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={createUser} disabled={loading || !email || !password}>
          作成
        </button>
        <button onClick={() => navigate("/")} disabled={loading}>
          戻る
        </button>
      </div>
    </main>
  );
}
