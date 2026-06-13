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

      <h2 style={s.h2}>Our Core Mission</h2>
      <p>Modern dining customers expect speed, clarity, and convenience. Independent restaurant operators, however, often face high entry barriers, commission setups from major aggregators, or proprietary system configurations. EchoTakeout was built to bridge this gap by providing simple, affordable cloud-hosted menu and checkout infrastructure.</p>

      <h2 style={s.h2}>How We Help Independent Restaurants</h2>
      <p>Through EchoTakeout, local dining establishments can generate custom table-level QR codes, configure brand-matched digital interfaces, manage menu availability in real time, and route kitchen order tickets (KOT) seamlessly to their prep terminals. We provide the technology, and the restaurateur operates their culinary business independently with direct-to-bank settlements.</p>
    </div>
  );
}