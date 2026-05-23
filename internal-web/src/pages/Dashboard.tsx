import { useState } from "react";
import { signOut, getIdToken } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    await signOut(auth);
  };

  const callMeApi = async () => {
    if (!auth.currentUser) {
      return;
    }

    setError(null);
    setApiResult(null);
    setLoading(true);
    try {
      const token = await getIdToken(auth.currentUser, true);
      const response = await fetch("http://localhost:8080/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json()) as {
        email?: string;
        error?: string;
        uid?: string;
        role?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "API呼び出しに失敗しました");
      }
      setApiResult(`認証済み: uid=${data.uid}, email=${data.email}, role=${data.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "API呼び出しに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const callAdminTestApi = async () => {
    if (!auth.currentUser) {
      return;
    }

    setError(null);
    setApiResult(null);
    setLoading(true);
    try {
      const token = await getIdToken(auth.currentUser, true);
      const response = await fetch("http://localhost:8081/admin_test", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json()) as { message?: string; error?: string; role?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "API呼び出しに失敗しました");
      }
      setApiResult(`Admin API: ${data.message}, role=${data.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "API呼び出しに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480 }}>
      <h1>Dashboard</h1>
      <p>ログイン中: {auth.currentUser?.email}</p>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={callMeApi} disabled={loading}>
          /me を呼ぶ
        </button>
        <button onClick={callAdminTestApi} disabled={loading}>
          /admin/test を呼ぶ
        </button>
        <button
          onClick={() => navigate("/admin/users")}
          disabled={loading}
          style={{ backgroundColor: "#0066cc", color: "white" }}
        >
          ユーザー管理
        </button>
        <button onClick={logout}>ログアウト</button>
      </div>
      {apiResult ? <p>{apiResult}</p> : null}
    </main>
  );
}
