// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function KitchenPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [orders, setOrders] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("tenant_slug", slug)
      .neq("status", "done")
      .order("created_at", { ascending: true });
    if (data) setOrders(data);
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
  }

  useEffect(() => {
    async function init() {
      const { data: tenantData } = await supabase
        .from("tenants").select("*").eq("slug", slug).single();
      if (tenantData) setTenant(tenantData);
      await loadOrders();
      setLoading(false);
    }
    init();
    const interval = setInterval(loadOrders, 8000);
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
    wrap: { maxWidth: 600, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${primary}` },
    title: { fontSize: 20, fontWeight: 700, margin: 0, color: "#111" },
    subtitle: { fontSize: 12, color: "#888", margin: "2px 0 0" },
    refreshBtn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: 13 },
    card: { border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 12, background: "white" },
    badge: (status) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, color: "white", fontSize: 11, fontWeight: 700, marginBottom: 10, background: statusColor[status] || "#888" }),
    row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
    customerName: { fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "#111" },
    phone: { color: "#888", fontSize: 13, margin: "0 0 4px" },
    items: { fontSize: 14, margin: "0 0 6px", color: "#333" },
    total: { fontWeight: 700, fontSize: 15, margin: 0, color: primary },
    actionBtn: (status) => ({ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "white", background: statusColor[nextStatus[status]] || "#888", whiteSpace: "nowrap", flexShrink: 0 }),
    empty: { textAlign: "center", padding: "60px 20px", color: "#888" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.title}>🍳 Kitchen — {tenant?.name}</p>
          <p style={s.subtitle}>Auto-refreshes every 8 seconds</p>
        </div>
        <button style={s.refreshBtn} onClick={loadOrders}>Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 600 }}>All caught up — no pending orders</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={s.card}>
            <span style={s.badge(order.status)}>{order.status?.toUpperCase()}</span>
            <div style={s.row}>
              <div>
                <p style={s.customerName}>{order.customer_name}</p>
                <p style={s.phone}>{order.phone}</p>
                <p style={s.items}>{order.items}</p>
                <p style={s.total}>₹{order.total}</p>
              </div>
              <button
                style={s.actionBtn(order.status)}
                onClick={() => updateStatus(order.id, nextStatus[order.status])}
              >
                {nextLabel[order.status]}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}