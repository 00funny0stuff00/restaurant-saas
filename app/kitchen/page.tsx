// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    new: "#ff4d00",
    preparing: "#f59e0b",
    ready: "#22c55e",
  };

  const nextStatus = {
    new: "preparing",
    preparing: "ready",
    ready: "done",
  };

  const nextLabel = {
    new: "Start preparing →",
    preparing: "Mark ready →",
    ready: "Done ✓",
  };

  const s = {
    wrap: { maxWidth: 600, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    card: { border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 12 },
    badge: { display: "inline-block", padding: "4px 12px", borderRadius: 20, color: "white", fontSize: 12, fontWeight: 700, marginBottom: 8 },
    btn: { padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "white" },
  };

  return (
    <main style={s.wrap}>
      <div style={s.header}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>🍳 Kitchen Display</h1>
        <button onClick={loadOrders} style={{ ...s.btn, background: "#6b7280" }}>Refresh</button>
      </div>

      {loading ? (
        <p style={{ color: "#888", textAlign: "center" }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center", marginTop: 40 }}>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={s.card}>
            <span style={{ ...s.badge, background: statusColor[order.status] || "#888" }}>
              {order.status?.toUpperCase()}
            </span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px" }}>{order.customer_name}</p>
                <p style={{ color: "#888", fontSize: 13, margin: "0 0 4px" }}>{order.phone}</p>
                <p style={{ fontSize: 14, margin: "0 0 8px" }}>{order.items}</p>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>₹{order.total}</p>
              </div>
              {order.status !== "done" && (
                <button
                  onClick={() => updateStatus(order.id, nextStatus[order.status])}
                  style={{ ...s.btn, background: statusColor[nextStatus[order.status]] || "#888" }}
                >
                  {nextLabel[order.status]}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}