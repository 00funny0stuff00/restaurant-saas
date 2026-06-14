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
  const [editOrderEnabled, setEditOrderEnabled] = useState(false);
  const [customizeOrderEnabled, setCustomizeOrderEnabled] = useState(false);
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders"); // Matches mobile default tab view
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [authError, setAuthError] = useState(null);

  // Restaurant details & dynamic colors
  const [tName, setTName] = useState("");
  const [tTagline, setTTagline] = useState("");
  const [tColor, setTColor] = useState("");
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
  const [savingSettings, setSavingSettings] = useState(false);
  const [kitchenPin, setKitchenPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

// Direct Key Payments Settings
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);
  const [cashPaymentsEnabled, setCashPaymentsEnabled] = useState(true); // Added for cash settings
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [savingPayments, setSavingPayments] = useState(false);

  // New production domain mapping
  const base = "https://www.echotakeout.com";

  // Synced Web Printing Settings
  const [printEnabled, setPrintEnabled] = useState(false);
  const [kotIP, setKotIP] = useState("");
  const [kotAutoprint, setKotAutoprint] = useState("new");
  const [receiptIP, setReceiptIP] = useState("");
  const [receiptAutoprint, setReceiptAutoprint] = useState("done");
  const [savingPrinter, setSavingPrinter] = useState(false);

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

      // Load payment configuration
      setOnlinePaymentsEnabled(t?.online_payments_enabled ?? false);
      setCashPaymentsEnabled(t?.cash_payments_enabled ?? true); // Added
      setRazorpayKeyId(t?.razorpay_key_id ?? "");
      setRazorpayKeySecret(t?.razorpay_key_secret ?? "");

      // Load dynamically generated policy contact points
      setTEmail(t?.support_email ?? "");
      setTPhone(t?.support_phone ?? "");
      setTAddress(t?.physical_address ?? "");

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

  async function saveTenant() {
    const { error } = await supabase.from("tenants").update({ 
      name: tName.trim(), 
      tagline: tTagline.trim() || null, 
      primary_color: tColor,
      support_email: tEmail.trim() || null,
      support_phone: tPhone.trim() || null,
      physical_address: tAddress.trim() || null
    }).eq("slug", slug);
    
    if (error) return alert("Error saving brand metrics.");
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
    }).eq("slug", slug);
    setSavingSettings(false);
    if (error) return alert("Error saving settings.");
    alert("Settings saved!");
  }

  // Save changes to Merchant Payments Configuration
  async function savePayments() {
    // Safety check: Prevent disabling both cash and online payments
    if (!onlinePaymentsEnabled && !cashPaymentsEnabled) {
      return alert("You must enable at least one payment method (Cash or Online Payments).");
    }

    setSavingPayments(true);
    const { error } = await supabase.from("tenants").update({
      online_payments_enabled: onlinePaymentsEnabled,
      cash_payments_enabled: cashPaymentsEnabled, // Added
      razorpay_key_id: razorpayKeyId.trim() || null,
      razorpay_key_secret: razorpayKeySecret.trim() || null,
    }).eq("slug", slug);
    
    setSavingPayments(false);
    if (error) return alert("Error saving payment configuration.");
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
    if (error) return alert("Error saving printing variables.");
    alert("Printer settings saved!");
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
  }

  async function cancelOrder(id) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    loadOrders();
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
    { label: "Dashboard", desc: "Quick access to your owner dashboard", url: `${base}/dashboard`, icon: "📊" },
  ];

  const primary = tenant?.primary_color ?? "#ff4d00";
  const nextStatus = { new: "preparing", preparing: "ready", ready: "done" };
  const nextLabel = { new: "Start →", preparing: "Ready →", ready: "Done ✓" };

  // Status metrics
  const activeOrdersForMetrics = filterDate
    ? orders.filter(o => new Date(o.created_at).toLocaleDateString("en-CA") === filterDate)
    : orders;
  const cancelledCount = activeOrdersForMetrics.filter(o => o.status === "cancelled").length;
  const netRevenue = activeOrdersForMetrics.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  // Dynamic filter cascade
  let filteredOrders = activeOrdersForMetrics;
  if (filterStatus !== "all") {
    filteredOrders = filteredOrders.filter(o => o.status === filterStatus);
  }

  const statusColor = { new: "#ff4d00", preparing: "#f59e0b", ready: "#16a34a", done: "#888", cancelled: "#ef4444" };
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

      {/* Admin Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", margin: "20px 0 24px", overflowX: "auto" }}>
        <button style={s.tab(tab === "menu")} onClick={() => setTab("menu")}>Menu Items</button>
        <button style={s.tab(tab === "orders")} onClick={() => setTab("orders")}>Orders</button>
        <button style={s.tab(tab === "qr")} onClick={() => setTab("qr")}>QR Codes</button>
        <button style={s.tab(tab === "payments")} onClick={() => setTab("payments")}>Payments</button>
        <button style={s.tab(tab === "settings")} onClick={() => setTab("settings")}>Settings</button>
        <button style={s.tab(tab === "restaurant")} onClick={() => setTab("restaurant")}>Info</button>
      </div>

      {tab === "restaurant" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Restaurant Information</h3>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Restaurant Name</label>
          <input style={s.input} value={tName} onChange={e => setTName(e.target.value)} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Tagline</label>
          <input style={s.input} value={tTagline} onChange={e => setTTagline(e.target.value)} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Brand Colour</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
            <input type="color" value={tColor} onChange={e => setTColor(e.target.value)} style={{ width: 48, height: 40, border: "none", cursor: "pointer", borderRadius: 6 }} />
            <span style={{ fontSize: 14, color: "#555" }}>{tColor}</span>
          </div>

          <h3 style={{ fontWeight: 700, margin: "24px 0 12px", borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>Compliance Contact Information</h3>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>These details generate your customized Privacy, Terms, and Refund policies dynamically for your payment gateway audits.</p>
          
          <label style={{ fontSize: 13, fontWeight: 600 }}>Support Email</label>
          <input style={s.input} placeholder="e.g. contact@yourrestaurant.com" value={tEmail} onChange={e => setTEmail(e.target.value)} />
          
          <label style={{ fontSize: 13, fontWeight: 600 }}>Support Phone</label>
          <input style={s.input} placeholder="e.g. +91 98765 43210" value={tPhone} onChange={e => setTPhone(e.target.value)} />
          
          <label style={{ fontSize: 13, fontWeight: 600 }}>Physical Address</label>
          <textarea style={{ ...s.input, resize: "vertical", minHeight: 80 }} placeholder="e.g. 12 Main Road, Peelamedu, Coimbatore, 641004" value={tAddress} onChange={e => setTAddress(e.target.value)} />

          <button style={s.btn(primary)} onClick={saveTenant}>Save changes</button>
        </div>
      )}

      {tab === "payments" && (
  <div>
    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Payment Settings</h3>
    <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Configure how your dining customers pay for their orders.</p>

    {/* Onboarding Checklist for Razorpay Compliance */}
    {onlinePaymentsEnabled && (
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", margin: "0 0 8px" }}>📋 Onboarding Checklist for Razorpay</p>
        <ol style={{ fontSize: 13, color: "#1e3a8a", paddingLeft: "18px", lineHeight: "1.5", margin: 0 }}>
          <li style={{ marginBottom: "6px" }}>
            Copy your public store checkout URL: <strong style={{ textDecoration: "underline", color: "#1d4ed8" }}>https://www.echotakeout.com/{slug}</strong>
          </li>
          <li style={{ marginBottom: "6px" }}>
            Paste this link into the **'Website URL'** field when registering your merchant profile on your Razorpay Dashboard.
          </li>
          <li>
            Navigate to the <strong>Info</strong> tab and configure your Support Email, Support Phone, and Physical Address so your custom terms, privacy, and refund policies generate correctly.
          </li>
        </ol>
      </div>
    )}

    {/* Cash Payments Configuration */}
    <Toggle label="Enable Cash/Counter Payments" value={cashPaymentsEnabled} onChange={setCashPaymentsEnabled} />
    <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 20 }}>
      Allow customers to pay at the register/counter upon collection. Disabling this forces online-only checkouts.
    </p>

    {/* Online Payments Configuration */}
    <Toggle label="Enable Online Payments" value={onlinePaymentsEnabled} onChange={setOnlinePaymentsEnabled} />
    <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 20 }}>
      Allow customers to pay instantly using UPI, Cards, or Netbanking. Disabling this switches the menu checkout directly to Cash/Counter payments.
    </p>

    {/* Conditionally Render Credentials Box */}
    {onlinePaymentsEnabled && (
      <div style={{ background: "#fcfcfc", border: "1px solid #eee", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Your Razorpay Credentials</h4>
        <p style={{ fontSize: 12, color: "#888", margin: "-10px 0 16px", lineHeight: 1.4 }}>
          Register for a standard merchant account at razorpay.com. Under Settings → API Keys, copy your live credentials and paste them here. Funds will settle directly into your bank account.
        </p>

        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Razorpay Key ID</label>
        <input style={s.input} placeholder="rzp_live_A1B2C3D4" value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} />

        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Razorpay Key Secret</label>
        <input style={s.input} type="password" placeholder="••••••••••••••••" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} />
      </div>
    )}

    <button style={s.btn(primary)} onClick={savePayments} disabled={savingPayments}>
      {savingPayments ? "Saving credentials..." : "Save Payment Configuration"}
    </button>
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
          <Toggle label="Allow customers to edit/cancel order" value={editOrderEnabled} onChange={setEditOrderEnabled} />
          <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 16 }}>Customers can edit or cancel while status is still "new".</p>
          <Toggle label="Allow order customization notes" value={customizeOrderEnabled} onChange={setCustomizeOrderEnabled} />
          <p style={{ fontSize: 12, color: "#888", marginTop: 4, marginBottom: 20 }}>Customers can add special instructions like "no onions" or "extra spicy".</p>
          
          <button style={{ ...s.btn(primary), marginBottom: 32 }} onClick={saveSettings} disabled={savingSettings}>
            {savingSettings ? "Saving..." : "Save settings"}
          </button>

          {/* Kitchen PIN */}
          <div style={{ padding: "24px 0", borderTop: "1px solid #f0f0f0" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Kitchen PIN</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Kitchen staff enter this PIN to access the kitchen display. Keep it private.</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="text"
                value={kitchenPin}
                onChange={e => setKitchenPin(e.target.value)}
                placeholder="e.g. 1234"
                maxLength={8}
                style={{ ...s.input, width: 140, textAlign: "center", fontSize: 18, letterSpacing: 4, marginBottom: 0 }}
              />
              <button style={s.btn(primary)} onClick={saveKitchenPin} disabled={savingPin}>
                {savingPin ? "Saving..." : "Save PIN"}
              </button>
            </div>
          </div>

          {/* Web Printing Configuration - Fully Matches Mobile Params */}
          <div style={{ padding: "24px 0", borderTop: "1px solid #f0f0f0" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>🖨️ Printing Configuration</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Sync printing rules with local WiFi thermal printers.</p>
            
            <Toggle label="Enable Printing Settings" value={printEnabled} onChange={setPrintEnabled} />
            
            {printEnabled && (
              <div style={{ marginTop: 16 }}>
                {/* KOT IP */}
                <div style={{ background: "#fcfcfc", border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>🍳 KOT Printer (Kitchen)</p>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Printer IPv4 Address</label>
                  <input style={s.input} placeholder="e.g. 192.168.1.45" value={kotIP} onChange={e => setKotIP(e.target.value)} />
                  
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Auto-print option</label>
                  {["new", "manual"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, margin: "4px 0", cursor: "pointer" }}>
                      <input type="radio" name="kot_auto" checked={kotAutoprint === opt} onChange={() => setKotAutoprint(opt)} />
                      {opt === "new" ? "Auto-print on new order" : "Manual print only"}
                    </label>
                  ))}
                </div>

                {/* Receipt IP */}
                <div style={{ background: "#fcfcfc", border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>🧾 Receipt Printer (Counter)</p>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Printer IPv4 Address</label>
                  <input style={s.input} placeholder="e.g. 192.168.1.46" value={receiptIP} onChange={e => setReceiptIP(e.target.value)} />

                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Auto-print option</label>
                  {[
                    { val: "new", label: "Auto-print on new order" },
                    { val: "ready", label: "Auto-print when ready" },
                    { val: "done", label: "Auto-print when done" },
                    { val: "manual", label: "Manual print only" },
                  ].map(opt => (
                    <label key={opt.val} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, margin: "4px 0", cursor: "pointer" }}>
                      <input type="radio" name="rec_auto" checked={receiptAutoprint === opt.val} onChange={() => setReceiptAutoprint(opt.val)} />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <button style={s.btn(primary)} onClick={savePrinterSettingsWeb} disabled={savingPrinter}>
                  {savingPrinter ? "Saving..." : "Save printer settings"}
                </button>
              </div>
            )}
          </div>
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
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <h4 style={{ margin: "16px 0 10px", fontSize: 13, textTransform: "uppercase", color: "#888", letterSpacing: 0.5, borderBottom: "1px solid #eee", paddingBottom: 6 }}>{cat}</h4>
              {items.filter(i => i.category === cat).map(item => (
                <div key={item.id} style={s.card}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>₹{item.price}</p>
                    {item.description && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>{item.description}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button style={s.btn(item.in_stock ? "#dcfce7" : "#fee2e2")} onClick={() => toggleStock(item.id, item.in_stock)}>
                      <span style={{ color: item.in_stock ? "#16a34a" : "#dc2626", fontSize: 12 }}>
                        {item.in_stock ? "In stock" : "Out"}
                      </span>
                    </button>
                    <button style={{ ...s.btn("#ef4444"), padding: "8px 12px" }} onClick={() => deleteItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div>
          {/* Quick Metrics Summarizer - Parity with Mobile Layout */}
          <div style={{ display: "flex", justifyContent: "space-between", background: "#fcfcfc", border: "1px solid #eee", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{activeOrdersForMetrics.length}</p>
              <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>Total orders</p>
            </div>
            <div style={{ textAlign: "center", flex: 1, borderLeft: "1px solid #eee", borderRight: "1px solid #eee" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: primary, margin: 0 }}>₹{netRevenue.toFixed(0)}</p>
              <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>Revenue</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#ef4444", margin: 0 }}>{cancelledCount}</p>
              <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>Cancelled</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
            {/* Quick Status Filters */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {["all", "new", "preparing", "ready", "done", "cancelled"].map(s => (
                <button 
                  key={s} 
                  onClick={() => setFilterStatus(s)} 
                  style={{ 
                    padding: "6px 12px", 
                    borderRadius: 20, 
                    border: `1px solid ${filterStatus === s ? primary : "#ddd"}`, 
                    background: filterStatus === s ? primary : "white", 
                    color: filterStatus === s ? "white" : "#555", 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: "pointer",
                    textTransform: "capitalize"
                  }}
                >
                  {s}
                </button>
              ))}
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
                
                {order.notes && (
                  <div style={{ background: "#ede9fe", borderRadius: 8, padding: 8, margin: "6px 0", fontSize: 13, color: "#5b21b6", fontWeight: "600" }}>
                    📝 {order.notes}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
                  <span style={{ color: "#888" }}>{order.phone} · {new Date(order.created_at).toLocaleString("en-IN")}</span>
                  <span style={{ fontWeight: 700, color: primary, fontSize: 15 }}>₹{order.total}</span>
                </div>

                {/* State Management Triggers */}
                {order.status !== "done" && order.status !== "cancelled" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button 
                      style={{ ...s.btn(statusColor[nextStatus[order.status]]), flex: 1, padding: "8px 0", fontSize: 13 }}
                      onClick={() => updateStatus(order.id, nextStatus[order.status])}
                    >
                      {nextLabel[order.status]}
                    </button>
                    <button 
                      style={{ ...s.btn("#ef4444"), padding: "8px 16px", fontSize: 13 }}
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