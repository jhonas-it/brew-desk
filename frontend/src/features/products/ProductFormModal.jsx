import { useState } from "react";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import { uploadProductImage } from "./cloudinary.services";
import {
  CATEGORIES,
  DRINKS,
  SIZES,
  findIngredient,
} from "./products.constants.js";

const emptyQty = () => ({
  Small: "",
  Medium: "",
  Large: "",
  default: "",
});

const blankRow = () => ({
  ingredientId: "",
  qty: emptyQty(),
});

function buildInitialRows(product) {
  const rows = [];
  const byId = new Map();

  const ensure = (id) => {
    const key = String(id);

    if (!byId.has(key)) {
      const row = {
        ingredientId: key,
        qty: emptyQty(),
      };

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

export default function ProductFormModal({
  product,
  ingredients,
  onSave,
  onClose,
}) {
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
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
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

    setErrors((previous) => ({
      ...previous,
      sizes: undefined,
      price: undefined,
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
      sizePrices: {
        ...previous.sizePrices,
        [size]: value,
      },
    }));

    setErrors((previous) => ({
      ...previous,
      [`price-${size}`]: undefined,
    }));
  };

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
        i === index
          ? {
              ...row,
              qty: {
                ...row.qty,
                [key]: value,
              },
            }
          : row,
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

    // Validate prices.
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

    // Validate shared ingredients and each size's quantity.
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
      const badSize = SIZES.find(
        (size) => nextErrors[`price-${size}`] || nextErrors[`recipe-${size}`],
      );

      if (isDrink && badSize) {
        setActiveSize(badSize);
      }

      return;
    }

    const recipeFor = (key) =>
      filled.map((row) => ({
        ingredientId: row.ingredientId,
        ingredientName:
          findIngredient(ingredients, row.ingredientId)?.name || "",
        qty: Number(row.qty[key]),
      }));

    const primarySize = SIZES.find((size) => form.sizes.includes(size));

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
        ? Object.fromEntries(form.sizes.map((size) => [size, recipeFor(size)]))
        : {},
    };

    setSaving(true);

    try {
      await onSave(payload);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        form: error.message || "Could not save the product. Please try again.",
      }));

      setSaving(false);
    }
  };

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

              {[...ingredients]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((ingredient) => (
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
                    value={isDrink ? form.sizePrices[activeSize] : form.price}
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

          {isDrink && (
            <div className="pd-sizes-wrap">
              <div
                className="pd-sizes-row"
                role="tablist"
                aria-label="Drink sizes"
              >
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
              Recipe - per 1 unit
              {isDrink ? ` (${activeSize})` : ""}
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
