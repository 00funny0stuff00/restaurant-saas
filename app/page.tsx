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
    footer: { borderTop: "1px solid #eee", padding: "48px 24px", textAlign: "center", color: "#666", fontSize: 13, background: "#fcfcfc" },
    footerLinks: { display: "flex", justifyContent: "center", gap: "16px", margin: "16px 0 24px", flexWrap: "wrap" },
    link: { color: "#555", textDecoration: "none", fontWeight: "600" }
  };

  const features = [
    { icon: "🍽️", title: "Customized digital menu systems", desc: "Restaurants use our infrastructure to generate branded customer checkout menus aligned with their brand identity." },
    { icon: "📱", title: "Kitchen Order Ticket (KOT) routing", desc: "Kitchen displays dynamically capture and categorize table orders for preparation staff." },
    { icon: "📦", title: "Real-time ticket tracking", desc: "Customer tokens sync with database state updates to monitor preparation milestones on any mobile browser." },
    { icon: "🔒", title: "Automated stock syncing", desc: "Instantly toggle menu item availability to prevent customers from placing orders on out-of-stock inventory." },
    { icon: "📊", title: "SaaS analytics & exports", desc: "Merchant admins can generate reporting filters, analyze daily sales volumes, and export operational reports as CSV files." },
    { icon: "⚡", title: "Cloud hosted infrastructure", desc: "We host the software infrastructure. No proprietary hardware or on-premise installation is required." },
  ];

  const steps = [
    { title: "Configure your SaaS account", desc: "Register your restaurant profile on our platform and specify operational limits." },
    { title: "Build your digital layout", desc: "Upload your catalog items, brand colors, and configure table seating metadata." },
    { title: "Deploy QR-based menus", desc: "We generate custom table-level QR codes mapping to your unique EchoTakeout software terminal." },
    { title: "Manage operations in real-time", desc: "View incoming tickets, update statuses, monitor payments, and manage menus directly." },
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
        <span style={s.heroTag}>Restaurant SaaS Infrastructure 🇮🇳</span>
        <h1 style={s.heroTitle}>Software built for modern dining</h1>
        <p style={s.heroSub}>EchoTakeout provides restaurants with secure QR ordering infrastructure, real-time kitchen displays, and live order management tools—hosted in the cloud.</p>
        <a href="/signup" style={s.ctaBtn}>Get your restaurant software →</a>
        <a href="/zeal-fried-chicken" style={s.demoBtn}>See a demo</a>
      </div>

      {/* Features */}
      <div style={{ background: "#fafafa", padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={s.sectionTitle}>B2B restaurant management tools</h2>
          <p style={s.sectionSub}>A complete software suite designed to streamline restaurant workflows.</p>
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
        <h2 style={s.sectionTitle}>The onboarding process</h2>
        <p style={s.sectionSub}>Getting your digital workspace live.</p>
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
          <h2 style={s.sectionTitle}>Simple SaaS pricing</h2>
          <p style={s.sectionSub}>Transparent monthly subscription plans. No transaction commissions.</p>
          <div style={s.pricingCard}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>SaaS Starter Plan</p>
            <p style={s.pricingAmount}>₹999</p>
            <p style={s.pricingPer}>per month</p>
            {[
              "Multi-tenant menu builder", 
              "KOT kitchen terminal access", 
              "Active order tracking", 
              "Stock status controller", 
              "Operational reports & CSV exports", 
              "Unlimited table QR generation", 
              "Direct payment gateway integration support"
            ].map(f => (
              <p key={f} style={s.pricingFeature}>✅ {f}</p>
            ))}
            <a href="/signup" style={{ ...s.ctaBtn, display: "block", marginTop: 24, marginRight: 0 }}>Subscribe now →</a>
          </div>
        </div>
      </div>

      {/* Footer (Optimized for Razorpay compliance audit) */}
      <footer style={s.footer}>
        <p style={{ fontWeight: 900, color: "#ff4d00", fontSize: 18, marginBottom: 8 }}>EchoTakeout</p>
        
        {/* Mandated compliance policy routing */}
        <div style={s.footerLinks}>
          <a href="/privacy" style={s.link}>Privacy Policy</a>
          <a href="/terms" style={s.link}>Terms of Service</a>
          <a href="/refund" style={s.link}>Cancellation & Refund Policy</a>
          <a href="/contact" style={s.link}>Contact Us</a>
        </div>

        <p style={{ margin: "4px 0" }}>© {new Date().getFullYear()} EchoTakeout. All rights reserved.</p>
        <p style={{ fontSize: "11px", color: "#888", marginTop: "12px", lineHeight: "1.4" }}>
          EchoTakeout is a restaurant operations software product owned and operated by <strong style={{color: "#444"}}>[YOUR REGISTERED LEGAL ENTITY NAME, e.g., EchoTakeout Technologies Pvt. Ltd.]</strong>.<br />
          We provide digital menu hosting, administrative terminals, and payment routing tools. Financial settlements are processed directly by participating merchant entities.
        </p>
      </footer>
    </div>
  );
}