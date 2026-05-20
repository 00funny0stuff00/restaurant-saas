// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function lighten(hex, amount = 0.88) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const blend = (c) => Math.round(c + (255 - c) * amount);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

export default function RestaurantPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [cart, setCart] = useState([]);
  const [screen, setScreen] = useState("menu");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [trackId, setTrackId] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: tenantData } = await supabase
        .from("tenants").select("*").eq("slug", slug).single();
      if (!tenantData) { setLoading(false); return; }
      setTenant(tenantData);

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions").select("*").eq("tenant_slug", slug).single();
      if (sub) {
        const expires = new Date(sub.expires_at);
        const now = new Date();
        const diffDays = (now - expires) / (1000 * 60 * 60 * 24);
        if ((sub.status === "expired" || now > expires) && diffDays > 7) {
          setOffline(true);
          setLoading(false);
          return;
        }
      }

      const { data: menuData } = await supabase
        .from("menu_items").select("*")
        .eq("tenant_slug", slug).eq("in_stock", true);
      if (menuData) {
        setItems(menuData);
        setActiveCategory([...new Set(menuData.map(i => i.category))][0]);
      }
      setLoading(false);
    }

    async function refreshMenu() {
      const { data: menuData } = await supabase
        .from("menu_items").select("*")
        .eq("tenant_slug", slug).eq("in_stock", true);
      if (menuData) {
        setItems(prev => {
          const prevIds = prev.map(i => i.id + i.in_stock).join();
          const newIds = menuData.map(i => i.id + i.in_stock).join();
          return prevIds === newIds ? prev : menuData;
        });
      }
    }

    loadData();
    const menuInterval = setInterval(refreshMenu, 8000);
    const pageInterval = setInterval(() => window.location.reload(), 300000);
    return () => { clearInterval(menuInterval); clearInterval(pageInterval); };
  }, [slug]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) return prev.map((i) => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemName) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === itemName);
      if (existing.qty === 1) return prev.filter((i) => i.name !== itemName);
      return prev.map((i) => i.name === itemName ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = async () => {
    if (!name || !phone) return alert("Please enter your name and phone number");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return alert("Please enter a valid 10-digit Indian mobile number");

    const cartIds = cart.map(i => i.id);
    const { data: freshItems } = await supabase
      .from("menu_items").select("id, name, in_stock").in("id", cartIds);

    const outOfStock = freshItems?.filter(i => !i.in_stock) ?? [];
    if (outOfStock.length > 0) {
      const names = outOfStock.map(i => i.name).join(", ");
      alert(`Sorry! These items just went out of stock: ${names}\n\nThey've been removed from your cart.`);
      setCart(prev => prev.filter(i => !outOfStock.find(o => o.id === i.id)));
      return;
    }

    const itemsSummary = cart.map(i => `${i.name} x${i.qty}`).join(", ");
    const { data, error } = await supabase.from("orders").insert([{
      customer_name: name, phone, items: itemsSummary,
      total, status: "new", tenant_slug: slug
    }]).select().single();

    if (error) { alert("Something went wrong."); return; }
    setOrderNumber(data.id);
    setScreen("success");
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p style={{ color: "#888" }}>Loading...</p>
    </div>
  );

  if (!tenant) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p>Restaurant not found.</p>
    </div>
  );

  if (offline) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{tenant.name} is currently offline</h2>
      <p style={{ color: "#888", fontSize: 15 }}>Online ordering is temporarily unavailable. Please visit us in person or contact us directly.</p>
    </div>
  );

  const primary = tenant.primary_color ?? "#ff4d00";
  const secondary = tenant.secondary_color ?? lighten(primary, 0.88);
  const categories = [...new Set(items.map(i => i.category))];
  const filteredItems = items.filter(i => i.category === activeCategory);

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: "white", color: "#111" },
    header: { padding: "16px 16px 12px", borderBottom: `2px solid ${secondary}`, background: "white", position: "sticky", top: 0, zIndex: 10 },
    restaurantName: { fontSize: 18, fontWeight: 700, margin: 0, color: "#111" },
    tagline: { fontSize: 12, color: "#888", margin: "2px 0 0" },
    body: { display: "flex", flex: 1 },
    sidebar: { width: 90, borderRight: `1px solid ${secondary}`, flexShrink: 0 },
    catBtn: (active) => ({
      width: "100%", padding: "12px 6px", border: "none",
      background: active ? secondary : "white",
      borderLeft: active ? `3px solid ${primary}` : "3px solid transparent",
      cursor: "pointer", fontSize: 11, fontWeight: active ? 700 : 400,
      color: active ? primary : "#555", textAlign: "center", lineHeight: 1.3,
    }),
    itemsCol: { flex: 1, padding: "12px 12px 100px" },
    card: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 10px", border: `1px solid ${secondary}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" },
    left: { display: "flex", gap: 10, alignItems: "center", minWidth: 0, flex: 1, overflow: "hidden" },
    photo: { width: 52, height: 52, borderRadius: 8, objectFit: "cover", background: secondary, flexShrink: 0 },
    itemName: { fontWeight: 600, margin: 0, fontSize: 14, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    itemCat: { color: "#888", fontSize: 12, margin: "2px 0 0" },
    price: { fontWeight: 700, margin: 0, fontSize: 14, color: "#111", textAlign: "right" },
    addBtn: { marginTop: 6, background: primary, color: "white", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 },
    qtyRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 6 },
    qtyBtn: { width: 24, height: 24, borderRadius: "50%", border: `1px solid ${primary}`, background: "white", cursor: "pointer", fontSize: 14, color: primary, fontWeight: 700 },
    cartBar: { position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", background: primary, color: "white", padding: "13px 28px", borderRadius: 50, cursor: "pointer", fontWeight: 700, fontSize: 14, border: "none", whiteSpace: "nowrap", zIndex: 20 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${secondary}`, fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    orderBtn: { width: "100%", padding: 14, background: primary, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" },
    backBtn: { background: "none", border: "none", color: primary, fontSize: 15, cursor: "pointer", marginBottom: 16, padding: 0, fontWeight: 600 },
  };

  if (screen === "success") return (
    <div style={{ ...s.page, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>Order placed!</h2>
        <p style={{ color: "#888" }}>Thanks {name}!</p>
        <div style={{ background: primary, color: "white", borderRadius: 16, padding: "20px 32px", margin: "16px 0", display: "inline-block" }}>
          <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.85 }}>Your token number</p>
          <p style={{ fontSize: 48, fontWeight: 900, margin: 0, letterSpacing: -2 }}>#{orderNumber}</p>
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, color: primary, marginBottom: 8 }}>₹{total}</p>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Show this number at the counter when your order is ready.</p>
        <a href={`/${slug}/order/${orderNumber}`} style={{ display: "block", padding: "12px 20px", background: "#f3f4f6", borderRadius: 10, color: "#111", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
          Track your order →
        </a>
        <button style={s.orderBtn} onClick={() => { setCart([]); setScreen("menu"); setName(""); setPhone(""); }}>
          Order again
        </button>
      </div>
    </div>
  );

  if (screen === "track") return (
    <div style={{ ...s.page, padding: 16 }}>
      <button style={s.backBtn} onClick={() => setScreen("menu")}>← Back to menu</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Track your order</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Enter your token number to see your order status.</p>
      <input style={s.input} placeholder="Token number (e.g. 42)" type="number" value={trackId} onChange={e => setTrackId(e.target.value)} />
      <button style={s.orderBtn} onClick={() => { if (!trackId) return alert("Please enter a token number"); window.location.href = `/${slug}/order/${trackId}`; }}>
        Track →
      </button>
    </div>
  );

  if (screen === "cart") return (
    <div style={{ ...s.page, padding: 16 }}>
      <button style={s.backBtn} onClick={() => setScreen("menu")}>← Back to menu</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your order</h2>
      {cart.map((item) => (
        <div key={item.name} style={s.card}>
          <div style={s.left}>
            {item.photo_url && <img src={item.photo_url} style={s.photo} alt={item.name} />}
            <div>
              <p style={s.itemName}>{item.name}</p>
              <p style={s.itemCat}>₹{item.price} each</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={s.price}>₹{item.price * item.qty}</p>
            <div style={s.qtyRow}>
              <button style={s.qtyBtn} onClick={() => removeFromCart(item.name)}>−</button>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
              <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ borderTop: `2px dashed ${secondary}`, paddingTop: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
          <span>Total</span><span style={{ color: primary }}>₹{total}</span>
        </div>
      </div>
      <input style={s.input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input style={s.input} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button style={s.orderBtn} onClick={placeOrder}>Place order →</button>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={s.restaurantName}>{tenant.name}</p>
            <p style={s.tagline}>{tenant.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={{ background: "none", border: `1px solid ${primary}`, color: primary, borderRadius: 20, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }} onClick={() => setScreen("track")}>
              Track
            </button>
            {cartCount > 0 && (
              <div style={{ background: primary, color: "white", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={() => setScreen("cart")}>
                🛒 {cartCount}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.sidebar}>
          {categories.map((cat) => (
            <button key={cat} style={s.catBtn(cat === activeCategory)} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        <div style={s.itemsCol}>
          {filteredItems.map((item) => {
            const inCart = cart.find((i) => i.name === item.name);
            return (
              <div key={item.name} style={s.card}>
                <div style={s.left}>
                  {item.photo_url
                    ? <img src={item.photo_url} style={s.photo} alt={item.name} />
                    : <div style={{ ...s.photo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🍽️</div>
                  }
                  <div>
                    <p style={s.itemName}>{item.name}</p>
                    <p style={s.itemCat}>{item.category}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={s.price}>₹{item.price}</p>
                  {inCart ? (
                    <div style={s.qtyRow}>
                      <button style={s.qtyBtn} onClick={() => removeFromCart(item.name)}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{inCart.qty}</span>
                      <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
                    </div>
                  ) : (
                    <button style={s.addBtn} onClick={() => addToCart(item)}>Add</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cartCount > 0 && (
        <button style={s.cartBar} onClick={() => setScreen("cart")}>
          View order · {cartCount} item{cartCount > 1 ? "s" : ""} · ₹{total}
        </button>
      )}
    </div>
  );
}