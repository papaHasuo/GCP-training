import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const login = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Googleログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithEmail = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "メールログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async () => {
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アカウント作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480 }}>
      <h1>Internal App</h1>
      <p>Googleログインか、メールアドレスとパスワードでログインできます。</p>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {!user ? (
        <>
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
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={signInWithEmail} disabled={loading || !email || !password}>
              メールでログイン
            </button>
            <button onClick={signUpWithEmail} disabled={loading || !email || !password}>
              新規登録
            </button>
            <button onClick={login} disabled={loading}>
              Google でログイン
            </button>
          </div>
        </>
      ) : (
        <>
          <p>ログイン中: {user?.email}</p>
          <button onClick={logout}>ログアウト</button>
        </>
      )}
    </main>
  );
}

export default App;
