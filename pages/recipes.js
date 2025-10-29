import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all recipes
  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("recipes").select("*");
    if (error) console.error("Error fetching recipes:", error);
    else setRecipes(data);
    setLoading(false);
  };

  // Fetch inventory for ingredient selection
  const fetchInventory = async () => {
    const { data, error } = await supabase.from("inventory").select("*");
    if (error) console.error("Error fetching inventory:", error);
    else setInventory(data);
  };

  useEffect(() => {
    fetchRecipes();
    fetchInventory();
  }, []);

  // Add new recipe
  const addRecipe = async (e) => {
    e.preventDefault();
    // COGS = sum of ingredient costs
    const cogs = ingredients.reduce((total, ingId) => {
      const item = inventory.find((i) => i.id === Number(ingId));
      return total + (item?.cost || 0);
    }, 0);

    const { error } = await supabase.from("recipes").insert([
      { name, ingredient_ids: ingredients, cogs },
    ]);

    if (error) console.error("Error adding recipe:", error);
    else {
      setName("");
      setIngredients([]);
      fetchRecipes();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products / Recipes</h1>

      {/* Add Recipe Form */}
      <form
        onSubmit={addRecipe}
        className="mb-6 p-4 bg-white rounded shadow space-y-3 max-w-md"
      >
        <h2 className="font-semibold text-lg">Add New Product</h2>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block font-medium">Ingredients</label>
        <select
          multiple
          value={ingredients}
          onChange={(e) =>
            setIngredients(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          className="w-full p-2 border rounded"
        >
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (${item.cost.toFixed(2)})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>

      {/* Recipes List */}
      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Ingredients</th>
              <th className="p-2">COGS</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.name}</td>
                <td className="p-2">
                  {r.ingredient_ids
                    .map(
                      (id) =>
                        inventory.find((i) => i.id === id)?.name || "Unknown"
                    )
                    .join(", ")}
                </td>
                <td className="p-2">${r.cogs.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
