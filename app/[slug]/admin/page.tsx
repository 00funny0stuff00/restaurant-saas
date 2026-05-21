// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function AdminPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("menu");
  const [filterDate, setFilterDate] = useState("");
  const [authError, setAuthError] = useState(null);

  const [tName, setTName] = useState("");
  const [tTagline, setTTagline] = useState("");
  const [tColor, setTColor] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Settings
  const [queueLimitEnabled, setQueueLimitEnabled] = useState(false);
  const [queueLimit, setQueueLimit] = useState(10);
  const [dineInEnabled, setDineInEnabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      const { data: t } = await supabase.from("tenants").select("*").eq("slug", slug).single();
      if (!t || t.user_id !== user.id) {
        setAuthError("You don't have access to this restaurant's admin.");
        setLoading(false);
        return;
      }

      const { data: sub } = await supabase.from("subscriptions").select("*").eq("tenant_slug", slug).single();
      setSubscription(sub);

      if (sub) {
        const expires = new Date(sub.expires_at);
        const now = new Date();
        const diffDays = (now - expires) / (1000 * 60 * 60 * 24);
        if (sub.status === "expired" && diffDays > 7) {
          setAuthError("Your subscription has ended. Please renew to access the admin panel.");
          setLoading(false);
          return;
        }
      }

      setTenant(t);
      setTName(t?.name ?? "");
      setTTagline(t?.tagline ?? "");
      setTColor(t?.primary_color ?? "#ff4d00");
      setQueueLimitEnabled(t?.queue_limit_enabled ?? false);
      setQueueLimit(t?.queue_limit ?? 10);
      setDineInEnabled(t?.dine_in_enabled ?? false);

      await loadMenu();
      await loadOrders();
      setLoading(false);
    }
    init();
    const interval = setInterval(loadMenu, 8000);
    return () => clearInterval(interval);
  }, []);

  async function loadMenu() {
    const { data: m } = await supabase.from("menu_items").select("*").eq("tenant_slug", slug).order("category");
    setItems(m ?? []);
  }

  async function loadOrders() {
    const { data: o } = await supabase.from("orders").select("*").eq("tenant_slug", slug).order("created_at", { ascending: false });
    setOrders(o ?? []);
  }

  async function saveTenant() {
    await supabase.from("tenants").update({ name: tName, tagline: tTagline, primary_color: tColor }).eq("slug", slug);
    alert("Saved!");
  }

  async function saveSettings() {
    setSavingSettings(true);
    await supabase.from("tenants").update({
      queue_limit_enabled: queueLimitEnabled,
      queue_limit: queueLimit,
      dine_in_enabled: dineInEnabled,
    }).eq("slug", slug);
    setSavingSettings(false);
    alert("Settings saved!");
  }

  async function addItem() {
    if (!newName || !newPrice || !newCategory) return alert("Name, price and category are required.");
    await supabase.from("menu_items").insert([{
      name: newName, price: parseFloat(newPrice), category: newCategory,
      photo_url: newPhoto, description: newDesc, in_stock: true, tenant_slug: slug
    }]);
    setNewName(""); setNewPrice(""); setNewCategory(""); setNewPhoto(""); setNewDesc("");
    loadMenu();
  }

  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    loadMenu();
  }

  async function toggleStock(id, current) {
    await supabase.from("menu_items").update({ in_stock: !current }).eq("id", id);
    loadMenu();
  }

  function exportCSV() {
    const rows = filteredOrders.map(o => ({
      "Order ID": o.id,
      "Date": new Date(o.created_at).toLocaleString("en-IN"),
      "Customer": o.customer_name,
      "Phone": o.phone,
      "Type": o.order_type ?? "takeaway",
      "Table": o.table_number ?? "-",
      "Items": o.items,
      "Total (₹)": o.total,
      "Status": o.status,
    }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${r[h]}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${slug}-${filterDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function downloadQR(url, label) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${label}-qr.png`;
    a.target = "_blank";
    a.click();
  }

  const base = "https://restaurant-saas-vert.vercel.app";
  const qrPages = [
    { label: "Menu", desc: "Share with customers to browse and order", url: `${base}/${slug}`, icon: "🍽️" },
    { label: "Kitchen", desc: "Open on kitchen screen to see live orders", url: `${base}/${slug}/kitchen`, icon: "👨‍🍳" },
    { label: "Admin", desc: "Quick access to your admin panel", url: `${base}/${slug}/admin`, icon: "⚙️" },
  ];

  const primary = tenant?.primary_color ?? "#ff4d00";
  const filteredOrders = filterDate
    ? orders.filter(o => new Date(o.created_at).toLocaleDateString("en-CA") === filterDate)
    : orders;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const statusColor = { new: "#ff4d00", preparing: "#f59e0b", ready: "#16a34a", done: "#888", cancelled: "#ef4444" };

  const getSubWarning = () => {
    if (!subscription) return null;
    const expires = new Date(subscription.expires_at);
    const now = new Date();
    const diffDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    if (subscription.status === "expired" || diffDays <= 0) {
      return { msg: `Your subscription expired on ${expires.toLocaleDateString("en-IN")}. Please renew within 7 days or your menu will go offline.`, color: "#ef4444" };
    }
    if (diffDays <= 7) {
      return { msg: `Your subscription expires in ${diffDays} day${diffDays === 1 ? "" : "s"}. Please renew soon.`, color: "#f59e0b" };
    }
    return null;
  };
  const subWarning = getSubWarning();

  const Toggle = ({ value, onChange, label }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? primary : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
      </div>
    </div>
  );

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 580, margin: "0 auto", padding: 20, background: "white", minHeight: "100vh", color: "#111" },
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 10, boxSizing: "border-box" },
    btn: (color) => ({ padding: "10px 20px", background: color, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }),
    tab: (active) => ({ padding: "10px 10px", border: "none", borderBottom: active ? `3px solid ${primary}` : "3px solid transparent", background: "none", cursor: "pointer", fontWeight: active ? 700 : 400, color: active ? primary : "#555", fontSize: 12 }),
    card: { border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
    orderCard: { border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 10 },
  };

  if (loading) return <div style={{ ...s.page, paddingTop: 60, textAlign: "center", color: "#888" }}>Loading...</div>;

  if (authError) return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{authError}</p>
      <button style={s.btn("#111")} onClick={handleLogout}>Sign out</button>
    </div>
  );

  return (
    <div style={s.page}>
      {subWarning && (
        <div style={{ background: subWarning.color, color: "white", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
          ⚠️ {subWarning.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>Admin — {tenant?.name}</h2>
        <button style={{ ...s.btn("#888"), padding: "8px 14px", fontSize: 13 }} onClick={handleLogout}>Sign out</button>
      </div>
      <a href={`/${slug}`} style={{ fontSize: 13, color: "#888" }}>← View live menu</a>

      <div style={{ display: "flex", borderBottom: "1px solid #eee", margin: "20px 0 24px", overflowX: "auto" }}>
        <button style={s.tab(tab === "menu")} onClick={() => setTab("menu")}>Menu Items</button>
        <button style={s.tab(tab === "orders")} onClick={() => setTab("orders")}>Orders</button>
        <button style={s.tab(tab === "qr")} onClick={() => setTab("qr")}>QR Codes</button>
        <button style={s.tab(tab === "settings")} onClick={() => setTab("settings")}>Settings</button>
        <button style={s.tab(tab === "restaurant")} onClick={() => setTab("restaurant")}>Info</button>
      </div>

      {tab === "restaurant" && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Restaurant Name</label>
          <input style={s.input} value={tName} onChange={e => setTName(e.target.value)} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Tagline</label>
          <input style={s.input} value={tTagline} onChange={e => setTTagline(e.target.value)} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Brand Colour</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input type="color" value={tColor} onChange={e => setTColor(e.target.value)} style={{ width: 48, height: 40, border: "none", cursor: "pointer", borderRadius: 6 }} />
            <span style={{ fontSize: 14, color: "#555" }}>{tColor}</span>
          </div>
          <button style={s.btn(primary)} onClick={saveTenant}>Save changes</button>
        </div>
      )}

      {tab === "settings" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Order Settings</h3>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Control how customers can place orders.</p>

          <Toggle label="Enable queue limit" value={queueLimitEnabled} onChange={setQueueLimitEnabled} />
          {queueLimitEnabled && (
            <div style={{ padding: "12px 0" }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Max orders in queue</label>
              <input style={{ ...s.input, marginTop: 6 }} type="number" value={queueLimit} onChange={e => setQueueLimit(parseInt(e.target.value))} min={1} max={100} />
              <p style={{ fontSize: 12, color: "#888", margin: "-4px 0 0" }}>Customers will be told to wait once this many active orders are in the queue.</p>
            </div>
          )}

          <Toggle label="Enable dine-in option" value={dineInEnabled} onChange={setDineInEnabled} />
          <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 20 }}>When enabled, customers can choose between Dine-in (with table number) or Takeaway.</p>

          <button style={s.btn(primary)} onClick={saveSettings} disabled={savingSettings}>
            {savingSettings ? "Saving..." : "Save settings"}
          </button>
        </div>
      )}

      {tab === "menu" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Add new item</h3>
          <input style={s.input} placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)} />
          <input style={s.input} placeholder="Price (e.g. 120)" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
          <input style={s.input} placeholder="Category (e.g. Starters)" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <textarea style={{ ...s.input, resize: "vertical", minHeight: 70 }} placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <input style={s.input} placeholder="Photo URL (optional)" value={newPhoto} onChange={e => setNewPhoto(e.target.value)} />
          <button style={{ ...s.btn(primary), marginBottom: 28 }} onClick={addItem}>Add item</button>

          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Current menu</h3>
          {items.map(item => (
            <div key={item.id} style={s.card}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>{item.category} · ₹{item.price}</p>
                {item.description && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>{item.description}</p>}
              </div>
              <button style={s.btn(item.in_stock ? "#16a34a" : "#888")} onClick={() => toggleStock(item.id, item.in_stock)}>
                {item.in_stock ? "In stock" : "Out of stock"}
              </button>
              <button style={s.btn("#ef4444")} onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{filteredOrders.length} orders</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#888" }}>Total revenue: ₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} />
              {filterDate && <button style={{ ...s.btn("#888"), padding: "8px 12px", fontSize: 12 }} onClick={() => setFilterDate("")}>Clear</button>}
              <button style={{ ...s.btn(primary), padding: "8px 14px", fontSize: 13 }} onClick={exportCSV} disabled={filteredOrders.length === 0}>
                Export CSV
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", paddingTop: 40 }}>No orders found.</p>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} style={s.orderCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>#{order.id} — {order.customer_name}</span>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: statusColor[order.status] ?? "#888", color: "white", fontWeight: 700 }}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: "0 0 2px", fontSize: 12, color: "#888" }}>
                  {order.order_type === "dine-in" ? `🪑 Dine-in · Table ${order.table_number}` : "🥡 Takeaway"}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555" }}>{order.items}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#888" }}>{order.phone} · {new Date(order.created_at).toLocaleString("en-IN")}</span>
                  <span style={{ fontWeight: 700, color: primary }}>₹{order.total}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "qr" && (
        <div>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Print these QR codes and place them at your counter, kitchen, and back office.</p>
          {qrPages.map(page => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(page.url)}`;
            return (
              <div key={page.label} style={{ border: "1px solid #eee", borderRadius: 16, padding: 24, marginBottom: 16, display: "flex", gap: 24, alignItems: "center" }}>
                <img src={qrUrl} width={110} height={110} style={{ borderRadius: 8, flexShrink: 0 }} alt={`${page.label} QR`} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16 }}>{page.icon} {page.label} page</p>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>{page.desc}</p>
                  <p style={{ margin: "0 0 12px", fontSize: 11, color: "#bbb", wordBreak: "break-all" }}>{page.url}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={page.url} target="_blank" style={{ ...s.btn("#f3f4f6"), color: "#111", textDecoration: "none", padding: "8px 14px", fontSize: 12 }}>Open →</a>
                    <button style={{ ...s.btn(primary), padding: "8px 14px", fontSize: 12 }} onClick={() => downloadQR(page.url, page.label)}>Download QR</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}