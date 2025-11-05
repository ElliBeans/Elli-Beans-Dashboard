import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState([{ ingredient: "", amount: "" }]);
  const [loading, setLoading] = useState(true);

  // Fetch all recipes
  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("recipes").select("*");
    if (error) console.error("Error fetching recipes:", error);
    else setRecipes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Add new recipe
  const addRecipe = async (e) => {
    e.preventDefault();

    const cleanedIngredients = ingredients
      .filter((i) => i.ingredient.trim() !== "")
      .map((i) => ({
        ingredient: i.ingredient,
        amount: Number(i.amount),
      }));

    const { error } = await supabase.from("recipes").insert([
      {
        name,
        ingredients: cleanedIngredients, // ✅ jsonb field
      },
    ]);

    if (error) {
      console.error("Error adding recipe:", error);
    } else {
      setName("");
      setIngredients([{ ingredient: "", amount: "" }]);
      fetchRecipes();
    }
  };

  // Add another ingredient row
  const addIngredientRow = () => {
    setIngredients([...ingredients, { ingredient: "", amount: "" }]);
  };

  // Update ingredient fields
  const updateIngredientField = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Recipes</h1>

      {/* Add Recipe Form */}
      <form
        onSubmit={addRecipe}
        className="mb-8 p-4 bg-white shadow rounded space-y-4 max-w-xl"
      >
        <h2 className="font-semibold text-lg">Add New Recipe</h2>

        <input
          type="text"
          placeholder="Recipe Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <h3 className="font-medium text-md">Ingredients</h3>

        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Ingredient name"
              value={ing.ingredient}
              onChange={(e) =>
                updateIngredientField(i, "ingredient", e.target.value)
              }
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Amount"
              value={ing.amount}
              onChange={(e) =>
                updateIngredientField(i, "amount", e.target.value)
              }
              className="w-24 p-2 border rounded"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredientRow}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          + Add Ingredient
        </button>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 block"
        >
          Save Recipe
        </button>
      </form>

      {/* Recipe List */}
      {loading ? (
        <p>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-xl">{recipe.name}</h2>

              <h3 className="mt-3 font-medium">Ingredients:</h3>

              <ul className="list-disc pl-6 mt-2">
                {recipe.ingredients?.map((ing, idx) => (
                  <li key={idx}>
                    {ing.ingredient} — {ing.amount}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
