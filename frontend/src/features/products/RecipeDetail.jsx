import { findIngredient, SIZES } from "./products.constants.js";

export default function RecipeDetail({
  product,
  ingredients,
  selectedSize,
  onSizeChange,
}) {
  const offered = SIZES.filter((size) =>
    product.sizes?.includes(size)
  );

  const hasTabs = offered.length > 0;

  const active = offered.includes(selectedSize)
    ? selectedSize
    : offered[0];

  const sizeRecipe = hasTabs
    ? product.recipesBySize?.[active]
    : null;

  const recipe =
    (sizeRecipe?.length ? sizeRecipe : product.recipe) ?? [];

  return (
    <div className="pd-rx">
      <div className="pd-rx-head">
        <h4>Recipe{hasTabs ? "" : " · per 1 unit"}</h4>

        {hasTabs && (
          <div
            className="pd-rx-tabs"
            role="tablist"
            aria-label={`${product.name} sizes`}
          >
            {offered.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={item === active}
                className={item === active ? "active" : ""}
                onClick={() => onSizeChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {recipe.length ? (
        <ul className="pd-rx-list">
          {recipe.map((item, index) => {
            const ingredient = findIngredient(
              ingredients,
              item.ingredientId
            );

            return (
              <li key={`${item.ingredientId}-${index}`}>
                <span>
                  {ingredient?.name ?? "Unknown item"}
                </span>

                <strong>
                  {item.qty} {ingredient?.unit}
                </strong>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="pd-rx-empty">
          No ingredients saved yet.
        </p>
      )}
    </div>
  );
}