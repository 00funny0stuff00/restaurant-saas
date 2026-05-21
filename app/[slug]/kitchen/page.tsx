// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";

export default function KitchenPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders");
  const prevOrderIds = useRef(new Set());
  const audioCtx = useRef(null);
  const soundEnabled = useRef(false);

  function playBeep() {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders").select("*").eq("tenant_slug", slug)
      .neq("status", "done").neq("status", "cancelled")
      .order("created_at", { ascending: true });
    if (data) {
      const hasNew = data.some(o => !prevOrderIds.current.has(o.id));
      if (hasNew && prevOrderIds.current.size > 0 && soundEnabled.current) playBeep();
      prevOrderIds.current = new Set(data.map(o => o.id));
      setOrders(data);
    }
  }

  async function loadMenu() {
    const { data } = await supabase.from("menu_items").select("*").eq("tenant_slug", slug).order("category");
    if (data) setMenuItems(data);
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
  }

  async function cancelOrder(id) {
    if (!confirm("Cancel this order?")) return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    loadOrders();
  }

  async function toggleStock(id, currentStock) {
    await supabase.from("menu_items").update({ in_stock: !currentStock }).eq("id", id);
    loadMenu();
  }

  useEffect(() => {
    async function init() {
      const { data: tenantData } = await supabase.from("tenants").select("*").eq("slug", slug).single();
      if (tenantData) setTenant(tenantData);
      await loadOrders();
      await loadMenu();
      setLoading(false);
    }
    init();
    const interval = setInterval(() => { loadOrders(); loadMenu(); }, 8000);
    return () => clearInterval(interval);
  }, [slug]);

  const [soundOn, setSoundOn] = useState(false);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p style={{ color: "#888" }}>Loading kitchen...</p>
    </div>
  );

  const primary = tenant?.primary_color || "#ff4d00";
  const statusColor = { new: "#ff4d00", preparing: "#f59e0b", ready: "#22c55e", cancelled: "#ef4444" };
  const nextStatus = { new: "preparing", preparing: "ready", ready: "done" };
  const nextLabel = { new: "Start preparing →", preparing: "Mark ready →", ready: "Done ✓" };

  const s = {
    wrap: { maxWidth: 600, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif", minHeight: "100vh", background: "white", color: "#111" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${primary}` },
    title: { fontSize: 20, fontWeight: 700, margin: 0, color: "#111" },
    subtitle: { fontSize: 12, color: "#888", margin: "2px 0 0" },
    refreshBtn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: 13 },
    tabs: { display: "flex", gap: 8, marginBottom: 16 },
    tab: (active) => ({ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: active ? primary : "#f3f4f6", color: active ? "white" : "#555" }),
    card: { border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 12, background: "white" },
    badge: (status) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, color: "white", fontSize: 11, fontWeight: 700, marginBottom: 10, background: statusColor[status] || "#888" }),
    row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
    customerName: { fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "#111" },
    phone: { color: "#888", fontSize: 13, margin: "0 0 4px" },
    orderType: { fontSize: 12, color: "#888", margin: "0 0 4px" },
    items: { fontSize: 14, margin: "0 0 6px", color: "#333" },
    total: { fontWeight: 700, fontSize: 15, margin: 0, color: primary },
    actionBtn: (status) => ({ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "white", background: statusColor[nextStatus[status]] || "#888", whiteSpace: "nowrap", flexShrink: 0 }),
    cancelBtn: { padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, color: "white", background: "#ef4444", whiteSpace: "nowrap", marginTop: 8 },
    empty: { textAlign: "center", padding: "60px 20px", color: "#888" },
    menuCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #eee", borderRadius: 12, marginBottom: 10, background: "white" },
    menuName: { fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: "#111" },
    menuCat: { fontSize: 12, color: "#888", margin: 0 },
    stockBtn: (inStock) => ({ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: inStock ? "#dcfce7" : "#fee2e2", color: inStock ? "#16a34a" : "#dc2626" }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.title}>🍳 Kitchen — {tenant?.name}</p>
          <p style={s.subtitle}>Auto-refreshes every 8 seconds</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{ ...s.refreshBtn, background: soundOn ? "#dcfce7" : "#f3f4f6", color: soundOn ? "#16a34a" : "#111" }}
            onClick={() => {
              soundEnabled.current = true;
              setSoundOn(true);
              playBeep();
            }}>
            {soundOn ? "🔔 Sound on" : "🔕 Enable sound"}
          </button>
          <button style={s.refreshBtn} onClick={() => { loadOrders(); loadMenu(); }}>Refresh</button>
        </div>
      </div>

      <div style={s.tabs}>
        <button style={s.tab(tab === "orders")} onClick={() => setTab("orders")}>
          Orders {orders.length > 0 && `(${orders.length})`}
        </button>
        <button style={s.tab(tab === "stock")} onClick={() => setTab("stock")}>Menu Stock</button>
      </div>

      {tab === "orders" && (
        orders.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 600 }}>All caught up — no pending orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={s.badge(order.status)}>{order.status?.toUpperCase()}</span>
                <span style={{ fontSize: 13, color: "#888" }}>#{order.id}</span>
              </div>
              <div style={s.row}>
                <div style={{ flex: 1 }}>
                  <p style={s.customerName}>{order.customer_name}</p>
                  <p style={s.phone}>{order.phone}</p>
                  <p style={s.orderType}>
                    {order.order_type === "dine-in" ? `🪑 Dine-in · Table ${order.table_number}` : "🥡 Takeaway"}
                  </p>
                  <p style={s.items}>{order.items}</p>
                  <p style={s.total}>₹{order.total}</p>
                  <button style={s.cancelBtn} onClick={() => cancelOrder(order.id)}>✕ Cancel order</button>
                </div>
                <button style={s.actionBtn(order.status)} onClick={() => updateStatus(order.id, nextStatus[order.status])}>
                  {nextLabel[order.status]}
                </button>
              </div>
            </div>
          ))
        )
      )}

      {tab === "stock" && (
        menuItems.length === 0 ? (
          <div style={s.empty}><p>No menu items found.</p></div>
        ) : (
          menuItems.map((item) => (
            <div key={item.id} style={s.menuCard}>
              <div>
                <p style={s.menuName}>{item.name}</p>
                <p style={s.menuCat}>{item.category} · ₹{item.price}</p>
              </div>
              <button style={s.stockBtn(item.in_stock)} onClick={() => toggleStock(item.id, item.in_stock)}>
                {item.in_stock ? "In Stock ✓" : "Out of Stock ✗"}
              </button>
            </div>
          ))
        )
      )}
    </div>
  );
}