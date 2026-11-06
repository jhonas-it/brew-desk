
import ProductCatalog from "./components/ProductCatalog";
import { usePOSCart } from "./store/usePOSCart";
import { useEffect, useState } from "react";
import { Clock3, Package } from "lucide-react";
import "./POSPage.css";
import CartDetails from "./components/CartDetails";
import { useOutletContext } from "react-router-dom";

export default function POSPage() {
  const { user } = useOutletContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Shopping cart state
  const cartItems = usePOSCart((state) => state.items);
  const changeQuantity = usePOSCart((state) => state.changeQuantity);
  const removeItem = usePOSCart((state) => state.removeItem);
  const clearCart = usePOSCart((state) => state.clearCart);

  // Calculate cart subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  // Update the clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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
            Process customer transactions, queue orders, and manage checkout
            activity.
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
          {/* PRODUCT LIST */}
          {ProductCatalog(
            <div className="bd-product-section">
              <div className="bd-section-header">
                <h2>Product Lists</h2>
              </div>

              <div className="bd-product-placeholder">
                <Package size={32} />
                <h3>Product Catalog</h3>
                <p>
                  Product cards, categories, search, and variants will go here.
                </p>
              </div>
            </div>,
          )}
        </section>

        <CartDetails user={user} />
      </div>
    </div>
  );
}