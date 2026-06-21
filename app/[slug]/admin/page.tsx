// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

function isValidIPv4(ip) {
  if (!ip) return false;
  const s = ip.trim();
  const re = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return re.test(s);
}

export default function AdminPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";

  // ─── 1. ALL STATES ─────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [authError, setAuthError] = useState(null);

  // Restaurant details & brand metrics
  const [tName, setTName] = useState("");
  const [tTagline, setTTagline] = useState("");
  const [tColor, setTColor] = useState("#ff4d00");
  const [tEmail, setTEmail] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tAddress, setTAddress] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Settings
  const [queueLimitEnabled, setQueueLimitEnabled] = useState(false);
  const [queueLimit, setQueueLimit] = useState(10);
  const [dineInEnabled, setDineInEnabled] = useState(false);
  const [editOrderEnabled, setEditOrderEnabled] = useState(false);
  const [customizeOrderEnabled, setCustomizeOrderEnabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [kitchenPin, setKitchenPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  // Direct Key Payments Settings
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);
  const [cashPaymentsEnabled, setCashPaymentsEnabled] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [savingPayments, setSavingPayments] = useState(false);

  // Synced Web Printing Settings
  const [printEnabled, setPrintEnabled] = useState(false);
  const [kotIP, setKotIP] = useState("");
  const [kotAutoprint, setKotAutoprint] = useState("new");
  const [receiptIP, setReceiptIP] = useState("");
  const [receiptAutoprint, setReceiptAutoprint] = useState("done");
  const [savingPrinter, setSavingPrinter] = useState(false);

  // Delivery Configurations
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [newDelName, setNewDelName] = useState("");
  const [newDelPrice, setNewDelPrice] = useState("");

  // Menu Unit State
  const [newUnit, setNewUnit] = useState("");

  // ─── 2. BRAND METRICS & COLORS (Declared at top) ─────────────────────────
  const primary = tenant?.primary_color ?? "#ff4d00";
  const base = "https://www.echotakeout.com";
  const nextStatus = { new: "preparing", preparing: "ready", ready: "done" };
  const nextLabel = { new: "Start →", preparing: "Ready →", ready: "Done ✓" };
  const statusColor = { new: "#ff4d00", preparing: "#f59e0b", ready: "#16a34a", done: "#888", cancelled: "#ef4444" };

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // Self-contained Toggle Component (Pure HTML/Web Layout)
  const Toggle = ({ value, onChange, label }) => {
    const activeColor = tenant?.primary_color ?? "#ff4d00";
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? activeColor : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
          <div style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
        </div>
      </div>
    );
  };

  // ─── 3. DATA LOADING ──────────────────────────────────────────────────────
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
      setEditOrderEnabled(t?.edit_order_enabled ?? false);
      setCustomizeOrderEnabled(t?.customize_order_enabled ?? false);
      setKitchenPin(t?.kitchen_pin ?? "");

      // Load payments
      setOnlinePaymentsEnabled(t?.online_payments_enabled ?? false);
      setCashPaymentsEnabled(t?.cash_payments_enabled ?? true);
      setRazorpayKeyId(t?.razorpay_key_id ?? "");
      setRazorpayKeySecret(t?.razorpay_key_secret ?? "");

      // Load policy contacts
      setTEmail(t?.support_email ?? "");
      setTPhone(t?.support_phone ?? "");
      setTAddress(t?.physical_address ?? "");

      // Load delivery parameters
      setDeliveryEnabled(t?.delivery_enabled ?? false);
      setDeliveryOptions(t?.delivery_options ?? []);

      // Load synced printing records from Supabase
      const { data: p } = await supabase.from("print_settings").select("*").eq("tenant_slug", slug).maybeSingle();
      if (p) {
        setPrintEnabled(p.enabled ?? false);
        setKotIP(p.kot_ip ?? "");
        setKotAutoprint(p.kot_autoprint ?? "new");
        setReceiptIP(p.receipt_ip ?? "");
        setReceiptAutoprint(p.receipt_autoprint ?? "done");
      }
 
      await loadMenu();
      await loadOrders();
      setLoading(false);
    }
    init();
    const interval = setInterval(loadMenu, 8000);
    const orderInterval = setInterval(loadOrders, 6000);
    return () => { clearInterval(interval); clearInterval(orderInterval); };
  }, []);

  async function loadMenu() {
    const { data: m } = await supabase.from("menu_items").select("*").eq("tenant_slug", slug).order("category");
    setItems(m ?? []);
  }

  async function loadOrders() {
    const { data: o } = await supabase.from("orders").select("*").eq("tenant_slug", slug).order("created_at", { ascending: false });
    setOrders(o ?? []);
  }

  // ─── 4. ACTIONS ────────────────────────────────────────────────────────────
  async function saveTenant() {
    const { error } = await supabase.from("tenants").update({ 
      name: tName.trim(), 
      tagline: tTagline.trim() || null, 
      primary_color: tColor,
      support_email: tEmail.trim() || null,
      support_phone: tPhone.trim() || null,
      physical_address: tAddress.trim() || null
    }).eq("slug", slug);
    
    if (error) return alert("Error saving branding details.");
    alert("Saved!");
  }

  async function saveSettings() {
    setSavingSettings(true);
    const { error } = await supabase.from("tenants").update({
      queue_limit_enabled: queueLimitEnabled,
      queue_limit: queueLimit,
      dine_in_enabled: dineInEnabled,
      edit_order_enabled: editOrderEnabled,
      customize_order_enabled: customizeOrderEnabled,
      delivery_enabled: deliveryEnabled,
      delivery_options: deliveryOptions,
    }).eq("slug", slug);
    setSavingSettings(false);
    if (error) return alert("Error saving settings.");
    alert("Settings saved!");
  }

  async function savePayments() {
    if (!onlinePaymentsEnabled && !cashPaymentsEnabled) {
      return alert("You must enable at least one payment method.");
    }

    setSavingPayments(true);
    const { error } = await supabase.from("tenants").update({
      online_payments_enabled: onlinePaymentsEnabled,
      cash_payments_enabled: cashPaymentsEnabled,
      razorpay_key_id: razorpayKeyId.trim() || null,
      razorpay_key_secret: razorpayKeySecret.trim() || null,
    }).eq("slug", slug);
    setSavingPayments(false);
    if (error) return alert("Error saving credentials.");
    alert("Payment settings saved!");
  }

  async function savePrinterSettingsWeb() {
    if (kotIP.trim() && !isValidIPv4(kotIP)) {
      return alert("Invalid IPv4 address format for KOT printer.");
    }
    if (receiptIP.trim() && !isValidIPv4(receiptIP)) {
      return alert("Invalid IPv4 address format for Receipt printer.");
    }

    setSavingPrinter(true);
    const { error } = await supabase.from("print_settings").upsert({
      tenant_slug: slug,
      enabled: printEnabled,
      kot_ip: kotIP.trim() || null,
      kot_autoprint: kotAutoprint,
      receipt_ip: receiptIP.trim() || null,
      receipt_autoprint: receiptAutoprint
    });
    setSavingPrinter(false);
    if (error) return alert("Error saving printing settings.");
    alert("Printer settings saved!");
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
  }

  async function cancelOrder(id) {
    if (!confirm("Cancel order? This cannot be undone.")) return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    loadOrders();
  }

  async function addItem() {
    if (!newName || !newPrice || !newCategory) return alert("Name, price and category are required.");
    await supabase.from("menu_items").insert([{
      name: newName, 
      price: parseFloat(newPrice), 
      category: newCategory,
      unit: newUnit.trim() || null,
      photo_url: newPhoto, 
      description: newDesc, 
      in_stock: true, 
      tenant_slug: slug
    }]);
    setNewName(""); setNewPrice(""); setNewCategory(""); setNewPhoto(""); setNewDesc(""); setNewUnit("");
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
      "Status": o.status,
      "Revenue (₹)": o.status === "cancelled" ? 0 : o.total,
    }));

    const cancelled = filteredOrders.filter(o => o.status === "cancelled").length;
    const netRevenue = filteredOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

    const summaryRow = {
      "Order ID": "SUMMARY",
      "Date": "",
      "Customer": `Total: ${filteredOrders.length} orders`,
      "Phone": "",
      "Type": "",
      "Table": "",
      "Items": `Cancelled: ${cancelled}`,
      "Status": "",
      "Revenue (₹)": `Net revenue: ₹${netRevenue.toFixed(2)}`,
    };

    const allRows = [...rows, summaryRow];
    const headers = Object.keys(allRows[0]);
    const csv = [headers.join(","), ...allRows.map(r => headers.map(h => `"${r[h]}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${slug}-${filterDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveKitchenPin() {
    if (!kitchenPin.trim()) return alert("Please enter a PIN.");
    setSavingPin(true);
    await supabase.from("tenants").update({ kitchen_pin: kitchenPin }).eq("slug", slug);
    setSavingPin(false);
    alert("Kitchen PIN saved!");
  }

  function downloadQR(url, label) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${label}-qr.png`;
    a.target = "_blank";
    a.click();
  }

  // ─── 5. DATA FILTER CASCADES ───────────────────────────────────────────────
  const qrPages = [
    { label: "Menu", desc: "Share with customers to browse and order", url: `${base}/${slug}`, icon: "🍽️" },
    { label: "Kitchen", desc: "Open on kitchen screen to see live orders", url: `${base}/${slug}/kitchen`, icon: "👨‍🍳" },
    { label: "Admin", desc: "Quick access to your admin panel", url: `${base}/${slug}/admin`, icon: "⚙️" },
    { label: "Dashboard", desc: "Quick access to your owner dashboard", url: `${base}/dashboard`, icon: "📊" },
  ];

  const activeOrdersForMetrics = filterDate
    ? orders.filter(o => o.created_at && o.created_at.startsWith(filterDate))
    : orders;
  const cancelledCount = activeOrdersForMetrics.filter(o => o.status === "cancelled").length;
  const netRevenue = activeOrdersForMetrics.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  let filteredOrders = activeOrdersForMetrics;
  if (filterStatus !== "all") {
    filteredOrders = filteredOrders.filter(o => o.status === filterStatus);
  }

  const categories = [...new Set(items.map(i => i.category))];

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

  // ─── 6. STYLING SHEETS (Pure HTML Web Styling) ────────────────────────────
  const styles = {
    page: { fontFamily: "sans-serif", maxWidth: 580, margin: "0 auto", padding: 20, background: "white", minHeight: "100vh", color: "#111" },
    header: { padding: "16px 0 14px", borderBottom: `2px solid ${primary}`, background: "white", display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#111", margin: 0 },
    logoutBtn: { padding: "8px 14px", backgroundColor: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "700", color: "#888" },
    tabBar: { display: "flex", borderBottom: "1px solid #eee", margin: "20px 0 24px", overflowX: "auto" },
    tabBtn: (active) => ({ padding: "10px 14px", border: "none", borderBottom: active ? `3px solid ${primary}` : "3px solid transparent", background: "none", cursor: "pointer", fontWeight: active ? 700 : 400, color: active ? primary : "#555", fontSize: 13, whiteSpace: "nowrap" }),
    center: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" },
    empty: { textAlign: "center", padding: "40px 0", color: "#888" },
    card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #eee" },
    badge: (bg) => ({ padding: "4px 10px", borderRadius: 20, backgroundColor: bg, display: "inline-block" }),
    badgeText: { color: "white", fontSize: 11, fontWeight: "700" },
    name: { fontWeight: "700", fontSize: 15, color: "#111", marginBottom: 2, margin: 0 },
    meta: { fontSize: 13, color: "#888", marginBottom: 2, margin: 0 },
    items: { fontSize: 14, color: "#333", margin: "6px 0" },
    notesBox: { backgroundColor: "#ede9fe", borderRadius: 8, padding: 8, margin: "6px 0" },
    notesLabel: { fontSize: 13, color: "#5b21b6", fontWeight: "600", margin: 0 },
    total: { fontWeight: "700", fontSize: 15 },
    label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 4, display: "block" },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 14, color: "#111", backgroundColor: "white", boxSizing: "border-box" },
    btn: (color) => ({ borderRadius: 10, padding: "12px 20px", backgroundColor: color, color: "white", border: "none", cursor: "pointer", fontWeight: "700", fontSize: 15 }),
    btnText: { color: "white", fontWeight: "700", fontSize: 15 }
  };

  const orderStyles = {
    summary: { display: "flex", backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #eee", justifyContent: "space-around" },
    summaryItem: { textAlign: "center" },
    summaryVal: { fontSize: 20, fontWeight: "800", color: "#111", margin: 0 },
    summaryLabel: { fontSize: 11, color: "#888", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
    filterChip: (active) => ({ padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? primary : "#ddd"}`, marginRight: 8, backgroundColor: active ? primary : "white", cursor: "pointer" }),
    filterText: (active) => ({ fontSize: 13, fontWeight: "600", color: active ? "white" : "#555", textTransform: "capitalize" }),
    actionBtn: { borderRadius: 8, padding: "10px 14px", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }
  };

  const menuStyles = {
    addToggleBtn: { borderWidth: 2, borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 16, borderStyle: "dashed", cursor: "pointer", display: "block", width: "100%", background: "transparent" },
    addToggleText: { fontWeight: "700", fontSize: 15 },
    addForm: { backgroundColor: "#f9f9f9", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #eee" },
    catHeader: { fontSize: 13, fontWeight: "700", color: "#888", marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #f0f0f0", paddingBottom: 4 },
    itemCard: { backgroundColor: "white", borderRadius: 10, padding: 14, marginBottom: 10, border: "1px solid #eee", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" },
    itemName: { fontWeight: "700", fontSize: 14, color: "#111", margin: 0 },
    itemMeta: { fontSize: 12, color: "#888", marginTop: 2, margin: 0 },
    stockBtn: (active) => ({ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: active ? "#dcfce7" : "#fee2e2" }),
    deleteBtn: { backgroundColor: "#ef4444", width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
  };

  const printerStyles = {
    printerBox: { backgroundColor: "#f9f9f9", borderRadius: 12, padding: 14, marginTop: 16, border: "1px solid #eee" },
    printerTitle: { fontWeight: "700", fontSize: 14, color: "#111", marginBottom: 10, margin: 0 },
    selectedPrinter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    selectedIP: { fontSize: 13, color: "#333", flex: 1 },
    changeBtn: { fontSize: 13, fontWeight: "700", background: "none", border: "none", cursor: "pointer" },
    scanBtn: { borderWidth: 2, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10, borderStyle: 'dashed', cursor: 'pointer', background: 'transparent' },
    scanBtnText: { fontWeight: '700', fontSize: 14 },
    autoLabel: { fontSize: 12, fontWeight: "700", color: "#888", marginTop: 8, marginBottom: 6, textTransform: "uppercase" },
    radioRow: { display: "flex", alignItems: "center", padding: "6px 0", cursor: "pointer" },
    radio: (active) => ({ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: active ? primary : "#ddd", marginRight: 10, backgroundColor: active ? primary : "white" }),
    radioLabel: { fontSize: 14, color: "#333" },
    scanningBox: { display: "flex", alignItems: "center", padding: 14, backgroundColor: "#f9f9f9", borderRadius: 10, marginTop: 12 },
    resultsBox: { marginTop: 12 },
    resultsTitle: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 8 },
    printerResult: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, backgroundColor: "white", borderRadius: 10, border: "1px solid #eee", marginBottom: 8 },
    printerResultIP: { fontSize: 14, fontWeight: "600", color: "#111" },
    printerResultSelect: { fontSize: 13, fontWeight: "700" },
    ipHintError: { fontSize: 12, color: "#ef4444", marginTop: 4 },
  };

  const qrStyles = {
    card: { display: "flex", gap: 16, alignItems: "flex-start", backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #eee" },
    qrImage: { width: 90, height: 90, borderRadius: 8, flexShrink: 0 },
    label: { fontWeight: "700", fontSize: 15, color: "#111", marginBottom: 4, margin: 0 },
    desc: { fontSize: 12, color: "#888", marginBottom: 4, margin: 0 },
    url: { fontSize: 10, color: "#bbb", marginBottom: 8, wordBreak: "break-all", margin: 0 },
    downloadBtn: { borderRadius: 8, padding: 8, border: "none", cursor: "pointer", display: "inline-block", textAlign: "center" },
    downloadText: { color: "white", fontWeight: "700", fontSize: 12 },
  };

  const settingStyles = {
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 4, marginTop: 8 },
    row: { display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" },
    rowLabel: { fontSize: 14, fontWeight: "600", color: "#111" },
    rowDesc: { fontSize: 12, color: "#888", marginTop: 2 },
    pinSection: { marginTop: 32, paddingTop: 24, borderTop: "1px solid #f0f0f0" },
    pinDesc: { fontSize: 13, color: "#888", marginBottom: 12 },
    pinInput: { textAlign: "center", fontSize: 22, letterSpacing: 6, width: 160 },
  };

  if (loading) return <div style={styles.center}><p style={{ color: "#888", fontWeight: "600" }}>Loading...</p></div>;

  if (authError) return (
    <div style={{ ...styles.page, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{authError}</p>
      <button style={styles.btn("#111")} onClick={handleLogout}>Sign out</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {/* FIXED: Removed React Native <View> wrapper completely */}
        <div style={{ flex: 1 }}>
          <h1 style={styles.headerTitle}>⚙️ {tenant?.name}</h1>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Log out</button>
      </div>

      {/* Tab bar navigation */}
      <div style={styles.tabBar}>
        {["orders", "menu", "payments", "settings", "restaurant", "qr"].map(t => (
          <button key={t} style={styles.tabBtn(tab === t)} onClick={() => setTab(t)}>
            {t === "qr" ? "QR Codes" : t === "restaurant" ? "Info" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── ORDERS TAB ────────────────────────────────────────────────────── */}
      {tab === "orders" && (
        <div>
          <div style={orderStyles.summary}>
            <div style={orderStyles.summaryItem}>
              <p style={orderStyles.summaryVal}>{orders.length}</p>
              <p style={orderStyles.summaryLabel}>Total orders</p>
            </div>
            <div style={orderStyles.summaryItem}>
              <p style={{ ...orderStyles.summaryVal, color: primary }}>₹{netRevenue.toFixed(0)}</p>
              <p style={orderStyles.summaryLabel}>Revenue</p>
            </div>
            <div style={orderStyles.summaryItem}>
              <p style={{ ...orderStyles.summaryVal, color: '#ef4444' }}>{cancelledCount}</p>
              <p style={orderStyles.summaryLabel}>Cancelled</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
            {["all", "new", "preparing", "ready", "done", "cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${filterStatus === s ? primary : "#ddd"}`,
                  backgroundColor: filterStatus === s ? primary : "white",
                  color: filterStatus === s ? "white" : "#555",
                  fontWeight: "600",
                  fontSize: 13,
                  cursor: "pointer",
                  textTransform: "capitalize"
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div style={styles.empty}><p style={{ color: '#888' }}>No orders found.</p></div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={styles.badge(statusColor[order.status] || '#888')}>
                    <span style={styles.badgeText}>{order.status?.toUpperCase()}</span>
                  </div>
                  <span style={{ color: '#888', fontSize: 13 }}>#{order.id}</span>
                </div>
                <p style={styles.name}>{order.customer_name}</p>
                <p style={styles.meta}>{order.phone}</p>
                <p style={styles.meta}>
                  {order.order_type === 'dine-in' ? `🪑 Dine-in · Table ${order.table_number}` : '🥡 Takeaway'}
                </p>
                <p style={styles.items}>{order.items}</p>
                {order.notes && (
                  <div style={styles.notesBox}>
                    <p style={styles.notesLabel}>📝 {order.notes}</p>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ ...styles.total, color: primary }}>₹{order.total}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(order.created_at).toLocaleString('en-IN')}</span>
                </div>
                {order.status !== 'done' && order.status !== 'cancelled' && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      style={{ ...orderStyles.actionBtn, backgroundColor: statusColor[nextStatus[order.status]] || '#888', flex: 1, color: 'white', fontWeight: '700' }}
                      onClick={() => updateStatus(order.id, nextStatus[order.status])}
                    >
                      {nextLabel[order.status]}
                    </button>
                    <button
                      style={{ ...orderStyles.actionBtn, backgroundColor: '#ef4444', color: 'white', fontWeight: '700', padding: "10px 18px" }}
                      onClick={() => cancelOrder(order.id)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── MENU TAB ──────────────────────────────────────────────────────── */}
      {tab === "menu" && (
        <div>
          <button
            style={{ ...menuStyles.addToggleBtn, borderColor: primary }}
            onClick={() => setShowAdd(!showAdd)}
          >
            <span style={{ ...menuStyles.addToggleText, color: primary }}>
              {showAdd ? "✕ Cancel" : "+ Add new item"}
            </span>
          </button>

          {showAdd && (
            <div style={menuStyles.addForm}>
              <label style={styles.label}>Item name *</label>
              <input style={styles.input} placeholder="e.g. Paneer Tikka" value={newName} onChange={e => setNewName(e.target.value)} />
              <label style={styles.label}>Price (₹) *</label>
              <input style={styles.input} type="number" placeholder="e.g. 180" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
              <label style={styles.label}>Category *</label>
              <input style={styles.input} placeholder="e.g. Starters" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
              <label style={styles.label}>Unit (e.g. 500g, 1 Plate) (optional)</label>
              <input style={styles.input} placeholder="e.g. 500g" value={newUnit} onChange={e => setNewUnit(e.target.value)} />
              <label style={styles.label}>Description (optional)</label>
              <textarea style={{ ...styles.input, height: 80, resize: "vertical" }} placeholder="Brief description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <button style={{ ...styles.btn(primary), width: "100%" }} onClick={addItem}>Add item</button>
            </div>
          )}

          {categories.map(cat => (
            <div key={cat}>
              <div style={menuStyles.catHeader}>{cat}</div>
              {items.filter(i => i.category === cat).map(item => (
                <div key={item.id} style={menuStyles.itemCard}>
                  <div style={{ flex: 1 }}>
                    <p style={menuStyles.itemName}>{item.name} {item.unit ? `(${item.unit})` : ""}</p>
                    <p style={menuStyles.itemMeta}>₹{item.price}{item.description ? ` · ${item.description}` : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      style={{ ...menuStyles.stockBtn(item.in_stock), border: "none" }}
                      onClick={() => toggleStock(item.id, item.in_stock)}
                    >
                      <span style={{ fontSize: 12, fontWeight: '700', color: item.in_stock ? '#16a34a' : '#dc2626' }}>
                        {item.in_stock ? 'In stock' : 'Out'}
                      </span>
                    </button>
                    <button onClick={() => deleteItem(item.id)} style={menuStyles.deleteBtn}>
                      <span style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>✕</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ─── PAYMENTS TAB ───────────────────────────────────────────────────── */}
      {tab === "payments" && (
        <div>
          <h3 style={settingStyles.sectionTitle}>Payment Settings</h3>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Configure how your dining customers pay for their orders.</p>

          {/* Onboarding Checklist for Razorpay Compliance */}
          {onlinePaymentsEnabled && (
            <div style={{ backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: '700', color: '#1e40af', marginBottom: 6, margin: 0 }}>📋 Onboarding Checklist</p>
              <p style={{ fontSize: 12, color: '#1e3a8a', lineHeight: "17px", margin: 0 }}>
                1. Copy your public storefront checkout URL:{"\n"}
                <span style={{ fontWeight: '700', textDecoration: 'underline' }}>https://www.echotakeout.com/{slug}</span>{"\n"}
                2. Paste this link into the 'Website URL' field when registering your merchant profile on Razorpay.{"\n"}
                3. Configure your support contact parameters under the Info tab.
              </p>
            </div>
          )}

          <Toggle label="Enable Cash/Counter Payments" value={cashPaymentsEnabled} onChange={setCashPaymentsEnabled} />
          <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 20 }}>
            Allow customers to pay at the register upon collection. Disabling this forces online-only checkouts.
          </p>

          <Toggle label="Enable Online Payments" value={onlinePaymentsEnabled} onChange={setOnlinePaymentsEnabled} />
          <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 20 }}>
            Allow customers to pay instantly using UPI, Cards, or Netbanking. Disabling this switches checkout directly to cash.
          </p>

          {onlinePaymentsEnabled && (
            <div style={{ backgroundColor: "#f9f9f9", borderRadius: 12, padding: 16, marginTop: 16, border: "1px solid #eee" }}>
              <p style={{ fontWeight: "700", fontSize: 14, color: "#111", marginBottom: 10, margin: 0 }}>💳 Razorpay Credentials</p>
              
              <label style={styles.label}>Razorpay Key ID</label>
              <input 
                style={styles.input} 
                placeholder="rzp_live_A1B2C3D4" 
                value={razorpayKeyId} 
                onChange={e => setRazorpayKeyId(e.target.value)} 
              />

              <label style={styles.label}>Razorpay Key Secret</label>
              <input 
                style={styles.input} 
                type="password"
                placeholder="••••••••••••••••" 
                value={razorpayKeySecret} 
                onChange={e => setRazorpayKeySecret(e.target.value)} 
              />
            </div>
          )}

          <button style={{ ...styles.btn(primary), marginTop: 20, width: "100%" }} onClick={savePayments} disabled={savingPayments}>
            {savingPayments ? "Saving..." : "Save payment settings"}
          </button>
        </div>
      )}

      {/* ─── RESTAURANT TAB ─────────────────────────────────────────────────── */}
      {tab === "restaurant" && (
        <div>
          <h3 style={settingStyles.sectionTitle}>Branding & Info</h3>
          
          <label style={styles.label}>Restaurant Name</label>
          <input style={styles.input} value={tName} onChange={e => setTName(e.target.value)} />

          <label style={styles.label}>Tagline</label>
          <input style={styles.input} value={tTagline} onChange={e => setTTagline(e.target.value)} />

          <label style={styles.label}>Brand Primary Colour (Hex Code)</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <input 
              style={{ ...styles.input, flex: 1, marginBottom: 0 }} 
              value={tColor} 
              onChange={e => setTColor(e.target.value)} 
              maxLength={7} 
            />
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: tColor || '#ff4d00', borderWidth: 1, borderColor: '#eee' }} />
          </div>

          <h3 style={settingStyles.sectionTitle}>Compliance Settings</h3>
          <p style={settingStyles.pinDesc}>Configures contact details for dynamic policies on your menu page.</p>

          <label style={styles.label}>Support Email</label>
          <input style={styles.input} placeholder="contact@yourrestaurant.com" value={tEmail} onChange={e => setTEmail(e.target.value)} />

          <label style={styles.label}>Support Phone</label>
          <input style={styles.input} placeholder="+91 98765 43210" value={tPhone} onChange={e => setTPhone(e.target.value)} />

          <label style={styles.label}>Physical Address</label>
          <textarea style={{ ...styles.input, height: 80, resize: "vertical" }} placeholder="Restaurant operational address..." value={tAddress} onChange={e => setTAddress(e.target.value)} />

          <button style={{ ...styles.btn(primary), width: "100%", marginTop: 12 }} onClick={saveTenant}>Save changes</button>
        </div>
      )}

      {/* ─── SETTINGS TAB ───────────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div>
          <h3 style={settingStyles.sectionTitle}>Order Settings</h3>
          <Toggle label="Enable queue limit" desc="Pause new orders when queue is full" value={queueLimitEnabled} onChange={setQueueLimitEnabled} />
          {queueLimitEnabled && (
            <div style={{ paddingBottom: 12 }}>
              <p style={styles.label}>Max orders in queue</p>
              <input style={{ ...styles.input, width: 100 }} type="number" value={queueLimit} onChange={e => setQueueLimit(e.target.value)} />
            </div>
          )}
          <Toggle label="Enable dine-in" desc="Customers can choose dine-in with table number" value={dineInEnabled} onChange={setDineInEnabled} />
          <Toggle label="Allow order editing" desc="Customers can edit or cancel while status is new" value={editOrderEnabled} onChange={setEditOrderEnabled} />
          <Toggle label="Allow customization notes" desc="Customers can add special instructions" value={customizeOrderEnabled} onChange={setCustomizeOrderEnabled} />
          
          <Toggle label="Enable Delivery" value={deliveryEnabled} onChange={setDeliveryEnabled} />
          {deliveryEnabled && (
            <div style={{ backgroundColor: "#f9f9f9", borderRadius: 12, padding: 14, marginTop: 16, border: "1px solid #eee" }}>
              <p style={{ fontSize: 13, fontWeight: "700", margin: "0 0 12px" }}>Delivery Options Manager</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input style={{ ...styles.input, marginBottom: 0, flex: 2 }} placeholder="e.g. Standard Delivery" value={newDelName} onChange={e => setNewDelName(e.target.value)} />
                <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} type="number" placeholder="₹ Price" value={newDelPrice} onChange={e => setNewDelPrice(e.target.value)} />
                <button type="button" style={{ ...styles.btn(primary), padding: "8px 14px", width: "auto" }} onClick={() => {
                  if(!newDelName.trim() || !newDelPrice.trim()) return alert("Option name and price are required.");
                  const updated = [...deliveryOptions, { id: Date.now(), name: newDelName.trim(), price: parseFloat(newDelPrice) }];
                  setDeliveryOptions(updated);
                  setNewDelName(""); setNewDelPrice("");
                }}>Add</button>
              </div>
              {deliveryOptions.map(opt => (
                <div key={opt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 14 }}>{opt.name} — <strong>₹{opt.price}</strong></span>
                  <button type="button" style={{ ...styles.btn("#ef4444"), padding: "4px 8px", fontSize: 11, width: "auto" }} onClick={() => {
                    setDeliveryOptions(deliveryOptions.filter(o => o.id !== opt.id));
                  }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          <button style={{ ...styles.btn(primary), marginTop: 20, width: "100%" }} onClick={saveSettings} disabled={savingSettings}>
            {savingSettings ? "Saving..." : "Save settings"}
          </button>

          <div style={settingStyles.pinSection}>
            <h3 style={settingStyles.sectionTitle}>Kitchen PIN</h3>
            <p style={settingStyles.pinDesc}>Kitchen staff enter this PIN to access the kitchen display.</p>
            <input style={{ ...styles.input, ...settingStyles.pinInput }} value={kitchenPin} onChange={e => setKitchenPin(e.target.value)} placeholder="e.g. 1234" maxLength={8} />
            <button style={{ ...styles.btn(primary), width: "100%" }} onClick={saveKitchenPin} disabled={savingPin}>
              {savingPin ? "Saving..." : "Save PIN"}
            </button>
          </div>

          <div style={settingStyles.pinSection}>
            <h3 style={settingStyles.sectionTitle}>🖨️ Printing Configuration</h3>
            <p style={settingStyles.pinDesc}>Sync printing rules with local WiFi thermal printers.</p>
            <Toggle label="Enable printing" value={printEnabled} onChange={setPrintEnabled} />
            {printEnabled && (
              <div>
                <div style={printerStyles.printerBox}>
                  <p style={printerStyles.printerTitle}>🍳 KOT Printer (Kitchen)</p>
                  <label style={styles.label}>Printer IPv4 Address</label>
                  <input style={styles.input} placeholder="e.g. 192.168.1.45" value={kotIP} onChange={e => setKotIP(e.target.value)} />
                  <p style={printerStyles.autoLabel}>Auto-print option:</p>
                  {["new", "manual"].map(opt => (
                    <label key={opt} style={printerStyles.radioRow}>
                      <input type="radio" name="kot_auto" checked={kotAutoprint === opt} onChange={() => setKotAutoprint(opt)} />
                      <span style={{ marginLeft: 8, fontSize: 14 }}>{opt === "new" ? "Auto-print on new order" : "Manual print only"}</span>
                    </label>
                  ))}
                </div>

                <div style={printerStyles.printerBox}>
                  <p style={printerStyles.printerTitle}>🧾 Receipt Printer (Counter)</p>
                  <label style={styles.label}>Printer IPv4 Address</label>
                  <input style={styles.input} placeholder="e.g. 192.168.1.46" value={receiptIP} onChange={e => setReceiptIP(e.target.value)} />
                  <p style={printerStyles.autoLabel}>Auto-print option:</p>
                  {[
                    { val: "new", label: "Auto-print on new order" },
                    { val: "ready", label: "Auto-print when ready" },
                    { val: "done", label: "Auto-print when done" },
                    { val: "manual", label: "Manual print only" },
                  ].map(opt => (
                    <label key={opt.val} style={printerStyles.radioRow}>
                      <input type="radio" name="rec_auto" checked={receiptAutoprint === opt.val} onChange={() => setReceiptAutoprint(opt.val)} />
                      <span style={{ marginLeft: 8, fontSize: 14 }}>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <button style={{ ...styles.btn(primary), marginTop: 16, width: "100%" }} onClick={savePrinterSettingsWeb} disabled={savingPrinter}>
                  {savingPrinter ? "Saving..." : "Save printer settings"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── QR TAB ─────────────────────────────────────────────────────────── */}
      {tab === "qr" && (
        <div style={{ padding: "0 4px" }}>
          {qrPages.map(page => (
            <div key={page.label} style={qrStyles.card}>
              <div style={{ flex: 1 }}>
                <p style={qrStyles.label}>{page.icon} {page.label}</p>
                <p style={qrStyles.desc}>{page.desc}</p>
                <p style={qrStyles.url}>{page.url}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ ...styles.btn("#f3f4f6"), color: "#111", padding: "8px 14px", fontSize: 12, border: "1px solid #ddd" }} onClick={() => window.open(page.url, "_blank")}>Open →</button>
                  <button style={{ ...styles.btn(primary), padding: "8px 14px", fontSize: 12 }} onClick={() => downloadQR(page.url, page.label)}>Download QR</button>
                  <button style={{ ...styles.btn("#111"), padding: "8px 14px", fontSize: 12 }} onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: page.label, url: page.url }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(page.url);
                      alert("Link copied!");
                    }
                  }}>Share Link</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}