
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Coffee,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

import { subscribeToProducts } from "../../products/products.service.js";
import { usePOSCart } from "../store/usePOSCart";
import VariantModal from "./VariantModal";

// Convert the Firestore Products format to the existing POS cart format.
// Keep the variant recipe attached so checkout can use it later.
function toPOSProduct(product) {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const variants = sizes.length
    ? sizes.map((size) => ({
        id: size.toLowerCase(),
        name: size,
        price: Number(product.sizePrices?.[size]),
        recipe: product.recipesBySize?.[size] ?? product.recipe ?? [],
      }))
    : [{
        id: "regular",
        name: "Regular",
        price: Number(product.price),
        recipe: product.recipe ?? [],
      }];

  return {
    ...product,
    imageUrl: product.image || product.imageUrl || "",
    variants: variants.filter((variant) =>
      Number.isFinite(variant.price) && variant.price > 0
    ),
  };
}

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);

export default function ProductCatalog() {
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data
          .filter((product) => product.active === true && product.showOnPos !== false)
          .map(toPOSProduct)
          .filter((product) => product.variants.length > 0));
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Could not load POS products:", err);
        setError("Unable to load products from Firestore.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => [
    "All", ...new Set(products.map((product) => product.category).filter(Boolean))
  ], [products]);

  const addItem = usePOSCart((state) => state.addItem);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  function updateQuantity(productId, change) {
    setQuantities((previous) => ({
      ...previous,
      [productId]: Math.max(
        0,
        (previous[productId] || 0) + change
      ),
    }));
  }

  function handleAdd(product) {
    const quantity = Math.max(1, quantities[product.id] || 0);

    if (product.variants.length > 1) {
      setSelectedProduct(product);
      return;
    }

    const variant = product.variants[0];

    if (!variant) {
      toast.error("This product has no available variant.");
      return;
    }

    addItem(product, variant, quantity);
    setQuantities((previous) => ({
      ...previous,
      [product.id]: 0,
    }));

    toast.success(`${product.name} added to cart`);
  }

  function handleVariantSelect(variant) {
    if (!selectedProduct) return;

    const quantity = Math.max(
      1,
      quantities[selectedProduct.id] || 0
    );

    addItem(selectedProduct, variant, quantity);

    toast.success(
      `${selectedProduct.name} (${variant.name}) added to cart`
    );

    setQuantities((previous) => ({
      ...previous,
      [selectedProduct.id]: 0,
    }));

    setSelectedProduct(null);
  }

  return (
    <section className="bd-product-section">
      <div className="bd-catalog-header">
        <h2>Product Lists</h2>

        <div className="bd-product-search">
          <Search size={15} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="bd-category-tabs">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={
              category === item ? "bd-category-active" : ""
            }
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <div className="bd-product-empty">Loading products...</div>}
      {error && <div className="bd-product-empty" role="alert">{error}</div>}

      <div className="bd-products-grid">
        {filteredProducts.map((product) => {
          const quantity = quantities[product.id] || 0;
          const startingPrice = Math.min(
            ...product.variants.map((variant) => variant.price)
          );

          return (
            <article className="bd-product-card" key={product.id}>
              <div className="bd-product-image">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                  />
                ) : product.category === "Coffee" ||
                  product.category === "Non-Coffee" ? (
                  <Coffee size={43} strokeWidth={1.2} />
                ) : (
                  <Package size={43} strokeWidth={1.2} />
                )}
              </div>

              <div className="bd-product-name">
                {product.name}
              </div>

              <div className="bd-product-price">
                {product.variants.length > 1 ? "From " : ""}
                {formatPrice(startingPrice)}
              </div>

              <span className="bd-product-category">
                {product.category}
              </span>

              <div className="bd-product-actions">
                <div className="bd-product-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(product.id, -1)
                    }
                    aria-label={`Decrease ${product.name} quantity`}
                  >
                    <Minus size={12} />
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(product.id, 1)
                    }
                    aria-label={`Increase ${product.name} quantity`}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  className="bd-add-cart"
                  onClick={() => handleAdd(product)}
                >
                  Add to cart
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="bd-product-empty">
          No matching products found.
        </div>
      )}

      <VariantModal
        product={selectedProduct}
        quantity={
          Math.max(1, quantities[selectedProduct?.id] || 0)
        }
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onSelect={handleVariantSelect}
      />
    </section>
  );
}
