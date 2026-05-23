import { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Internal App</h1>
      {!user ? (
        <button onClick={login}>Google でログイン</button>
      ) : (
        <>
          <p>ログイン中: {user.email}</p>
          <button onClick={logout}>ログアウト</button>
        </>
      )}
    </main>
  );
}

export default App;
