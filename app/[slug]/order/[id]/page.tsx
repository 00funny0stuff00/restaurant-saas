// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";

export default function OrderTracking() {
  const parts = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
  const slug = parts[1];
  const orderId = parts[3];

  const [order, setOrder] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (data) setOrder(data);
  }

  useEffect(() => {
    async function init() {
      const { data: tenantData } = await supabase
        .from("tenants").select("*").eq("slug", slug).single();
      if (tenantData) setTenant(tenantData);
      await loadOrder();
      setLoading(false);
    }
    init();
    const interval = setInterval(loadOrder, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p style={{ color: "#888" }}>Loading...</p>
    </div>
  );

  if (!order) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p>Order not found.</p>
    </div>
  );

  const primary = tenant?.primary_color || "#ff4d00";

  const steps = [
    { key: "new", label: "Order received", icon: "📋" },
    { key: "preparing", label: "Being prepared", icon: "👨‍🍳" },
    { key: "ready", label: "Ready for pickup!", icon: "✅" },
  ];

  const currentStep = steps.findIndex(s => s.key === order.status);

  const s = {
    wrap: { maxWidth: 420, margin: "0 auto", padding: "32px 16px", fontFamily: "sans-serif", minHeight: "100vh" },
    header: { textAlign: "center", marginBottom: 32 },
    restaurantName: { fontSize: 14, color: "#888", margin: "0 0 8px" },
    tokenBox: { background: primary, color: "white", borderRadius: 16, padding: "20px 32px", display: "inline-block", marginBottom: 8 },
    tokenLabel: { fontSize: 12, margin: "0 0 4px", opacity: 0.85 },
    tokenNum: { fontSize: 48, fontWeight: 900, margin: 0, letterSpacing: -2 },
    stepRow: { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 },
    stepIcon: (active, done) => ({
      width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
      background: done ? primary : active ? primary : "#f3f4f6",
      opacity: done ? 1 : active ? 1 : 0.4,
    }),
    stepLabel: (active, done) => ({
      fontWeight: active || done ? 700 : 400,
      fontSize: 15, margin: "10px 0 4px",
      color: active || done ? "#111" : "#aaa",
    }),
    orderCard: { background: "#f9f9f9", borderRadius: 12, padding: 16, marginTop: 24 },
    orderTitle: { fontSize: 13, color: "#888", margin: "0 0 8px", fontWeight: 600 },
    orderItems: { fontSize: 14, color: "#333", margin: "0 0 8px" },
    orderTotal: { fontSize: 15, fontWeight: 700, color: primary, margin: 0 },
    refreshNote: { textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 24 },
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <p style={s.restaurantName}>{tenant?.name}</p>
        <div style={s.tokenBox}>
          <p style={s.tokenLabel}>Your token</p>
          <p style={s.tokenNum}>#{order.id}</p>
        </div>
        {order.status === "ready" && (
          <p style={{ color: primary, fontWeight: 700, fontSize: 16, marginTop: 8 }}>
            🎉 Your order is ready! Please collect it.
          </p>
        )}
      </div>

      <div>
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <div key={step.key} style={s.stepRow}>
              <div style={s.stepIcon(active, done)}>
                {done ? "✓" : step.icon}
              </div>
              <div>
                <p style={s.stepLabel(active, done)}>{step.label}</p>
                {active && <p style={{ fontSize: 12, color: "#888", margin: 0 }}>In progress...</p>}
                {done && <p style={{ fontSize: 12, color: primary, margin: 0 }}>Done</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={s.orderCard}>
        <p style={s.orderTitle}>ORDER SUMMARY</p>
        <p style={s.orderItems}>{order.items}</p>
        <p style={s.orderTotal}>Total: ₹{order.total}</p>
      </div>

      <p style={s.refreshNote}>Page refreshes automatically every 6 seconds</p>
    </div>
  );
}