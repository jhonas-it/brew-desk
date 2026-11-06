import { Fragment, useEffect, useMemo, useState } from "react";
import { Clock3, ImageUp } from "lucide-react";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import {
  addProduct,
  updateProduct,
  subscribeToProducts,
} from "./products.service.js";
import { uploadProductImage } from "./cloudinary.services";
import "./Products.css";

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

/*
  Ingredients are ONE shared list for every size.
  Each row keeps its own quantity per size (plus "default" for
  non-drink products), so adding or removing an ingredient affects
  all sizes while the quantity input follows the open size tab.
*/

const emptyQty = () => ({ Small: "", Medium: "", Large: "", default: "" });
const blankRow = () => ({ ingredientId: "", qty: emptyQty() });

function buildInitialRows(product) {
  const rows = [];
  const byId = new Map();

  const ensure = (id) => {
    const key = String(id);

    if (!byId.has(key)) {
      const row = { ingredientId: key, qty: emptyQty() };
      byId.set(key, row);
      rows.push(row);
    }

    return byId.get(key);
  };

  const bySize = product?.recipesBySize ?? {};
  const hasSizeRecipes = SIZES.some((size) => bySize[size]?.length);

  SIZES.forEach((size) => {
    (bySize[size] ?? []).forEach((item) => {
      ensure(item.ingredientId).qty[size] = String(item.qty);
    });
  });

  (product?.recipe ?? []).forEach((item) => {
    const row = ensure(item.ingredientId);

    row.qty.default = String(item.qty);

    // Older products only have one recipe: use it for every size.
    if (!hasSizeRecipes) {
      SIZES.forEach((size) => {
        row.qty[size] = String(item.qty);
      });
    }
  });

  return rows.length ? rows : [blankRow()];
}

function UploadImageIcon() {
  return (
    <svg width="144" height="130" viewBox="0 0 144 130" fill="none">
      <path
        d="M52 22H126a14 14 0 0 1 14 14V112a14 14 0 0 1-14 14H18A14 14 0 0 1 4 112V66"
        stroke="#1f1f1f"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path d="M24 4L44 30H33V66H15V30H4Z" fill="#1f1f1f" />
      <circle cx="112" cy="52" r="17" fill="#1f1f1f" />
      <path d="M12 116L52 74L74 98L92 80L132 116Z" fill="#1f1f1f" />
    </svg>
  );
}


function ProductForm({ product, ingredients, onSave, onClose }) {
  const isEdit = Boolean(product);

  const initialSizes = product?.sizes?.length
    ? product.sizes
    : DRINKS.includes(product?.category ?? "Coffee")
      ? [...SIZES]
      : [];

  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "Coffee",
    price: product?.price != null ? String(product.price) : "",
    showOnPos: product?.showOnPos ?? true,
    sizes: initialSizes,
    image: product?.image ?? null,
    rows: buildInitialRows(product),
    sizePrices: Object.fromEntries(
      SIZES.map((size) => [
        size,
        product?.sizePrices?.[size] != null
          ? String(product.sizePrices[size])
          : product?.price != null
            ? String(product.price)
            : "",
      ]),
    ),
  });

  const [activeSize, setActiveSize] = useState(
    SIZES.find((size) => initialSizes.includes(size)) ?? "Small",
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isDrink = DRINKS.includes(form.category);
  const activeKey = isDrink ? activeSize : "default";
  const sizeOffered = form.sizes.includes(activeSize);

  const set = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const changeCategory = (category) => {
    setForm((previous) => ({
      ...previous,
      category,
      sizes:
        DRINKS.includes(category) && !previous.sizes.length
          ? [...SIZES]
          : previous.sizes,
    }));
  };

  const toggleSize = (size) => {
    const nextSizes = form.sizes.includes(size)
      ? form.sizes.filter((item) => item !== size)
      : [...form.sizes, size];

    set("sizes", nextSizes);
  };

  const setSizePrice = (size, value) => {
    setForm((previous) => ({
      ...previous,
      sizePrices: { ...previous.sizePrices, [size]: value },
    }));

    setErrors((previous) => ({
      ...previous,
      [`price-${size}`]: undefined,
    }));
  };

  /* ---- shared ingredient rows ---- */

  const clearRecipeErrors = (key) =>
    setErrors((previous) => ({
      ...previous,
      recipe: undefined,
      ...(key ? { [`recipe-${key}`]: undefined } : {}),
    }));

  const setIngredient = (index, ingredientId) => {
    setForm((previous) => ({
      ...previous,
      rows: previous.rows.map((row, i) =>
        i === index ? { ...row, ingredientId } : row,
      ),
    }));

    clearRecipeErrors();
  };

  const setQty = (index, key, value) => {
    setForm((previous) => ({
      ...previous,
      rows: previous.rows.map((row, i) =>
        i === index ? { ...row, qty: { ...row.qty, [key]: value } } : row,
      ),
    }));

    clearRecipeErrors(key);
  };

  const addRow = () => {
    setForm((previous) => ({
      ...previous,
      rows: [...previous.rows, blankRow()],
    }));
  };

  const removeRow = (index) => {
    setForm((previous) => {
      const remaining = previous.rows.filter((_, i) => i !== index);

      return {
        ...previous,
        rows: remaining.length ? remaining : [blankRow()],
      };
    });
  };

  const uploadImage = async (event) => {
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
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    const keys = isDrink ? form.sizes : ["default"];

    if (!form.name.trim()) {
      nextErrors.name = "Enter a product name.";
    }

    /* Prices */

    if (isDrink) {
      if (!form.sizes.length) {
        nextErrors.sizes = "Offer at least one size.";
      }

      form.sizes.forEach((size) => {
        const price = form.sizePrices[size];

        if (
          price === "" ||
          !Number.isFinite(Number(price)) ||
          Number(price) <= 0
        ) {
          nextErrors[`price-${size}`] = `Enter a valid price for ${size}.`;
        }
      });
    } else if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      nextErrors.price = "Enter a valid price.";
    }

    /* Ingredients (shared list, quantity per size) */

    const filled = form.rows.filter(
      (row) => row.ingredientId || keys.some((key) => row.qty[key] !== ""),
    );

    if (!filled.length) {
      nextErrors.recipe = "Add at least one ingredient.";
    } else {
      if (filled.some((row) => !row.ingredientId)) {
        nextErrors.recipe = "Select an ingredient for every row.";
      }

      const ids = filled.map((row) => row.ingredientId).filter(Boolean);

      if (new Set(ids).size !== ids.length) {
        nextErrors.recipe = "Each ingredient can only be added once.";
      }

      keys.forEach((key) => {
        const bad = filled.some(
          (row) =>
            row.qty[key] === "" ||
            !Number.isFinite(Number(row.qty[key])) ||
            Number(row.qty[key]) <= 0,
        );

        if (bad) {
          nextErrors[`recipe-${key}`] =
            key === "default"
              ? "Enter a quantity above zero for every ingredient."
              : `${key}: enter a quantity above zero for every ingredient.`;
        }
      });
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      // Jump to the first size that has a problem.
      const badSize = SIZES.find(
        (size) => nextErrors[`price-${size}`] || nextErrors[`recipe-${size}`],
      );

      if (isDrink && badSize) setActiveSize(badSize);

      return;
    }

    const recipeFor = (key) =>
      filled.map((row) => ({
        ingredientId: row.ingredientId,
        qty: Number(row.qty[key]),
      }));

    const primarySize = SIZES.find((size) => form.sizes.includes(size));

    // Keep legacy price and recipe fields for existing product-list code.
    const legacyPrice = isDrink
      ? Number(form.sizePrices[primarySize])
      : Number(form.price);

    const legacyRecipe = isDrink
      ? recipeFor(primarySize)
      : recipeFor("default");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: legacyPrice,
      showOnPos: form.showOnPos,
      sizes: isDrink ? form.sizes : [],
      image: form.image,
      recipe: legacyRecipe,
      sizePrices: isDrink
        ? Object.fromEntries(
            form.sizes.map((size) => [size, Number(form.sizePrices[size])]),
          )
        : {},
      recipesBySize: isDrink
        ? Object.fromEntries(
            form.sizes.map((size) => [size, recipeFor(size)]),
          )
        : {},
    };

    setSaving(true);

    try {
      await onSave(payload);
    } catch {
      setErrors((previous) => ({
        ...previous,
        form: "Could not save the product. Please try again.",
      }));
      setSaving(false);
    }
  };

  /* One ingredient list; quantity input follows the selected size */

  const renderRecipeEditor = () => {
    const pickedIds = form.rows.map((row) => String(row.ingredientId));
    const disabled = isDrink && !sizeOffered;

    return (
      <div className="pd-recipe-editor">
        {form.rows.map((row, index) => (
          <div className="pd-recipe-row" key={index}>
            <select
              className="select"
              aria-label="Ingredient"
              value={row.ingredientId}
              disabled={disabled}
              onChange={(event) => setIngredient(index, event.target.value)}
            >
              <option value="">Select ingredient</option>

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
                aria-label={
                  isDrink
                    ? `${activeSize} ingredient quantity`
                    : "Ingredient quantity"
                }
                placeholder="Quantity"
                value={row.qty[activeKey]}
                disabled={disabled}
                onChange={(event) =>
                  setQty(index, activeKey, event.target.value)
                }
              />

              <span className="unit">
                {findIngredient(ingredients, row.ingredientId)?.unit || "unit"}
              </span>
            </div>

            <button
              type="button"
              className="pd-trash"
              onClick={() => removeRow(index)}
              aria-label="Remove ingredient"
              title={isDrink ? "Remove from all sizes" : "Remove ingredient"}
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
        ))}

        {errors.recipe && <p className="error">{errors.recipe}</p>}

        {errors[`recipe-${activeKey}`] && (
          <p className="error">{errors[`recipe-${activeKey}`]}</p>
        )}

        <button
          type="button"
          className="pd-add-row"
          onClick={addRow}
          disabled={disabled}
        >
          <Icon name="plus" size={16} />
          Add ingredient
        </button>
      </div>
    );
  };

  const priceError = isDrink ? errors[`price-${activeSize}`] : errors.price;

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
                  onChange={(event) => changeCategory(event.target.value)}
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
                    className={`input${priceError ? " invalid" : ""}`}
                    placeholder="0.00"
                    value={
                      isDrink ? form.sizePrices[activeSize] : form.price
                    }
                    disabled={isDrink && !sizeOffered}
                    onChange={(event) =>
                      isDrink
                        ? setSizePrice(activeSize, event.target.value)
                        : set("price", event.target.value)
                    }
                  />
                  {priceError && <p className="error">{priceError}</p>}
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
                onChange={uploadImage}
              />

              {form.image ? (
                <img src={form.image} alt="Product preview" />
              ) : (
                <>
                  <UploadImageIcon />
                  <span>Upload product image</span>
                  <small>Click to choose an image</small>
                </>
              )}
            </label>
          </div>

          {/* DRINK SIZES: pills between price row and recipe */}
          {isDrink && (
            <div className="pd-sizes-wrap">
              <div className="pd-sizes-row" role="tablist" aria-label="Drink sizes">
                {SIZES.map((size) => {
                  const hasError =
                    errors[`price-${size}`] || errors[`recipe-${size}`];

                  return (
                    <button
                      key={size}
                      type="button"
                      role="tab"
                      aria-selected={activeSize === size}
                      className={[
                        "pd-pill",
                        activeSize === size ? "active" : "",
                        form.sizes.includes(size) ? "" : "off",
                        hasError ? "has-error" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setActiveSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}

                <label className="pd-offer">
                  <input
                    type="checkbox"
                    checked={sizeOffered}
                    onChange={() => toggleSize(activeSize)}
                  />
                  Offer {activeSize}
                </label>
              </div>

              {errors.sizes && <p className="error">{errors.sizes}</p>}
            </div>
          )}

          <div className="field">
            <span className="label">
              Recipe - per 1 unit{isDrink ? ` (${activeSize})` : ""}
            </span>
            {renderRecipeEditor()}
          </div>

          {errors.form && <p className="error">{errors.form}</p>}
        </div>

        <div className="modal-foot">
          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update product" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}