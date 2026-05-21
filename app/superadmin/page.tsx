// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const SUPER_EMAIL = "00funny0stuff00@gmail.com";
const SUPER_PASSWORD = "Funny*69420";

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("restaurants");

  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  // New restaurant form
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newColor, setNewColor] = useState("#ff4d00");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === SUPER_EMAIL) {
        setAuthed(true);
        await loadAll();
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  async function handleLogin() {
    if (password !== SUPER_PASSWORD) return alert("Wrong password");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== SUPER_EMAIL) return alert("You must be logged in as the super admin account.");
    setAuthed(true);
    await loadAll();
  }

  async function loadAll() {
    const { data: t } = await supabase.from("tenants").select("*").order("name");
    const { data: s } = await supabase.from("subscriptions").select("*");
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    setTenants(t ?? []);
    setSubscriptions(s ?? []);
    setAllOrders(o ?? []);

    // Load users from auth — we'll match by user_id
    const userIds = [...new Set((t ?? []).map(x => x.user_id).filter(Boolean))];
    const userMap = {};
    for (const id of userIds) {
      const { data } = await supabase.from("tenants").select("user_id").eq("user_id", id).single();
      if (data) userMap[id] = id;
    }
    setUsers(userIds);
  }

  async function createRestaurant() {
    if (!newSlug || !newName) return alert("Slug and name are required");

    // Find user by email if provided
    let userId = null;
    if (newUserEmail) {
      const { data: t } = await supabase.from("tenants").select("user_id").eq("user_id", newUserEmail).single();
      // We can't look up auth users directly from client, so we'll match later
    }

    const { error } = await supabase.from("tenants").insert([{
      slug: newSlug, name: newName, tagline: newTagline, primary_color: newColor,
    }]);
    if (error) return alert("Error: " + error.message);

    await supabase.from("subscriptions").insert([{
      tenant_slug: newSlug, status: "active",
      expires_at: newExpiry ? new Date(newExpiry).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }]);

    setNewSlug(""); setNewName(""); setNewTagline(""); setNewColor("#ff4d00"); setNewUserEmail(""); setNewExpiry("");
    alert("Restaurant created! Link it to a user account in the Restaurants tab.");
    await loadAll();
  }

  async function deleteRestaurant(slug) {
    if (!confirm(`Delete ${slug} and ALL its data? This cannot be undone.`)) return;
    await supabase.from("menu_items").delete().eq("tenant_slug", slug);
    await supabase.from("orders").delete().eq("tenant_slug", slug);
    await supabase.from("subscriptions").delete().eq("tenant_slug", slug);
    await supabase.from("tenants").delete().eq("slug", slug);
    await loadAll();
  }

  async function linkUser(slug, userId) {
    await supabase.from("tenants").update({ user_id: userId || null }).eq("slug", slug);
    await loadAll();
  }

  async function updateSubscription(slug, status, expiresAt) {
    await supabase.from("subscriptions").update({ status, expires_at: new Date(expiresAt).toISOString() }).eq("tenant_slug", slug);
    await loadAll();
  }

  async function extendSubscription(slug, days) {
    const sub = subscriptions.find(s => s.tenant_slug === slug);
    if (!sub) return;
    const current = new Date(sub.expires_at);
    const newDate = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);
    await supabase.from("subscriptions").update({ status: "active", expires_at: newDate.toISOString() }).eq("tenant_slug", slug);
    await loadAll();
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p style={{ color: "#888" }}>Loading...</p>
    </div>
  );

  if (!authed) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto", padding: "80px 20px", textAlign: "center", background: "white", minHeight: "100vh", color: "#111" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>EchoTakeout</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Super Admin Panel</p>
      <input
        type="password" placeholder="Super admin password"
        value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" }}
      />
      <button onClick={handleLogin} style={{ width: "100%", padding: 14, background: "#111", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        Enter
      </button>
    </div>
  );

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 720, margin: "0 auto", padding: 24, background: "white", minHeight: "100vh", color: "#111" },
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 10, boxSizing: "border-box" },
    btn: (color) => ({ padding: "8px 16px", background: color, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }),
    tab: (active) => ({ padding: "10px 16px", border: "none", borderBottom: active ? "3px solid #111" : "3px solid transparent", background: "none", cursor: "pointer", fontWeight: active ? 700 : 400, color: active ? "#111" : "#888", fontSize: 13 }),
    card: { border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 12 },
    label: { fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4, display: "block" },
  };

  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);

  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>🔐 Super Admin</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>EchoTakeout Platform</p>
        </div>
        <button style={s.btn("#888")} onClick={() => { supabase.auth.signOut(); window.location.href = "/login"; }}>Sign out</button>
      </div>

      {/* Platform stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, margin: "20px 0 24px" }}>
        {[
          { label: "Restaurants", value: tenants.length },
          { label: "Total orders", value: allOrders.length },
          { label: "Total revenue", value: `₹${totalRevenue.toFixed(0)}` },
          { label: "Active subs", value: subscriptions.filter(s => s.status === "active").length },
        ].map(stat => (
          <div key={stat.label} style={{ background: "#f9f9f9", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{stat.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: 24, overflowX: "auto" }}>
        <button style={s.tab(tab === "restaurants")} onClick={() => setTab("restaurants")}>Restaurants</button>
        <button style={s.tab(tab === "subscriptions")} onClick={() => setTab("subscriptions")}>Subscriptions</button>
        <button style={s.tab(tab === "orders")} onClick={() => setTab("orders")}>All Orders</button>
        <button style={s.tab(tab === "create")} onClick={() => setTab("create")}>+ New Restaurant</button>
      </div>

      {tab === "create" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Create new restaurant</h3>
          <label style={s.label}>Slug (URL identifier e.g. "spice-garden")</label>
          <input style={s.input} placeholder="spice-garden" value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
          <label style={s.label}>Restaurant name</label>
          <input style={s.input} placeholder="Spice Garden" value={newName} onChange={e => setNewName(e.target.value)} />
          <label style={s.label}>Tagline</label>
          <input style={s.input} placeholder="Authentic Indian flavours" value={newTagline} onChange={e => setNewTagline(e.target.value)} />
          <label style={s.label}>Brand colour</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: 48, height: 40, border: "none", cursor: "pointer", borderRadius: 6 }} />
            <span style={{ fontSize: 14, color: "#555" }}>{newColor}</span>
          </div>
          <label style={s.label}>Subscription expiry date</label>
          <input style={s.input} type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
          <p style={{ fontSize: 12, color: "#888", margin: "-4px 0 12px" }}>Leave blank for 30 days from today</p>
          <button style={{ ...s.btn("#111"), padding: "12px 24px", fontSize: 14 }} onClick={createRestaurant}>
            Create restaurant
          </button>
        </div>
      )}

      {tab === "restaurants" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>All restaurants ({tenants.length})</h3>
          {tenants.map(t => {
            const sub = subscriptions.find(s => s.tenant_slug === t.slug);
            const expires = sub ? new Date(sub.expires_at) : null;
            const isExpired = expires && expires < new Date();
            return (
              <div key={t.slug} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.primary_color ?? "#ff4d00" }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{t.name}</p>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>/{t.slug}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: isExpired ? "#ef4444" : "#16a34a", fontWeight: 600 }}>
                      {sub ? `${isExpired ? "Expired" : "Active"} · ${expires?.toLocaleDateString("en-IN")}` : "No subscription"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a href={`/${t.slug}`} target="_blank" style={{ ...s.btn("#f3f4f6"), color: "#111", textDecoration: "none" }}>View</a>
                    <a href={`/${t.slug}/admin`} target="_blank" style={{ ...s.btn("#f3f4f6"), color: "#111", textDecoration: "none" }}>Admin</a>
                    <button style={s.btn("#ef4444")} onClick={() => deleteRestaurant(t.slug)}>Delete</button>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                  <label style={s.label}>Linked user ID (paste from Supabase Auth)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={{ ...s.input, marginBottom: 0, flex: 1, fontSize: 12 }}
                      placeholder="User UUID or leave blank to unlink"
                      defaultValue={t.user_id ?? ""}
                      id={`user-${t.slug}`}
                    />
                    <button style={s.btn("#111")} onClick={() => {
                      const val = document.getElementById(`user-${t.slug}`).value.trim();
                      linkUser(t.slug, val);
                    }}>Save</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "subscriptions" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Subscriptions</h3>
          {tenants.map(t => {
            const sub = subscriptions.find(s => s.tenant_slug === t.slug);
            const expires = sub ? new Date(sub.expires_at) : null;
            const isExpired = expires && expires < new Date();
            return (
              <div key={t.slug} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{t.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: isExpired ? "#ef4444" : "#16a34a", fontWeight: 600 }}>
                      {sub ? `${sub.status?.toUpperCase()} · expires ${expires?.toLocaleDateString("en-IN")}` : "No subscription"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={s.btn("#16a34a")} onClick={() => extendSubscription(t.slug, 30)}>+30 days</button>
                    <button style={s.btn("#f59e0b")} onClick={() => extendSubscription(t.slug, 7)}>+7 days</button>
                    <button style={s.btn("#ef4444")} onClick={() => {
                      if (!sub) return alert("No subscription found");
                      updateSubscription(t.slug, "expired", sub.expires_at);
                    }}>Expire</button>
                  </div>
                </div>
                {sub && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="date" id={`exp-${t.slug}`} defaultValue={expires?.toLocaleDateString("en-CA")}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} />
                    <button style={s.btn("#111")} onClick={() => {
                      const val = document.getElementById(`exp-${t.slug}`).value;
                      if (!val) return alert("Pick a date");
                      updateSubscription(t.slug, "active", val);
                    }}>Set date</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "orders" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>All orders (last 200)</h3>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Total revenue across all restaurants: ₹{totalRevenue.toFixed(2)}</p>
          {allOrders.map(order => (
            <div key={order.id} style={{ ...s.card, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>#{order.id} — {order.customer_name}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: order.status === "done" ? "#16a34a" : order.status === "cancelled" ? "#ef4444" : "#f59e0b", color: "white", fontWeight: 700 }}>
                  {order.status?.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "#888" }}>
                {order.tenant_slug} · {new Date(order.created_at).toLocaleString("en-IN")}
              </p>
              <p style={{ margin: "0 0 2px", fontSize: 13, color: "#555" }}>{order.items}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ff4d00" }}>₹{order.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}