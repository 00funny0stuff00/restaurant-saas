// @ts-nocheck
"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password) return alert("Please enter email and password");
    if (password.length < 6) return alert("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    alert("Account created! Check your email to confirm, then sign in.");
    window.location.href = "/login";
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://restaurant-saas-vert.vercel.app/dashboard" }
    });
  }

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto", padding: "60px 20px", background: "white", minHeight: "100vh", color: "#111" },
    title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    sub: { color: "#888", fontSize: 14, marginBottom: 32 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    btn: (bg) => ({ width: "100%", padding: 14, background: bg, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }),
    divider: { textAlign: "center", color: "#aaa", fontSize: 13, margin: "8px 0" },
    link: { background: "none", border: "none", color: "#ff4d00", fontSize: 13, cursor: "pointer", padding: 0 },
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Create your account</h1>
      <p style={s.sub}>Get your restaurant online in minutes</p>

      <input style={s.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={s.input} placeholder="Password (min 6 characters)" type="password" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSignup(); }} />

      <button style={s.btn("#111")} onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <div style={s.divider}>or</div>

      <button style={{ ...s.btn("white"), color: "#111", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={handleGoogle}>
        <img src="https://www.google.com/favicon.ico" width={18} height={18} />
        Continue with Google
      </button>

      <div style={{ marginTop: 16 }}>
        <a href="/login" style={{ ...s.link, textDecoration: "none" }}>Already have an account? Sign in →</a>
      </div>
    </div>
  );
}