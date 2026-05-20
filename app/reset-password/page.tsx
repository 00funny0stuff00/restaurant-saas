// @ts-nocheck
"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!password || password.length < 6) return alert("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return alert(error.message);
    alert("Password updated! Please sign in.");
    window.location.href = "/login";
  }

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto", padding: "60px 20px", background: "white", minHeight: "100vh", color: "#111" },
    title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    sub: { color: "#888", fontSize: 14, marginBottom: 32 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    btn: { width: "100%", padding: 14, background: "#111", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Set new password</h1>
      <p style={s.sub}>Enter your new password below</p>
      <input style={s.input} placeholder="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button style={s.btn} onClick={handleReset} disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </button>
    </div>
  );
}