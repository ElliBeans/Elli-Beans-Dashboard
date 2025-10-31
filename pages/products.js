import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newProductName, setNewProductName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchInventory();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data || []);
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase.from("inventory").select("*");
    if (!error) setInventory(data || []);
  };

  const toggleIngredient = (id) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const addProduct = async () => {
    if (!newProductName.trim()) return alert("Enter a product name");

    const ingredientObjects = selectedIngredients.map((id) => ({
      inventory_id: id,
      amount: 1, // default — can improve later
    }));

    const { error } = await supabase.from("products").insert([
      {
        name: newProductName,
        ingredients: ingredientObjects,
      },
    ]);

    if (error) {
      alert("Error adding product");
      console.error(error);
    } else {
      setNewProductName("");
      setSelectedIngredients([]);
      fetchProducts();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="font-semibold mb-2">Add New Product</h2>

        <input
          type="text"
          placeholder="Product name"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />

        <p className="font-medium mb-2">Select Ingredients</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {inventory.map((item) => (
            <label key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIngredients.includes(item.id)}
                onChange={() => toggleIngredient(item.id)}
              />
              {item.name}
            </label>
          ))}
        </div>

        <button
          onClick={addProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Existing Products</h2>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="p-3 bg-gray-100 rounded">
              <strong>{p.name}</strong>
              <div className="text-sm text-gray-600 mt-1">
                Ingredients:{" "}
                {p.ingredients?.map((ing) => {
                  const inv = inventory.find((i) => i.id === ing.inventory_id);
                  return inv ? inv.name : "Unknown";
                }).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
