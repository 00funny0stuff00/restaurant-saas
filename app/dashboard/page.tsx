// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data: t } = await supabase.from("tenants").select("*").eq("user_id", user.id).single();
      setTenant(t);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function copyUID() {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", padding: "40px 20px", background: "white", minHeight: "100vh", color: "#111" },
    btn: (bg) => ({ padding: "12px 24px", background: bg, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }),
  };

  if (loading) return <div style={{ ...s.page, textAlign: "center", paddingTop: 80, color: "#888" }}>Loading...</div>;

  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Restaurant</h1>
        <button style={s.btn("#888")} onClick={handleLogout}>Sign out</button>
      </div>

      {!tenant ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#888", marginBottom: 8 }}>No restaurant linked to your account yet.</p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 24 }}>Share your User ID with EchoTakeout support to get set up.</p>
          <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#888", margin: "0 0 8px" }}>YOUR USER ID</p>
            <p style={{ fontSize: 12, color: "#555", wordBreak: "break-all", margin: "0 0 12px", fontFamily: "monospace" }}>{user.id}</p>
            <button style={s.btn(copied ? "#16a34a" : "#111")} onClick={copyUID}>
              {copied ? "✓ Copied!" : "Copy User ID"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Restaurant info + quick links */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 18 }}>{tenant.name}</p>
            <p style={{ margin: "0 0 16px", color: "#888", fontSize: 13 }}>{tenant.tagline}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={`/${tenant.slug}`} style={{ ...s.btn("#111"), textDecoration: "none", display: "inline-block" }}>View menu</a>
              <a href={`/${tenant.slug}/admin`} style={{ ...s.btn("#ff4d00"), textDecoration: "none", display: "inline-block" }}>Admin panel</a>
              <a href={`/${tenant.slug}/kitchen`} style={{ ...s.btn("#16a34a"), textDecoration: "none", display: "inline-block" }}>Kitchen</a>
            </div>
          </div>

          {/* QR Code for dashboard */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 20, marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 14px", textAlign: "left" }}>📱 DASHBOARD QR CODE</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("https://restaurant-saas-vert.vercel.app/dashboard")}`}
              alt="Dashboard QR Code"
              style={{ borderRadius: 10, display: "block", margin: "0 auto 12px" }}
            />
            <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>Scan to open your dashboard on any device</p>
          </div>

          {/* User ID */}
          <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#888", margin: "0 0 4px" }}>YOUR USER ID</p>
            <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px" }}>Share this with EchoTakeout support if you need help with your account.</p>
            <p style={{ fontSize: 12, color: "#555", wordBreak: "break-all", margin: "0 0 12px", fontFamily: "monospace" }}>{user.id}</p>
            <button style={{ ...s.btn(copied ? "#16a34a" : "#111"), padding: "8px 16px", fontSize: 13 }} onClick={copyUID}>
              {copied ? "✓ Copied!" : "Copy User ID"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}