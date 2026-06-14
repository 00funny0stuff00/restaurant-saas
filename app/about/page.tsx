// @ts-nocheck
"use client";

export default function AboutUs() {
  const s = {
    wrap: { maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", color: "#333", lineHeight: 1.6 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 24 },
    logo: { fontSize: 20, fontWeight: 900, color: "#ff4d00", textDecoration: "none" },
    title: { fontSize: 28, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 },
    sub: { fontSize: 13, color: "#888", margin: 0 },
    h2: { fontSize: 18, fontWeight: 700, margin: "24px 0 8px" }
  };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <a href="/" style={s.logo}>EchoTakeout</a>
        <a href="/" style={{ color: "#555", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to home</a>
      </header>

      <h1 style={s.title}>About Us</h1>
      <p style={s.sub}>Our mission and technology</p>

      <p>EchoTakeout is a cloud-hosted B2B restaurant software infrastructure designed and operated by <strong>A SUGUNA ATHIVEERAPERUMAL</strong>, an independent software developer based in Coimbatore, Tamil Nadu.</p>

      <h2 style={s.h2}>How We Help Independent Restaurants</h2>
      <p>Restaurants can connect their own payment providers and receive settlements directly through their payment accounts.</p>
    </div>
  );
}