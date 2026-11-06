import ProductCatalog from "./components/ProductCatalog";
import { usePOSCart } from "./store/usePOSCart";
import { useEffect, useState } from "react";
import {
    Clock3,
    Eye,
    ArrowLeft,
    Package,
    Check,
    ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import "./POSPage.css";
import CartDetails from "./components/CartDetails";
import { useOutletContext } from "react-router-dom";

const initialOrders = [
    { id: "12DOB-01A", items: 5, time: "4:26 PM", status: "Preparing" },
    { id: "12DOB-02A", items: 1, time: "4:27 PM", status: "Preparing" },
    { id: "12DOB-03A", items: 3, time: "4:29 PM", status: "Preparing" },
    { id: "12DOB-04A", items: 2, time: "4:35 PM", status: "Ready to Serve" },
    { id: "12DOB-05A", items: 4, time: "4:39 PM", status: "Ready to Serve" },
    { id: "12DOB-06A", items: 2, time: "4:45 PM", status: "Preparing" },
    { id: "12DOB-07A", items: 7, time: "5:30 PM", status: "Preparing" },
    { id: "12DOB-08A", items: 1, time: "5:32 PM", status: "Ready to Serve" },
];

function OrderQueueCard({ order, onChangeStatus }) {
    const ready = order.status === "Ready to Serve";
    const cartItems = usePOSCart((state) => state.items);
    const changeQuantity = usePOSCart((state) => state.changeQuantity);
    const removeItem = usePOSCart((state) => state.removeItem);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );
    return (
        <div className="bd-order-card">
            <div className="bd-order-card-top">
                <div>
                    <h4>#{order.id}</h4>
                    <p>{order.time}</p>
                </div>

                <span
                    className={`bd-order-status ${ready ? "bd-status-ready" : "bd-status-preparing"
                        }`}
                >
                    {order.status}
                </span>
            </div>

            <div className="bd-order-card-bottom">
                <span>
                    <Package size={12} />
                    {order.items} {order.items === 1 ? "item" : "items"}
                </span>

                <button
                    type="button"
                    className="bd-order-action"
                    onClick={() => onChangeStatus(order.id)}
                >
                    <Check size={12} />
                    {ready ? "Mark Served" : "Mark Ready"}
                </button>
            </div>
        </div>
    );
}

export default function POSPage() {
    const [expanded, setExpanded] = useState(false);
    const [orders, setOrders] = useState(initialOrders);
    const { user } = useOutletContext();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Shopping cart state
    const cartItems = usePOSCart((state) => state.items);

    const changeQuantity = usePOSCart(
        (state) => state.changeQuantity
    );

    const removeItem = usePOSCart(
        (state) => state.removeItem
    );

    const clearCart = usePOSCart(
        (state) => state.clearCart
    );

    // Calculate cart subtotal
    const subtotal = cartItems.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
    );


    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const activeOrders = orders.filter(
        (order) => order.status !== "Served"
    );

    const visibleOrders = expanded
        ? activeOrders
        : activeOrders.slice(0, 3);

    function changeOrderStatus(orderId) {
        const selectedOrder = orders.find(
            (order) => order.id === orderId
        );

        if (!selectedOrder) return;

        const nextStatus =
            selectedOrder.status === "Preparing"
                ? "Ready to Serve"
                : "Served";

        setOrders((previous) =>
            previous.map((order) =>
                order.id === orderId
                    ? { ...order, status: nextStatus }
                    : order
            )
        );

        toast.success(
            `Order #${orderId} marked as ${nextStatus}`
        );
    }

    const time = currentTime.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const date = currentTime.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="bd-pos-page">
            {/* POS HEADER */}
            <header className="bd-pos-header">
                <div>
                    <h1>POS</h1>
                    <p>
                        Process customer transactions, queue orders,
                        and manage checkout activity.
                    </p>
                </div>

                <div className="bd-pos-clock">
                    <Clock3 size={15} />
                    <strong>{time}</strong>
                    <span>{date}</span>
                </div>
            </header>

            {/* POS CONTENT */}
            <div className="bd-pos-content">
                <section className="bd-pos-center">
                    {/* ORDER QUEUES */}
                    <div
                        className={`bd-order-section ${expanded ? "bd-order-expanded" : ""
                            }`}
                    >
                        <div className="bd-section-header">
                            <div className="bd-section-heading">
                                <h2>Order queues</h2>

                                <span className="bd-active-count">
                                    {activeOrders.length} active
                                </span>
                            </div>

                            <button
                                type="button"
                                className="bd-queue-toggle"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? (
                                    <ArrowLeft size={14} />
                                ) : (
                                    <Eye size={14} />
                                )}

                                {expanded
                                    ? "Back (Minimize)"
                                    : "View All (Expanded)"}
                            </button>
                        </div>

                        <div className="bd-order-grid">
                            {visibleOrders.map((order) => (
                                <OrderQueueCard
                                    key={order.id}
                                    order={order}
                                    onChangeStatus={changeOrderStatus}
                                />
                            ))}

                            {activeOrders.length === 0 && (
                                <div className="bd-empty-orders">
                                    <Check size={28} />
                                    <p>No active orders</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PRODUCT LIST - NEXT STEP */}
                    {!expanded && ProductCatalog(
                        <div className="bd-product-section">
                            <div className="bd-section-header">
                                <h2>Product Lists</h2>
                            </div>

                            <div className="bd-product-placeholder">
                                <Package size={32} />
                                <h3>Product Catalog</h3>
                                <p>
                                    Product cards, categories, search,
                                    and variants will go here.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                <CartDetails user={user} />
            </div>
        </div>
    );
}