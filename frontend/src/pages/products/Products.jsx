import { Fragment, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'
import './Products.css'

/* ================= DATABASE SWITCH =================
   Leave empty  -> runs with the sample data below (no backend needed)
   Set a URL    -> loads and saves through your backend, e.g.
                   const API_URL = 'http://localhost:3000/api'
*/
const API_URL = ''

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

/* ================= SAMPLE DATA (used when API_URL is empty) ================= */

const CATEGORIES = ['Coffee', 'Non-Coffee', 'Meal', 'Pastry', 'Dessert']
const DRINKS = ['Coffee', 'Non-Coffee']
const SIZES = ['Small', 'Medium', 'Large']

const TABS = [
  ['All', 'All'],
  ['Coffee', 'Coffee'],
  ['Non-Coffee', 'Non-Coffee'],
  ['Meal', 'Meals'],
  ['Pastry', 'Pastries'],
  ['Dessert', 'Desserts'],
]

// Stand-in for your Inventory page. Recipes pick from this list.
const INGREDIENTS = [
  { id: 'beans', name: 'Espresso Beans', unit: 'g' },
  { id: 'milk', name: 'Fresh Milk', unit: 'ml' },
  { id: 'water', name: 'Water', unit: 'ml' },
  { id: 'ice', name: 'Ice', unit: 'g' },
  { id: 'cup', name: 'Cup & Lid', unit: 'pcs' },
  { id: 'base', name: 'Flavor Base', unit: 'g' },
  { id: 'flour', name: 'Flour', unit: 'g' },
  { id: 'butter', name: 'Butter', unit: 'g' },
  { id: 'sugar', name: 'Sugar', unit: 'g' },
  { id: 'cream', name: 'Cream', unit: 'ml' },
  { id: 'pasta', name: 'Pasta', unit: 'g' },
  { id: 'bread', name: 'Bread', unit: 'pcs' },
  { id: 'cheese', name: 'Cheese', unit: 'g' },
  { id: 'rice', name: 'Rice', unit: 'g' },
  { id: 'egg', name: 'Egg', unit: 'pcs' },
  { id: 'meat', name: 'Meat / Protein', unit: 'g' },
]

const MENU = {
  Coffee: [
    ['Americano', 110], ['Cold Brew', 130], ['Flat White', 140], ['Cappuccino', 130],
    ['Spanish Latte', 145], ['Hazelnut Latte', 150], ['Sea Salt Latte', 155],
    ['Macadamia Latte', 160], ['Toffee Nut Latte', 155], ['Ube Espresso Latte', 170],
    ['Cinnamon Oat Milk Latte', 165],
  ],
  'Non-Coffee': [
    ['Dark Chocolate', 140], ['White Chocolate', 145], ['Pure Matcha Latte', 180],
    ['Choco Chip Frappe', 170], ['Strawberry Frappe', 140], ['Biscoff Cookie Milk', 165],
    ['Oreo Cookie Frappe', 165], ['Red Velvet Frappe', 175],
  ],
  Meal: [
    ['Grilled Cheese Sandwich', 150], ['BLT', 165], ['Chicken Alfredo', 195],
    ['Baked Macaroni & Cheese', 180], ['Salted Egg Cream Pasta', 200], ['Chicksilog', 170],
    ['Hungarian Silog', 170], ['Porkchop Silog', 180], ['Lasagna Supreme', 220],
    ['Truffle Cream Pasta', 220], ['Spaghetti Bolognese', 185],
  ],
  Pastry: [
    ['Croffle', 110], ['Cinnamon Roll', 120], ['Banana Bread', 95],
    ['Chocolate Chip Cookie', 95], ['Pain au Chocolat', 130], ['Croissant', 110],
    ['Blueberry Muffins', 125],
  ],
  Dessert: [
    ['Classic Churros', 130], ['Brownies', 110], ['Tiramisu', 165],
    ['Chocolate Dreamcake', 180], ['Sans Rival', 170], ['Red Velvet Cake', 175],
    ['Ube Macapuno Cake', 175], ['Mango Overload Cake', 175], ['New York Cheesecake', 120],
    ['Blueberry Cheesecake', 95], ['Biscoff Cheesecake', 95],
  ],
}

// Placeholder recipes so the expandable rows have something to show
const r = (ingredientId, qty) => ({ ingredientId, qty })

function sampleRecipe(name, category) {
  if (category === 'Coffee') {
    return /americano|cold brew/i.test(name)
      ? [r('beans', 18), r('water', 150), r('cup', 1)]
      : [r('beans', 18), r('milk', 150), r('cup', 1)]
  }
  if (category === 'Non-Coffee') {
    return /frappe/i.test(name)
      ? [r('milk', 120), r('base', 40), r('ice', 100), r('cup', 1)]
      : [r('milk', 150), r('base', 30), r('cup', 1)]
  }
  if (category === 'Meal') {
    if (/silog/i.test(name)) return [r('rice', 200), r('egg', 1), r('meat', 120)]
    if (/sandwich|blt/i.test(name)) return [r('bread', 2), r('cheese', 30), r('meat', 40)]
    return [r('pasta', 150), r('cream', 80), r('cheese', 40)]
  }
  if (category === 'Pastry') return [r('flour', 120), r('butter', 50), r('sugar', 20)]
  return [r('flour', 80), r('sugar', 50), r('cream', 60)]
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
    }))
  )
  .map((p, i) => ({ ...p, id: i + 1 }))

/* ================= HELPERS ================= */

const findIngredient = (list, id) => list.find((i) => String(i.id) === String(id))

const peso = (n) =>
  `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/* ================= PAGE ================= */

export default function Products() {
  const [products, setProducts] = useState(API_URL ? [] : INITIAL_PRODUCTS)
  const [ingredients, setIngredients] = useState(INGREDIENTS)
  const [loading, setLoading] = useState(Boolean(API_URL))
  const [error, setError] = useState('')

  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(new Set()) // ids of rows with the recipe showing
  const [modal, setModal] = useState(null) // { product? } -> add (no product) or edit

  const close = () => setModal(null)

  // Load from the database (only when API_URL is set)
  useEffect(() => {
    if (!API_URL) return

    request('/products')
      .then(setProducts)
      .catch(() => setError('Could not load products. Is the server running?'))
      .finally(() => setLoading(false))

    // If /ingredients isn't ready yet, the sample list stays in use
    request('/ingredients')
      .then(setIngredients)
      .catch(() => {})
  }, [])

  // Tab filter, then search filter
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => tab === 'All' || p.category === tab)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  }, [products, tab, query])

  const total = products.length
  const active = products.filter((p) => p.active).length

  const stats = [
    { tone: 'gray', icon: 'cube', title: 'All Products', label: 'Count of Total products', value: total },
    { tone: 'red', icon: 'clockAlert', title: 'Active Products', label: 'No. of Current Active Products', value: active },
    { tone: 'amber', icon: 'eyeOff', title: 'Non-Active Products', label: 'No. of Current Non-Active Products', value: total - active },
  ]

  const toggleActive = async (product) => {
    const next = !product.active
    try {
      if (API_URL) {
        await request(`/products/${product.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ active: next }),
        })
      }
      setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, active: next } : p)))
      setError('')
    } catch {
      setError('Could not update the status. Please try again.')
    }
  }

  const toggleOpen = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Throws on failure so the popup can show an error and stay open
  const save = async (data) => {
    const editing = Boolean(modal.product)
    let saved

    if (API_URL) {
      saved = await request(editing ? `/products/${modal.product.id}` : '/products', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      })
    } else {
      saved = editing ? { ...modal.product, ...data } : { ...data, id: Date.now(), active: true }
    }

    setProducts((list) =>
      editing ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved]
    )
    setError('')
    close()
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Menu items and the exact ingredients each one consumes per unit sold"
      />

      {/* Stat cards */}
      <section className="pd-stats">
        {stats.map((s) => (
          <div className="pd-stat" key={s.title}>
            <div className="pd-stat-top">
              <span className={`pd-stat-icon ${s.tone}`}>
                <Icon name={s.icon} size={20} />
              </span>
              <span className="pd-stat-title">{s.title}</span>
            </div>
            <p className="pd-stat-label">{s.label}</p>
            <p className="pd-stat-value">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Tabs + Add button */}
      <div className="pd-toolbar">
        <div className="pd-tabs" role="tablist" aria-label="Product categories">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={tab === value}
              className={`pd-tab${tab === value ? ' active' : ''}`}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="pd-add" onClick={() => setModal({})}>
          <Icon name="plus" size={16} />
          Add Products
        </button>
      </div>

      {/* Table */}
      <section className="pd-panel">
        <div className="pd-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && (
          <p className="error" style={{ margin: '0 20px 12px' }}>
            {error}
          </p>
        )}

        <div className="pd-scroll">
          <div className="pd-table" role="table">
            <div className="pd-row pd-head" role="row">
              <div>Product</div>
              <div className="pd-center">Category</div>
              <div className="pd-right">Price</div>
              <div className="pd-center">Status</div>
              <div className="pd-center">Actions</div>
            </div>

            {visible.map((p) => (
              <Fragment key={p.id}>
                <div className="pd-row" role="row">
                  <div className="pd-name">
                    <button
                      className={`pd-chevron${open.has(p.id) ? ' open' : ''}`}
                      onClick={() => toggleOpen(p.id)}
                      aria-expanded={open.has(p.id)}
                      aria-label={`Toggle recipe for ${p.name}`}
                    >
                      <Icon name="chevronRight" size={16} stroke={2.5} />
                    </button>
                    {p.name}
                  </div>

                  <div className="pd-center pd-cat">{p.category}</div>
                  <div className="pd-right pd-price">{peso(p.price)}</div>

                  <div className="pd-center">
                    <span className="pd-status">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.active}
                        aria-label={`${p.name} status`}
                        className="pd-switch"
                        onClick={() => toggleActive(p)}
                      />
                      <span className={p.active ? '' : 'off'}>{p.active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </div>

                  <div className="pd-center">
                    <button className="pd-edit" onClick={() => setModal({ product: p })}>
                      Edit
                    </button>
                  </div>
                </div>

                {open.has(p.id) && (
                  <div className="pd-detail">
                    <div>
                      <h4>Recipe · per 1 unit</h4>
                      <ul className="pd-recipe">
                        {p.recipe.map((item, i) => {
                          const ing = findIngredient(ingredients, item.ingredientId)
                          return (
                            <li key={i}>
                              <span>{ing?.name ?? 'Unknown item'}</span>
                              <strong>
                                {item.qty} {ing?.unit}
                              </strong>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    <div>
                      <h4>Details</h4>
                      <p>Sizes: {p.sizes.length ? p.sizes.join(', ') : 'None'}</p>
                      <p>Shown on POS: {p.showOnPos ? 'Yes' : 'No'}</p>
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
                {query ? `No products match "${query}".` : 'No products in this category yet.'}
              </div>
            )
          )}
        </div>
      </section>

      {modal && (
        <ProductForm
          product={modal.product}
          ingredients={ingredients}
          onSave={save}
          onClose={close}
        />
      )}
    </>
  )
}

/* ================= ADD / EDIT POPUP ================= */

function ProductForm({ product, ingredients, onSave, onClose }) {
  const isEdit = Boolean(product)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? 'Coffee',
    price: product ? String(product.price) : '',
    showOnPos: product?.showOnPos ?? true,
    sizes: product?.sizes ?? [],
    image: product?.image ?? null,
    recipe: product?.recipe.length
      ? product.recipe.map((x) => ({ ingredientId: String(x.ingredientId), qty: String(x.qty) }))
      : [{ ingredientId: '', qty: '' }],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isDrink = DRINKS.includes(form.category)

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleSize = (size) =>
    set('sizes', form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size])

  const setRow = (index, patch) =>
    set('recipe', form.recipe.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const removeRow = (index) => {
    const rest = form.recipe.filter((_, i) => i !== index)
    set('recipe', rest.length ? rest : [{ ingredientId: '', qty: '' }])
  }

  const addRow = () => set('recipe', [...form.recipe, { ingredientId: '', qty: '' }])

  const submit = async (e) => {
    e.preventDefault()

    const rows = form.recipe.filter((x) => x.ingredientId || x.qty)
    const next = {}
    if (!form.name.trim()) next.name = 'Enter a product name.'
    if (!(Number(form.price) > 0)) next.price = 'Enter a valid price.'
    if (rows.length === 0) next.recipe = 'Add at least one ingredient.'
    else if (rows.some((x) => !x.ingredientId || !(Number(x.qty) > 0)))
      next.recipe = 'Pick an ingredient and an amount for every row.'

    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        showOnPos: form.showOnPos,
        sizes: isDrink ? form.sizes : [],
        image: form.image,
        recipe: rows.map((x) => ({ ingredientId: x.ingredientId, qty: Number(x.qty) })),
      })
    } catch {
      setErrors({ form: 'Could not save the product. Please try again.' })
      setSaving(false)
    }
  }

  const pickedIds = form.recipe.map((x) => String(x.ingredientId))

  return (
    <Modal onClose={onClose} wide labelledBy="product-form-title">
      <form onSubmit={submit} noValidate className="pd-form">
        <div className="modal-head">
          <div>
            <h3 id="product-form-title">{isEdit ? 'Edit product' : 'Add product'}</h3>
            <p>Recipe ingredients are chosen from existing inventory items.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
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
                  className={`input${errors.name ? ' invalid' : ''}`}
                  placeholder="e.g. Spanish Latte"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
                {errors.name && <p className="error">{errors.name}</p>}
              </div>

              <div className="field">
                <label htmlFor="pd-category">Category</label>
                <select
                  id="pd-category"
                  className="select"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
                    className={`input${errors.price ? ' invalid' : ''}`}
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                  />
                  {errors.price && <p className="error">{errors.price}</p>}
                </div>

                <div className="field">
                  <span className="label">Availability</span>
                  <label className="pd-check">
                    <input
                      type="checkbox"
                      checked={form.showOnPos}
                      onChange={(e) => set('showOnPos', e.target.checked)}
                    />
                    Show on POS
                  </label>
                </div>
              </div>
            </div>

            {/* NOTE: this only previews the image in the browser.
                To store it, upload the file to your backend and save the URL it returns. */}
            <label className="pd-image" title="Upload product image">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) set('image', URL.createObjectURL(file))
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

            {form.recipe.map((row, i) => (
              <div className="pd-recipe-row" key={i}>
                <select
                  className="select"
                  aria-label="Ingredient"
                  value={row.ingredientId}
                  onChange={(e) => setRow(i, { ingredientId: e.target.value })}
                >
                  <option value="" disabled>
                    Select ingredient
                  </option>
                  {ingredients.map((ing) => (
                    <option
                      key={ing.id}
                      value={String(ing.id)}
                      disabled={
                        pickedIds.includes(String(ing.id)) && String(ing.id) !== String(row.ingredientId)
                      }
                    >
                      {ing.name}
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
                    onChange={(e) => setRow(i, { qty: e.target.value })}
                  />
                  <span className="unit">{findIngredient(ingredients, row.ingredientId)?.unit}</span>
                </div>

                <button
                  type="button"
                  className="pd-trash"
                  onClick={() => removeRow(i)}
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
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}