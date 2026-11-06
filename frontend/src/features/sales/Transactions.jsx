import { useEffect, useMemo, useState } from "react";
import { Clock3, TrendingUp, CheckCircle2, Search, X, Eye, Download, RotateCcw } from "lucide-react";
import { subscribeToTransactions } from "./Transaction.service";
import "./Transactions.css";

const peso = (n) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(n) || 0);
const dateObject = (value) => {
    if (!value) return null;
    const d = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};
const localDateKey = (date) => date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
const displayDate = (value) => dateObject(value)?.toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) || "—";
const isCompleted = (t) => String(t.status || "").toLowerCase() === "completed";
const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [payment, setPayment] = useState("All");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [page, setPage] = useState(1);
    const [now, setNow] = useState(new Date());
    const [tab, setTab] = useState("transactions");
    const PAGE_SIZE = 10;

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        let active = true;
        const unsubscribe = subscribeToTransactions(
            (rows) => { if (active) { setTransactions(rows); setError(null); setLoading(false); } },
            (err) => { if (active) { console.error("Firestore transactions:", err); setError(err?.code || err?.message || "Unable to load transactions"); setLoading(false); } }
        );
        return () => { active = false; unsubscribe?.(); };
    }, []);

    const filtered = useMemo(() => transactions.filter((t) => {
        const date = localDateKey(dateObject(t.createdAt));
        const method = t.payment?.method || "";
        const lookup = `${t.receiptId || t.id} ${t.cashierName || ""} ${(t.items || []).map(i => i.productName).join(" ")}`.toLowerCase();
        return (!from || (date && date >= from)) && (!to || (date && date <= to)) &&
            (payment === "All" || method.toLowerCase() === payment.toLowerCase()) &&
            lookup.includes(search.trim().toLowerCase());
    }), [transactions, from, to, payment, search]);
    const completed = filtered.filter(isCompleted);
    const revenue = completed.reduce((sum, t) => sum + (Number(t.totals?.total) || 0), 0);
    const average = completed.length ? revenue / completed.length : 0;
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageNumber = Math.min(page, pages);
    const shown = filtered.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);
    const resetPage = (setter) => (value) => { setter(value); setPage(1); };

    function exportCSV() {
        const headings = ["Reference", "Date", "Items", "Payment", "Total", "Cashier", "Status"];
        const records = filtered.map(t => [
            t.receiptId || t.id, displayDate(t.createdAt),
            (t.items || []).map(i => `${i.quantity}x ${i.productName}`).join("; "),
            t.payment?.method || "", t.totals?.total ?? "", t.cashierName || "", t.status || ""
        ]);
        const csv = [headings, ...records].map(row => row.map(csvEscape).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "brew-desk-transactions.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="bd-sales-page">
            <div className="bd-sales-heading">
                <div><h1>Sales</h1><p>Transaction history for Brew Desk purchases.</p></div>
                <div className="bd-sales-clock"><Clock3 size={15} /> <strong>{now.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</strong><span>{now.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</span></div>
            </div>

            <div className="bd-sales-navrow">
                <button type="button" className="bd-sales-export" onClick={exportCSV} disabled={loading || !!error || !filtered.length}><Download size={15} /> Export CSV</button>
            </div>

            <div className="bd-sales-stats">
                <Stat label="TOTAL REVENUE" value={peso(revenue)} />
                <Stat
                    label="TOTAL TRANSACTIONS"
                    value={completed.length.toLocaleString("en-PH")}
                />                <Stat label="AVERAGE TICKET" value={peso(average)} />
            </div>

            <div className="bd-sales-filters">
                <label>From <input type="date" value={from} max={to || undefined} onChange={(e) => resetPage(setFrom)(e.target.value)} /></label>
                <label>To <input type="date" value={to} min={from || undefined} onChange={(e) => resetPage(setTo)(e.target.value)} /></label>
                <label>Payment method <select value={payment} onChange={e => resetPage(setPayment)(e.target.value)}><option>All</option><option>Cash</option><option>GCash</option></select></label>
                <label className="bd-sales-search"><Search size={15} /><input type="search" placeholder="Search sale, item or cashier" value={search} onChange={e => resetPage(setSearch)(e.target.value)} /></label>
                <button type="button" className="bd-sales-clear" onClick={() => { setFrom(""); setTo(""); setPayment("All"); setSearch(""); setPage(1); }}><RotateCcw size={13} /> Clear filters</button>
                <p className="bd-sales-filter-count">
                    <strong>{filtered.length}</strong> transactions ·
                    <b>{peso(revenue)}</b> completed
                </p>            </div>

            <div className="bd-sales-table-card">
                {loading ? <div className="bd-sales-notice">Loading transactions…</div> : error ? (
                    <div className="bd-sales-notice error"><strong>Unable to load transactions from Firestore</strong><p>Error: {error}</p><p>Check the browser console, Firebase project, and Firestore security rules. The Figma sample rows are not real transactions.</p></div>
                ) : !filtered.length ? <div className="bd-sales-notice"><strong>No transactions found</strong><p>Completed POS checkouts will appear here after transaction saving is connected.</p></div> : (
                    <div className="bd-sales-scroll"><table className="bd-sales-table"><thead><tr><th>SALE</th><th>DATE / TIME</th><th>ITEMS</th><th>PAYMENT</th><th>TOTAL</th><th>CASHIER</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{shown.map((t) => (
                        <tr key={t.id}><td className="bd-sales-reference">#{t.receiptId || t.id}</td><td>{displayDate(t.createdAt)}</td><td className="bd-sales-items">{(t.items || []).map(i => `${i.quantity}× ${i.productName}`).join(", ") || "—"}</td><td><span className="bd-sales-payment">{t.payment?.method || "—"}</span></td><td className="bd-sales-total">{peso(t.totals?.total)}</td><td>{t.cashierName || "—"}</td><td><span className={`bd-sales-status ${String(t.status || "").toLowerCase()}`}>{t.status || "Unknown"}</span></td><td><button type="button" className="bd-sales-detail-button" onClick={() => setSelected(t)}><Eye size={14} /> View</button></td></tr>
                    ))}</tbody></table></div>
                )}
                <div className="bd-sales-pagination"><span>{filtered.length ? `Showing ${(pageNumber - 1) * PAGE_SIZE + 1} to ${Math.min(pageNumber * PAGE_SIZE, filtered.length)} of ${filtered.length} entries` : "0 entries"}</span><div><button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>Previous</button><span>{pageNumber} / {pages}</span><button type="button" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={pageNumber >= pages}>Next</button></div></div>
            </div>

            {selected && <div className="bd-sales-modal-backdrop" onClick={() => setSelected(null)}><section className="bd-sales-modal" role="dialog" aria-modal="true" aria-label="Transaction details" onClick={e => e.stopPropagation()}><div className="bd-sales-modal-heading"><h2>Transaction details</h2><button type="button" aria-label="Close" onClick={() => setSelected(null)}><X size={20} /></button></div><p><strong>Sale:</strong> #{selected.receiptId || selected.id}</p><p><strong>Date:</strong> {displayDate(selected.createdAt)}</p><p><strong>Cashier:</strong> {selected.cashierName || "—"}</p><p><strong>Payment:</strong> {selected.payment?.method || "—"} ({selected.paymentStatus || "unverified"})</p><p><strong>Order:</strong> {selected.orderType || "—"}</p><h3>Purchased items</h3>{(selected.items || []).map((item, index) => <div className="bd-sales-modal-item" key={`${item.cartKey || index}-${index}`}><span>{item.quantity}× {item.productName}{item.variantName ? ` (${item.variantName})` : ""}</span><strong>{peso(item.lineTotal)}</strong></div>)}<div className="bd-sales-modal-item"><span>Subtotal</span><strong>{peso(selected.totals?.subtotal)}</strong></div><div className="bd-sales-modal-item"><span>Promo discount</span><strong>{peso(selected.totals?.promoDiscount)}</strong></div><div className="bd-sales-modal-item"><span>Statutory discount</span><strong>{peso(selected.totals?.statutoryDiscount)}</strong></div><div className="bd-sales-modal-item"><span>VAT exemption</span><strong>{peso(selected.totals?.vatExemptAmount)}</strong></div><div className="bd-sales-modal-item bd-sales-modal-total"><span>Total</span><strong>{peso(selected.totals?.total)}</strong></div>{selected.payment?.method === "Cash" && <><div className="bd-sales-modal-item"><span>Tendered</span><strong>{peso(selected.payment.amountTendered)}</strong></div><div className="bd-sales-modal-item"><span>Change</span><strong>{peso(selected.payment.change)}</strong></div></>}</section></div>}
        </div>
    );
}

function Stat({ label, value }) {
    return <div className="bd-sales-stat"><div className="bd-sales-stat-top"><span>{label}</span><CheckCircle2 size={18} /></div><strong>{value}</strong><div className="bd-sales-stat-bottom"><TrendingUp size={14} /><span>Based on loaded records</span></div></div>;
}
