import { Fragment, useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import {
  addProduct,
  updateProduct,
  subscribeToProducts,
} from "./products.service.js";
import { uploadProductImage } from "./cloudinary.services";
import "./Products.css";

/* ================= DATABASE SWITCH ================= */

const API_URL = "";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

/* ================= CONSTANTS ================= */

const CATEGORIES = ["Coffee", "Non-Coffee", "Meal", "Pastry", "Dessert"];
const DRINKS = ["Coffee", "Non-Coffee"];
const SIZES = ["Small", "Medium", "Large"];

const TABS = [
  ["All", "All"],
  ["Coffee", "Coffee"],
  ["Non-Coffee", "Non-Coffee"],
  ["Meal", "Meals"],
  ["Pastry", "Pastries"],
  ["Dessert", "Desserts"],
];

const INGREDIENTS = [
  { id: "beans", name: "Espresso Beans", unit: "g" },
  { id: "milk", name: "Fresh Milk", unit: "ml" },
  { id: "water", name: "Water", unit: "ml" },
  { id: "ice", name: "Ice", unit: "g" },
  { id: "cup", name: "Cup & Lid", unit: "pcs" },
  { id: "base", name: "Flavor Base", unit: "g" },
  { id: "flour", name: "Flour", unit: "g" },
  { id: "butter", name: "Butter", unit: "g" },
  { id: "sugar", name: "Sugar", unit: "g" },
  { id: "cream", name: "Cream", unit: "ml" },
  { id: "pasta", name: "Pasta", unit: "g" },
  { id: "bread", name: "Bread", unit: "pcs" },
  { id: "cheese", name: "Cheese", unit: "g" },
  { id: "rice", name: "Rice", unit: "g" },
  { id: "egg", name: "Egg", unit: "pcs" },
  { id: "meat", name: "Meat / Protein", unit: "g" },
];

const MENU = {
  Coffee: [
    ["Americano", 110],
    ["Cold Brew", 130],
    ["Flat White", 140],
    ["Cappuccino", 130],
    ["Spanish Latte", 145],
    ["Hazelnut Latte", 150],
    ["Sea Salt Latte", 155],
    ["Macadamia Latte", 160],
    ["Toffee Nut Latte", 155],
    ["Ube Espresso Latte", 170],
    ["Cinnamon Oat Milk Latte", 165],
  ],
  "Non-Coffee": [
    ["Dark Chocolate", 140],
    ["White Chocolate", 145],
    ["Pure Matcha Latte", 180],
    ["Choco Chip Frappe", 170],
    ["Strawberry Frappe", 140],
    ["Biscoff Cookie Milk", 165],
    ["Oreo Cookie Frappe", 165],
    ["Red Velvet Frappe", 175],
  ],
  Meal: [
    ["Grilled Cheese Sandwich", 150],
    ["BLT", 165],
    ["Chicken Alfredo", 195],
    ["Baked Macaroni & Cheese", 180],
    ["Salted Egg Cream Pasta", 200],
    ["Chicksilog", 170],
    ["Hungarian Silog", 170],
    ["Porkchop Silog", 180],
    ["Lasagna Supreme", 220],
    ["Truffle Cream Pasta", 220],
    ["Spaghetti Bolognese", 185],
  ],
  Pastry: [
    ["Croffle", 110],
    ["Cinnamon Roll", 120],
    ["Banana Bread", 95],
    ["Chocolate Chip Cookie", 95],
    ["Pain au Chocolat", 130],
    ["Croissant", 110],
    ["Blueberry Muffins", 125],
  ],
  Dessert: [
    ["Classic Churros", 130],
    ["Brownies", 110],
    ["Tiramisu", 165],
    ["Chocolate Dreamcake", 180],
    ["Sans Rival", 170],
    ["Red Velvet Cake", 175],
    ["Ube Macapuno Cake", 175],
    ["Mango Overload Cake", 175],
    ["New York Cheesecake", 120],
    ["Blueberry Cheesecake", 95],
    ["Biscoff Cheesecake", 95],
  ],
};

/* ================= SAMPLE RECIPES ================= */

const r = (ingredientId, qty) => ({ ingredientId, qty });

function sampleRecipe(name, category) {
  if (category === "Coffee") {
    return /americano|cold brew/i.test(name)
      ? [r("beans", 18), r("water", 150), r("cup", 1)]
      : [r("beans", 18), r("milk", 150), r("cup", 1)];
  }

  if (category === "Non-Coffee") {
    return /frappe/i.test(name)
      ? [r("milk", 120), r("base", 40), r("ice", 100), r("cup", 1)]
      : [r("milk", 150), r("base", 30), r("cup", 1)];
  }

  if (category === "Meal") {
    if (/silog/i.test(name)) {
      return [r("rice", 200), r("egg", 1), r("meat", 120)];
    }

    if (/sandwich|blt/i.test(name)) {
      return [r("bread", 2), r("cheese", 30), r("meat", 40)];
    }

    return [r("pasta", 150), r("cream", 80), r("cheese", 40)];
  }

  if (category === "Pastry") {
    return [r("flour", 120), r("butter", 50), r("sugar", 20)];
  }

  return [r("flour", 80), r("sugar", 50), r("cream", 60)];
}

const INITIAL_PRODUCTS = Object.entries(MENU)
  .flatMap(([category, items]) =>
    items.map(([name, price]) => ({
      name,
      category,
      price,
      active: true,
      showOnPos: true,
      sizes: DRINKS.includes(category) ? [...SIZES] : [],
      image: null,
      recipe: sampleRecipe(name, category),
    })),
  )
  .map((product, index) => ({
    ...product,
    id: index + 1,
  }));

/* ================= HELPERS ================= */

const findIngredient = (list, id) =>
  list.find((item) => String(item.id) === String(id));

const peso = (amount) =>
  `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ================= PRODUCTS PAGE ================= */

export default function Products() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState(INGREDIENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(new Set());
  const [modal, setModal] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  const close = () => setModal(null);

  /* Load database data */

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Failed to load products:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  /* Update header clock */

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

  /* Search and category filtering */

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products
      .filter((product) => (tab === "All" ? true : product.category === tab))
      .filter(
        (product) =>
          !search ||
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search),
      );
  }, [products, tab, query]);

  /* Statistics */

  const total = products.length;
  const active = products.filter((product) => product.active).length;

  const stats = [
    {
      tone: "gray",
      icon: "cube",
      title: "All Products",
      label: "Count of Total products",
      value: total,
    },
    {
      tone: "red",
      icon: "clockAlert",
      title: "Active Products",
      label: "No. of Current Active Products",
      value: active,
    },
    {
      tone: "amber",
      icon: "eyeOff",
      title: "Non-Active Products",
      label: "No. of Current Non-Active Products",
      value: total - active,
    },
  ];

  /* Toggle active status */

  const toggleActive = async (product) => {
    try {
      setError("");

      await updateProduct(product.id, {
        active: !product.active,
      });
    } catch (err) {
      console.error("Failed to update product status:", err);
      setError("Could not update the status. Please try again.");
    }
  };

  /* Expand or collapse recipes */

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

  /* Add or edit a product */

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
      setError(err.message || "Failed to save product. Please try again.");
      throw err;
    }
  };

  return (
    <div className="bd-products-page">
      {/* PAGE HEADER */}

      <header className="bd-products-header">
        <div className="bd-products-heading">
          <h1>Products</h1>
          <p>Manage menu items, pricing, and ingredients for each product.</p>
        </div>

        <div className="bd-products-clock">
          <Clock3 size={15} />
          <strong>{time}</strong>
          <span>{date}</span>
        </div>
      </header>

      {/* STAT CARDS */}

      <section className="pd-stats">
        {stats.map((stat) => (
          <div className="pd-stat" key={stat.title}>
            <div className="pd-stat-top">
              <span className={`pd-stat-icon ${stat.tone}`}>
                <Icon name={stat.icon} size={18} />
              </span>

              <span className="pd-stat-title">{stat.title}</span>
            </div>

            <p className="pd-stat-label">{stat.label}</p>
            <p className="pd-stat-value">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* PRODUCT LIST SECTION */}

      <section className="bd-products-panel">
        <div className="bd-section-header">
          <div className="bd-section-heading">
            <h2>Product Lists</h2>

            <span className="bd-active-count">{visible.length} shown</span>
          </div>

          <div className="bd-section-actions">
            <label className="bd-product-search">
              <Icon name="search" size={14} />

              <input
                type="search"
                placeholder="Search products..."
                aria-label="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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
              className={tab === value ? "bd-category-active" : ""}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="error bd-products-error">{error}</p>}

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

            {visible.map((product) => (
              <Fragment key={product.id}>
                <div className="pd-row" role="row">
                  <div className="pd-name">
                    <button
                      className={`pd-chevron${
                        open.has(product.id) ? " open" : ""
                      }`}
                      onClick={() => toggleOpen(product.id)}
                      aria-expanded={open.has(product.id)}
                      aria-label={`Toggle recipe for ${product.name}`}
                    >
                      <Icon name="chevronRight" size={14} stroke={2.5} />
                    </button>

                    {product.name}
                  </div>

                  <div className="pd-center">
                    <span className="pd-cat">{product.category}</span>
                  </div>

                  <div className="pd-right pd-price">{peso(product.price)}</div>

                  <div className="pd-center">
                    <span className="pd-status">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={product.active}
                        aria-label={`${product.name} status`}
                        className="pd-switch"
                        onClick={() => toggleActive(product)}
                      />

                      <span className={product.active ? "" : "off"}>
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </div>

                  <div className="pd-center">
                    <button
                      type="button"
                      className="pd-edit"
                      onClick={() => setModal({ product })}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {open.has(product.id) && (
                  <div className="pd-detail">
                    <div>
                      <h4>Recipe · per 1 unit</h4>

                      <ul className="pd-recipe">
                        {product.recipe.map((item, index) => {
                          const ingredient = findIngredient(
                            ingredients,
                            item.ingredientId,
                          );

                          return (
                            <li key={index}>
                              <span>{ingredient?.name ?? "Unknown item"}</span>

                              <strong>
                                {item.qty} {ingredient?.unit}
                              </strong>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div>
                      <h4>Details</h4>

                      <p>
                        Sizes:{" "}
                        {product.sizes.length
                          ? product.sizes.join(", ")
                          : "None"}
                      </p>

                      <p>Shown on POS: {product.showOnPos ? "Yes" : "No"}</p>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {loading ? (
            <div className="pd-empty">Loading products...</div>
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
        <ProductForm
          product={modal.product}
          ingredients={ingredients}
          onSave={save}
          onClose={close}
        />
      )}
    </div>
  );
}

/* ================= ADD / EDIT POPUP ================= */

function ProductForm({ product, ingredients, onSave, onClose }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "Coffee",
    price: product ? String(product.price) : "",
    showOnPos: product?.showOnPos ?? true,
    sizes: product?.sizes ?? [],
    image: product?.image ?? null,
    recipe: product?.recipe?.length
      ? product.recipe.map((item) => ({
          ingredientId: String(item.ingredientId),
          qty: String(item.qty),
        }))
      : [{ ingredientId: "", qty: "" }],
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isDrink = DRINKS.includes(form.category);

  const set = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const toggleSize = (size) =>
    set(
      "sizes",
      form.sizes.includes(size)
        ? form.sizes.filter((item) => item !== size)
        : [...form.sizes, size],
    );

  const setRow = (index, patch) =>
    set(
      "recipe",
      form.recipe.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const removeRow = (index) => {
    const remaining = form.recipe.filter((_, i) => i !== index);

    set(
      "recipe",
      remaining.length ? remaining : [{ ingredientId: "", qty: "" }],
    );
  };

  const addRow = () =>
    set("recipe", [...form.recipe, { ingredientId: "", qty: "" }]);

  const submit = async (event) => {
    event.preventDefault();

    const rows = form.recipe.filter((item) => item.ingredientId || item.qty);

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Enter a product name.";
    }

    if (!(Number(form.price) > 0)) {
      nextErrors.price = "Enter a valid price.";
    }

    if (rows.length === 0) {
      nextErrors.recipe = "Add at least one ingredient.";
    } else if (
      rows.some((item) => !item.ingredientId || !(Number(item.qty) > 0))
    ) {
      nextErrors.recipe = "Pick an ingredient and an amount for every row.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setSaving(true);

    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        showOnPos: form.showOnPos,
        sizes: isDrink ? form.sizes : [],
        image: form.image,
        recipe: rows.map((item) => ({
          ingredientId: item.ingredientId,
          qty: Number(item.qty),
        })),
      });
    } catch {
      setErrors({
        form: "Could not save the product. Please try again.",
      });
      setSaving(false);
    }
  };

  const pickedIds = form.recipe.map((item) => String(item.ingredientId));

  return (
    <Modal onClose={onClose} wide labelledBy="product-form-title">
      <form onSubmit={submit} noValidate className="pd-form">
        <div className="modal-head">
          <div>
            <h3 id="product-form-title">
              {isEdit ? "Edit product" : "Add product"}
            </h3>

            <p>Recipe ingredients are chosen from existing inventory items.</p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={26} />
          </button>
        </div>

        <div className="pd-body">
          <div className="pd-top">
            <div className="pd-fields">
              <div className="field">
                <label htmlFor="pd-name">Product name</label>

                <input
                  id="pd-name"
                  className={`input${errors.name ? " invalid" : ""}`}
                  placeholder="e.g. Spanish Latte"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                />

                {errors.name && <p className="error">{errors.name}</p>}
              </div>

              <div className="field">
                <label htmlFor="pd-category">Category</label>

                <select
                  id="pd-category"
                  className="select"
                  value={form.category}
                  onChange={(event) => set("category", event.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="pd-price">Price (₱)</label>

                  <input
                    id="pd-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className={`input${errors.price ? " invalid" : ""}`}
                    value={form.price}
                    onChange={(event) => set("price", event.target.value)}
                  />

                  {errors.price && <p className="error">{errors.price}</p>}
                </div>

                <div className="field">
                  <span className="label">Availability</span>

                  <label className="pd-check">
                    <input
                      type="checkbox"
                      checked={form.showOnPos}
                      onChange={(event) =>
                        set("showOnPos", event.target.checked)
                      }
                    />
                    Show on POS
                  </label>
                </div>
              </div>
            </div>

            <label className="pd-image" title="Upload product image">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  if (!file) return;

                  setSaving(true);

                  try {
                    const imageUrl = await uploadProductImage(file);
                    set("image", imageUrl);
                    setErrors((previous) => ({
                      ...previous,
                      form: undefined,
                    }));
                  } catch (error) {
                    setErrors((previous) => ({
                      ...previous,
                      form: error.message || "Image upload failed.",
                    }));
                  } finally {
                    setSaving(false);
                    event.target.value = "";
                  }
                }}
              />

              {form.image ? (
                <img src={form.image} alt="Product preview" />
              ) : (
                <Icon name="imageUp" size={110} stroke={1.6} />
              )}
            </label>
          </div>

          {isDrink && (
            <div className="pd-sizes">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="pd-size"
                  aria-pressed={form.sizes.includes(size)}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          <div className="field">
            <span className="label">Recipe - per 1 unit</span>

            {form.recipe.map((row, index) => (
              <div className="pd-recipe-row" key={index}>
                <select
                  className="select"
                  aria-label="Ingredient"
                  value={row.ingredientId}
                  onChange={(event) =>
                    setRow(index, {
                      ingredientId: event.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select ingredient
                  </option>

                  {ingredients.map((ingredient) => (
                    <option
                      key={ingredient.id}
                      value={String(ingredient.id)}
                      disabled={
                        pickedIds.includes(String(ingredient.id)) &&
                        String(ingredient.id) !== String(row.ingredientId)
                      }
                    >
                      {ingredient.name}
                    </option>
                  ))}
                </select>

                <div className="pd-qty">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="input"
                    aria-label="Amount"
                    value={row.qty}
                    onChange={(event) =>
                      setRow(index, { qty: event.target.value })
                    }
                  />

                  <span className="unit">
                    {findIngredient(ingredients, row.ingredientId)?.unit}
                  </span>
                </div>

                <button
                  type="button"
                  className="pd-trash"
                  onClick={() => removeRow(index)}
                  aria-label="Remove ingredient"
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            ))}

            {errors.recipe && <p className="error">{errors.recipe}</p>}

            <button type="button" className="pd-add-row" onClick={addRow}>
              <Icon name="plus" size={16} />
              Add ingredient
            </button>
          </div>

          {errors.form && <p className="error">{errors.form}</p>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
