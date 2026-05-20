// @ts-nocheck
"use client";

export default function LandingPage() {
  const s = {
    page: { fontFamily: "sans-serif", background: "white", color: "#111", margin: 0 },
    nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, background: "white", zIndex: 10 },
    logo: { fontSize: 20, fontWeight: 900, color: "#ff4d00", letterSpacing: -1 },
    navLinks: { display: "flex", gap: 12, alignItems: "center" },
    loginBtn: { padding: "8px 20px", border: "1px solid #ddd", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#111", textDecoration: "none" },
    signupBtn: { padding: "8px 20px", border: "none", borderRadius: 8, background: "#ff4d00", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "white", textDecoration: "none" },
    hero: { textAlign: "center", padding: "80px 24px 60px", maxWidth: 640, margin: "0 auto" },
    heroTag: { display: "inline-block", background: "#fff3ee", color: "#ff4d00", fontWeight: 700, fontSize: 13, padding: "4px 14px", borderRadius: 20, marginBottom: 24 },
    heroTitle: { fontSize: 48, fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: -2 },
    heroSub: { fontSize: 18, color: "#555", marginBottom: 36, lineHeight: 1.6 },
    ctaBtn: { display: "inline-block", padding: "16px 36px", background: "#ff4d00", color: "white", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none", marginRight: 12 },
    demoBtn: { display: "inline-block", padding: "16px 36px", background: "#f3f4f6", color: "#111", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" },
    section: { padding: "64px 24px", maxWidth: 960, margin: "0 auto" },
    sectionTitle: { fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 12, letterSpacing: -1 },
    sectionSub: { fontSize: 16, color: "#777", textAlign: "center", marginBottom: 48 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 },
    featureCard: { border: "1px solid #eee", borderRadius: 16, padding: 28 },
    featureIcon: { fontSize: 32, marginBottom: 16 },
    featureTitle: { fontWeight: 700, fontSize: 16, marginBottom: 8 },
    featureDesc: { color: "#777", fontSize: 14, lineHeight: 1.6 },
    stepsWrap: { maxWidth: 600, margin: "0 auto" },
    step: { display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 36 },
    stepNum: { width: 40, height: 40, borderRadius: "50%", background: "#ff4d00", color: "white", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    stepTitle: { fontWeight: 700, fontSize: 16, marginBottom: 4 },
    stepDesc: { color: "#777", fontSize: 14, lineHeight: 1.6 },
    pricingCard: { border: "2px solid #ff4d00", borderRadius: 20, padding: 36, maxWidth: 360, margin: "0 auto", textAlign: "center" },
    pricingAmount: { fontSize: 52, fontWeight: 900, color: "#ff4d00", letterSpacing: -2 },
    pricingPer: { fontSize: 16, color: "#888", marginBottom: 24 },
    pricingFeature: { fontSize: 14, color: "#444", marginBottom: 10, textAlign: "left" },
    footer: { borderTop: "1px solid #eee", padding: "32px 24px", textAlign: "center", color: "#aaa", fontSize: 13 },
  };

  const features = [
    { icon: "🍽️", title: "Beautiful menu pages", desc: "Each restaurant gets a branded ordering page with their logo, colours, and menu — live in minutes." },
    { icon: "📱", title: "Real-time kitchen display", desc: "Kitchen staff see orders instantly. Mark items as preparing or ready with one tap." },
    { icon: "📦", title: "Live order tracking", desc: "Customers track their order status in real time with a token number — no app needed." },
    { icon: "🔒", title: "Stock management", desc: "Mark items out of stock instantly. Customers can't order what isn't available." },
    { icon: "📊", title: "Order history & exports", desc: "Download all orders as CSV. Filter by date, track revenue, manage logistics." },
    { icon: "⚡", title: "No setup required", desc: "No hardware, no developers, no app installs. Works on any phone or tablet browser." },
  ];

  const steps = [
    { title: "Sign up in seconds", desc: "Create your account with email or Google. No credit card required to start." },
    { title: "We set up your restaurant", desc: "Share your menu and brand colours. We'll get your ordering page live within 24 hours." },
    { title: "Share your link", desc: "Put your unique URL on your menu, WhatsApp, Instagram — customers start ordering instantly." },
    { title: "Manage everything from admin", desc: "Add items, update prices, view orders and download reports — all from your phone." },
  ];

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <span style={s.logo}>EchoTakeout</span>
        <div style={s.navLinks}>
          <a href="/login" style={s.loginBtn}>Sign in</a>
          <a href="/signup" style={s.signupBtn}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <span style={s.heroTag}>Built for Indian restaurants 🇮🇳</span>
        <h1 style={s.heroTitle}>Your restaurant,<br />online in minutes</h1>
        <p style={s.heroSub}>EchoTakeout gives your restaurant a branded ordering page, live kitchen display, and order tracking — with zero setup and no app required.</p>
        <a href="/signup" style={s.ctaBtn}>Get your restaurant online →</a>
        <a href="/vishals-kitchen" style={s.demoBtn}>See a demo</a>
      </div>

      {/* Features */}
      <div style={{ background: "#fafafa", padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={s.sectionTitle}>Everything your restaurant needs</h2>
          <p style={s.sectionSub}>One simple system. No technical knowledge required.</p>
          <div style={s.grid}>
            {features.map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <p style={s.featureTitle}>{f.title}</p>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>How it works</h2>
        <p style={s.sectionSub}>From signup to first order in under 24 hours.</p>
        <div style={s.stepsWrap}>
          {steps.map((step, i) => (
            <div key={step.title} style={s.step}>
              <div style={s.stepNum}>{i + 1}</div>
              <div>
                <p style={s.stepTitle}>{step.title}</p>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: "#fafafa", padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={s.sectionTitle}>Simple pricing</h2>
          <p style={s.sectionSub}>One plan. Everything included. Cancel anytime.</p>
          <div style={s.pricingCard}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Starter Plan</p>
            <p style={s.pricingAmount}>₹999</p>
            <p style={s.pricingPer}>per month</p>
            {["Branded ordering page", "Live kitchen display", "Order tracking for customers", "Stock management", "Order history & CSV export", "Unlimited orders", "WhatsApp & email support"].map(f => (
              <p key={f} style={s.pricingFeature}>✅ {f}</p>
            ))}
            <a href="/signup" style={{ ...s.ctaBtn, display: "block", marginTop: 24, marginRight: 0 }}>Get started →</a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={{ fontWeight: 700, color: "#ff4d00", fontSize: 16, marginBottom: 8 }}>EchoTakeout</p>
        <p>© {new Date().getFullYear()} EchoTakeout. All rights reserved.</p>
      </footer>
    </div>
  );
}