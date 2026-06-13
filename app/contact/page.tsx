// @ts-nocheck
"use client";

export default function ContactUs() {
  const s = {
    wrap: { maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", color: "#333", lineHeight: 1.6 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 24 },
    logo: { fontSize: 20, fontWeight: 900, color: "#ff4d00", textDecoration: "none" },
    title: { fontSize: 28, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 },
    sub: { fontSize: 13, color: "#888", margin: 0 },
    h2: { fontSize: 18, fontWeight: 700, margin: "24px 0 8px" },
    box: { border: "1px solid #eee", borderRadius: 12, padding: "24px", background: "#fafafa", marginTop: 24 }
  };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <a href="/" style={s.logo}>EchoTakeout</a>
        <a href="/" style={{ color: "#555", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to home</a>
      </header>

      <h1 style={s.title}>Contact Us</h1>
      <p style={s.sub}>Get in touch with EchoTakeout support.</p>

      <p>For questions concerning platform uptime, SaaS billing, merchant account registrations, or technical platform issues, please contact our support desk.</p>

      <div style={s.box}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#ff4d00" }}>Business & Support Details</h3>
        <p style={{ margin: "0 0 8px" }}><strong>Product Name:</strong> EchoTakeout</p>
        <p style={{ margin: "0 0 8px" }}><strong>Owner:</strong> A SUGUNA ATHIVEERAPERUMAL</p>
        <p style={{ margin: "0 0 8px" }}><strong>Business Profile:</strong> Independent software developer / sole proprietor providing restaurant software services</p>
        <p style={{ margin: "0 0 8px" }}><strong>Support Email:</strong> <a href="mailto:echotakeout@gmail.com" style={{ color: "#ff4d00", textDecoration: "none" }}>echotakeout@gmail.com</a></p>
        <p style={{ margin: "0 0 8px" }}><strong>Support Phone:</strong> +91 8746 69420</p>
        <p style={{ margin: "0" }}><strong>Physical Address:</strong> NO 20 GROUND FLOOR, LAKSHMIPURAM, 6TH STREET, PEELAMEDU, COIMBATORE, TAMIL NADU 641004, India</p>
      </div>

      <p style={{ fontSize: 12, color: "#aaa", marginTop: 20 }}>
        Note: EchoTakeout is not a restaurant. For queries regarding menu listings, allergen information, delivery, or refunds of specific food orders, please contact the respective restaurant directly.
      </p>
    </div>
  );
}