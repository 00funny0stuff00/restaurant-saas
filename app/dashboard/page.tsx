// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Onboarding Form States
  const [restaurantName, setRestaurantName] = useState("");
  const [tagline, setTagline] = useState("");
  const [slug, setSlug] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    setUser(user);
    
    const { data: t } = await supabase.from("tenants").select("*").eq("user_id", user.id).single();
    setTenant(t);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
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

  // Handle Self-Onboarding Submission
  async function handleOnboarding(e) {
    e.preventDefault();
    if (!restaurantName.trim() || !slug.trim()) {
      return alert("Restaurant name and Restaurant ID are required.");
    }

    // Clean slug format: lowercase, alphanumeric and hyphens only
    const cleanedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanedSlug.length < 3) {
      return alert("Restaurant ID must be at least 3 characters long (letters, numbers, hyphens only)");
    }

    setOnboardingLoading(true);

    // 1. Check if the Restaurant ID (slug) is already taken
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("slug", cleanedSlug)
      .maybeSingle();

    if (existingTenant) {
      setOnboardingLoading(false);
      return alert(`The Restaurant ID "/${cleanedSlug}" is already taken. Please choose another unique ID.`);
    }

    // 2. Insert new Tenant Profile
    const { error: tenantError } = await supabase.from("tenants").insert([{
      slug: cleanedSlug,
      name: restaurantName.trim(),
      tagline: tagline.trim() || null,
      user_id: user.id,
      owner_email: user.email,
      primary_color: "#ff4d00",
      secondary_color: "#fff3ee",
      queue_limit_enabled: false,
      queue_limit: 10,
      dine_in_enabled: false,
      edit_order_enabled: false,
      customize_order_enabled: false,
      kitchen_pin: "1234" // Default setup pin
    }]);

    if (tenantError) {
      setOnboardingLoading(false);
      return alert("Failed to register restaurant. Please try again.");
    }

    // 3. Create a Free 30-Day Subscription
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 Days from now

    const { error: subscriptionError } = await supabase.from("subscriptions").insert([{
      tenant_slug: cleanedSlug,
      status: "active",
      expires_at: expirationDate.toISOString()
    }]);

    if (subscriptionError) {
      setOnboardingLoading(false);
      return alert("Restaurant registered, but failed to apply free trial. Please contact support.");
    }

    // Reload active state to instantly grant dashboard access
    await loadData();
    setOnboardingLoading(false);
  }

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", padding: "40px 20px", background: "white", minHeight: "100vh", color: "#111" },
    btn: (bg) => ({ padding: "12px 24px", background: bg, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }),
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    label: { fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 6 }
  };

  if (loading) return <div style={{ ...s.page, textAlign: "center", paddingTop: 80, color: "#888" }}>Loading...</div>;

  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Restaurant</h1>
        <button style={{ ...s.btn("#888"), width: "auto", padding: "8px 16px" }} onClick={handleLogout}>Sign out</button>
      </div>

      {!tenant ? (
        // Self Onboarding Registration Screen
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: "#ff4d00" }}>Register Your Restaurant</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Set up your free account with a 30-day free trial subscription instantly.</p>
          
          <form onSubmit={handleOnboarding}>
            <label style={s.label}>Restaurant Name</label>
            <input 
              style={s.input} 
              placeholder="e.g. Spice Garden" 
              value={restaurantName} 
              onChange={e => {
                setRestaurantName(e.target.value);
                // Auto-suggest slug from name
                const generated = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                setSlug(generated);
              }} 
              required
            />

            <label style={s.label}>Tagline (Optional)</label>
            <input style={s.input} placeholder="e.g. Fresh & Hot Delivery" value={tagline} onChange={e => setTagline(e.target.value)} />

            <label style={s.label}>Restaurant ID (Slug URL)</label>
            <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 10, padding: "0 12px", marginBottom: 12, border: "1px solid #ddd" }}>
              <span style={{ fontSize: 14, color: "#888", userSelect: "none" }}>echotakeout.com/</span>
              <input 
                style={{ ...s.input, background: "transparent", border: "none", marginBottom: 0, paddingLeft: 4 }} 
                placeholder="spice-garden" 
                value={slug} 
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} 
                required
              />
            </div>
            <p style={{ fontSize: 12, color: "#aaa", margin: "-4px 0 20px" }}>Letters, numbers, and hyphens only. This will be your public QR link.</p>

            <button type="submit" style={s.btn("#ff4d00")} disabled={onboardingLoading}>
              {onboardingLoading ? "Activating free trial..." : "Activate Free 30-Day Trial →"}
            </button>
          </form>
        </div>
      ) : (
        <div>
          {/* Restaurant info + quick links */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 18 }}>{tenant.name}</p>
            <p style={{ margin: "0 0 16px", color: "#888", fontSize: 13 }}>{tenant.tagline}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={`/${tenant.slug}`} style={{ ...s.btn("#111"), textDecoration: "none", display: "inline-block", width: "auto" }}>View menu</a>
              <a href={`/${tenant.slug}/admin`} style={{ ...s.btn("#ff4d00"), textDecoration: "none", display: "inline-block", width: "auto" }}>Admin panel</a>
              <a href={`/${tenant.slug}/kitchen`} style={{ ...s.btn("#16a34a"), textDecoration: "none", display: "inline-block", width: "auto" }}>Kitchen</a>
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
            <button style={{ ...s.btn(copied ? "#16a34a" : "#111"), padding: "8px 16px", fontSize: 13, width: "auto" }} onClick={copyUID}>
              {copied ? "✓ Copied!" : "Copy User ID"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}