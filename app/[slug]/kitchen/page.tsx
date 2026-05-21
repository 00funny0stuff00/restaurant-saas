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
  const [soundOn, setSoundOn] = useState(false);
  const [cancelPopups, setCancelPopups] = useState([]);
  const prevOrderIds = useRef(new Set());
  const prevOrderStates = useRef({});
  const audioCtx = useRef(null);
  const soundEnabled = useRef(false);

  function playBeep(type = "new") {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      if (type === "new") {
        [0, 0.25, 0.5].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(1000, ctx.currentTime + offset);
          gain.gain.setValueAtTime(1.0, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + 0.2);
        });
      } else {
        [0, 0.3].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(500, ctx.currentTime + offset);
          gain.gain.setValueAtTime(1.0, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.3);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + 0.3);
        });
      }
    } catch (e) {}
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders").select("*").eq("tenant_slug", slug)
      .neq("status", "done")
      .order("created_at", { ascending: true });
    if (data) {
      const isFirstLoad = prevOrderIds.current.size === 0;
      const hasNew = data.some(o => o.status !== "cancelled" && !prevOrderIds.current.has(o.id));

      // Detect newly cancelled orders and add popups
      const newCancellations = [];
      data.forEach(o => {
        const prev = prevOrderStates.current[o.id];
        if (prev && o.status === "cancelled" && prev.status !== "cancelled") {
          newCancellations.push(o);
        }
      });

      if (newCancellations.length > 0 && !isFirstLoad) {
        setCancelPopups(prev => [...prev, ...newCancellations]);
        if (soundEnabled.current) playBeep("edit");
      } else if (hasNew && !isFirstLoad && soundEnabled.current) {
        playBeep("new");
      }

      prevOrderIds.current = new Set(data.filter(o => o.status !== "cancelled").map(o => o.id));
      data.forEach(o => { prevOrderStates.current[o.id] = { status: o.status }; });
      setOrders(data.filter(o => o.status !== "done" && o.status !== "cancelled"));
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

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p style={{ color: "#888" }}>Loading kitchen...</p>
    </div>
  );

  const primary = tenant?.primary_color || "#ff4d00";
  const statusColor = { new: "#ff4d00", preparing: "#f59e0b", ready: "#22c55e" };
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
    card: (order) => ({
      border: order.notes ? "2px solid #8b5cf6" : "1px solid #eee",
      borderRadius: 12, padding: 16, marginBottom: 12,
      background: order.notes ? "#faf5ff" : "white"
    }),
    badge: (status) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, color: "white", fontSize: 11, fontWeight: 700, marginBottom: 10, background: statusColor[status] || "#888" }),
    row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
    customerName: { fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "#111" },
    phone: { color: "#888", fontSize: 13, margin: "0 0 4px" },
    orderType: { fontSize: 12, color: "#888", margin: "0 0 4px" },
    items: { fontSize: 14, margin: "0 0 6px", color: "#333" },
    total: { fontWeight: 700, fontSize: 15, margin: 0, color: primary },
    actionBtn: (status) => ({ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "white", background: statusColor[nextStatus[status]] || "#888", whiteSpace: "nowrap", flexShrink: 0 }),
    cancelBtn: { padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, color: "white", background: "#ef4444", marginTop: 8 },
    empty: { textAlign: "center", padding: "60px 20px", color: "#888" },
    menuCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #eee", borderRadius: 12, marginBottom: 10, background: "white" },
    menuName: { fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: "#111" },
    menuCat: { fontSize: 12, color: "#888", margin: 0 },
    stockBtn: (inStock) => ({ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: inStock ? "#dcfce7" : "#fee2e2", color: inStock ? "#16a34a" : "#dc2626" }),
  };

  return (
    <div style={s.wrap}>

      {/* Cancellation popups */}
      {cancelPopups.map((o, i) => (
        <div key={o.id} style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16
        }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, maxWidth: 400, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>❌</span>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#ef4444" }}>Order Cancelled!</p>
                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Token #{o.id} — {o.customer_name}</p>
              </div>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#ef4444" }}>CANCELLED ITEMS</p>
              <p style={{ margin: 0, fontSize: 14, color: "#333" }}>{o.items}</p>
              {o.order_type === "dine-in" && o.table_number && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>🪑 Table {o.table_number}</p>
              )}
            </div>
            <button
              style={{ width: "100%", padding: 14, background: "#ef4444", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              onClick={() => setCancelPopups(prev => prev.filter((_, idx) => idx !== i))}>
              ✓ Noted
            </button>
          </div>
        </div>
      ))}

      <div style={s.header}>
        <div>
          <p style={s.title}>🍳 Kitchen — {tenant?.name}</p>
          <p style={s.subtitle}>Auto-refreshes every 8 seconds</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{ ...s.refreshBtn, background: soundOn ? "#dcfce7" : "#f3f4f6", color: soundOn ? "#16a34a" : "#111" }}
            onClick={() => { soundEnabled.current = true; setSoundOn(true); playBeep("new"); }}>
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
            <div key={order.id} style={s.card(order)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={s.badge(order.status)}>{order.status?.toUpperCase()}</span>
                  {order.notes && <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "#8b5cf6", color: "white", fontSize: 11, fontWeight: 700 }}>⭐ CUSTOMIZED</span>}
                </div>
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
                  {order.notes && (
                    <div style={{ background: "#ede9fe", border: "1px solid #8b5cf6", borderRadius: 8, padding: "6px 10px", margin: "6px 0" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", margin: "0 0 2px" }}>📝 Special instructions</p>
                      <p style={{ fontSize: 13, color: "#5b21b6", margin: 0, fontWeight: 600 }}>{order.notes}</p>
                    </div>
                  )}
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