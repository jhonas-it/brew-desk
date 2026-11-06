import { Fragment, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  EyeOff,
  Package,
} from "lucide-react";
import Icon from "../../components/Icon";
import {
  addProduct,
  updateProduct,
  subscribeToProducts,
} from "./products.service.js";
import { AnimatePresence, motion } from "motion/react";
import ProductFormModal from "./ProductFormModal.jsx";
import RecipeDetail from "./RecipeDetail.jsx";
import {
  DRINKS,
  INGREDIENTS,
  TABS,
  peso,
} from "./products.constants.js";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [ingredients] = useState(INGREDIENTS);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(new Set());
  const [modal, setModal] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const close = () => setModal(null);

  // Subscribe to Firestore products.
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Failed to load products:", err);
        setError(
          "Failed to load products. Please try again."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update the clock every minute.
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

  // Search and category filtering.
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products
      .filter((product) =>
        tab === "All" ? true : product.category === tab
      )
      .filter(
        (product) =>
          !search ||
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search)
      );
  }, [products, tab, query]);

  // Product statistics.
  const total = products.length;
  const active = products.filter(
    (product) => product.active
  ).length;

  const stats = [
    {
      tone: "gray",
      icon: Package,
      title: "All Products",
      label: "Count of Total products",
      value: total,
    },
    {
      tone: "red",
      icon: CheckCircle2,
      title: "Active Products",
      label: "No. of Current Active Products",
      value: active,
    },
    {
      tone: "amber",
      icon: EyeOff,
      title: "Non-Active Products",
      label: "No. of Current Non-Active Products",
      value: total - active,
    },
  ];

  // Toggle active status in Firestore.
  const toggleActive = async (product) => {
    try {
      setError("");

      await updateProduct(product.id, {
        active: !product.active,
      });
    } catch (err) {
      console.error(
        "Failed to update product status:",
        err
      );
      setError(
        "Could not update the status. Please try again."
      );
    }
  };

  // Expand or collapse a product recipe.
  const toggleOpen = (id) => {
    setOpen((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  // Save a new product or update an existing one.
  const save = async (data) => {
    try {
      setError("");

      if (modal.product) {
        await updateProduct(modal.product.id, data);
      } else {
        await addProduct({
          ...data,
          active: true,
        });
      }

      close();
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(
        err.message ||
          "Failed to save product. Please try again."
      );
      throw err;
    }
  };

  return (
    <div className="bd-products-page">
      {/* PAGE HEADER */}
      <header className="bd-products-header">
        <div className="bd-products-heading">
          <h1>Products</h1>
          <p>
            Manage menu items, pricing, and ingredients for
            each product.
          </p>
        </div>

        <div className="bd-products-clock">
          <Clock3 size={15} />
          <strong>{time}</strong>
          <span>{date}</span>
        </div>
      </header>

      {/* STAT CARDS */}
      <section className="pd-stats">
        {stats.map((stat) => {
          const StatIcon = stat.icon;

          return (
            <div className="pd-stat" key={stat.title}>
              <div className="pd-stat-top">
                <span
                  className={`pd-stat-icon ${stat.tone}`}
                >
                  <StatIcon size={18} />
                </span>

                <span className="pd-stat-title">
                  {stat.title}
                </span>
              </div>

              <p className="pd-stat-label">
                {stat.label}
              </p>

              <p className="pd-stat-value">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* PRODUCT LIST */}
      <section className="bd-products-panel">
        <div className="bd-section-header">
          <div className="bd-section-heading">
            <h2>Product Lists</h2>

            <span className="bd-active-count">
              {visible.length} shown
            </span>
          </div>

          <div className="bd-section-actions">
            <label className="bd-product-search">
              <Icon name="search" size={14} />

              <input
                type="search"
                placeholder="Search products..."
                aria-label="Search products"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />
            </label>

            <button
              type="button"
              className="bd-add-product"
              onClick={() => setModal({})}
            >
              <Icon name="plus" size={14} />
              Add Products
            </button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div
          className="bd-category-tabs"
          role="tablist"
          aria-label="Product categories"
        >
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={
                tab === value ? "bd-category-active" : ""
              }
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="error bd-products-error">
            {error}
          </p>
        )}

        {/* PRODUCT TABLE */}
        <div className="pd-scroll">
          <div className="pd-table" role="table">
            <div className="pd-row pd-head" role="row">
              <div>Product</div>
              <div className="pd-center">Category</div>
              <div className="pd-right">Price</div>
              <div className="pd-center">Status</div>
              <div className="pd-center">Actions</div>
            </div>

            {visible.map((product) => {
              const isOpen = open.has(product.id);

              const selectedSize =
                selectedSizes[product.id] ||
                product.sizes?.[0];

              const displayedPrice =
                isOpen && DRINKS.includes(product.category)
                  ? product.sizePrices?.[selectedSize] ??
                    product.price
                  : product.price;

              return (
                <Fragment key={product.id}>
                  <div className="pd-row" role="row">
                    <div className="pd-name">
                      <button
                        type="button"
                        className="pd-chevron"
                        onClick={() =>
                          toggleOpen(product.id)
                        }
                        aria-expanded={isOpen}
                        aria-label={`Toggle recipe for ${product.name}`}
                      >
                        <motion.span
                          animate={{
                            rotate: isOpen ? 90 : 0,
                          }}
                          transition={{
                            duration: 0.25,
                            ease: "easeInOut",
                          }}
                          style={{
                            display: "inline-flex",
                          }}
                        >
                          <ChevronRight
                            size={14}
                            strokeWidth={2.5}
                          />
                        </motion.span>
                      </button>

                      {product.name}
                    </div>

                    <div className="pd-center">
                      <span className="pd-cat">
                        {product.category}
                      </span>
                    </div>

                    <div className="pd-right pd-price">
                      {peso(displayedPrice)}
                    </div>

                    <div className="pd-center">
                      <span className="pd-status">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={product.active}
                          aria-label={`${product.name} status`}
                          className="pd-switch"
                          onClick={() =>
                            toggleActive(product)
                          }
                        />

                        <span
                          className={
                            product.active ? "" : "off"
                          }
                        >
                          {product.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </span>
                    </div>

                    <div className="pd-center">
                      <button
                        type="button"
                        className="pd-edit"
                        onClick={() =>
                          setModal({ product })
                        }
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* ANIMATED RECIPE */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`recipe-${product.id}`}
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          height: {
                            duration: 0.3,
                            ease: "easeInOut",
                          },
                          opacity: {
                            duration: 0.2,
                          },
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <RecipeDetail
                          product={product}
                          ingredients={ingredients}
                          selectedSize={
                            selectedSizes[product.id]
                          }
                          onSizeChange={(size) =>
                            setSelectedSizes((previous) => ({
                              ...previous,
                              [product.id]: size,
                            }))
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </div>

          {loading ? (
            <div className="pd-empty">
              Loading products...
            </div>
          ) : (
            visible.length === 0 && (
              <div className="pd-empty">
                {query
                  ? `No products match "${query}".`
                  : "No products in this category yet."}
              </div>
            )
          )}
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {modal && (
        <ProductFormModal
          product={modal.product}
          ingredients={ingredients}
          onSave={save}
          onClose={close}
        />
      )}
    </div>
  );
}