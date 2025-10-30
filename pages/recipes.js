import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", ingredients: [] });

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase.from("inventory").select("*");
    if (error) console.error("Error fetching inventory:", error);
    else setInventory(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchInventory();
  }, []);

  const addIngredient = () => {
    setNewProduct({ ...newProduct, ingredients: [...newProduct.ingredients, { inventory_id: "", amount: 0 }] });
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...newProduct.ingredients];
    updated[index][field] = value;
    setNewProduct({ ...newProduct, ingredients: updated });
  };

  const createProduct = async () => {
    const { data, error } = await supabase.from("products").insert([newProduct]);
    if (error) console.error("Error creating product:", error);
    else {
      setNewProduct({ name: "", price: "", ingredients: [] });
      fetchProducts();
    }
  };

  const calculateCOGS = (ingredients) => {
    let total = 0;
    for (let ing of ingredients) {
      const inv = inventory.find((i) => i.id === ing.inventory_id);
      if (inv) total += inv.cost * ing.amount;
    }
    return total.toFixed(2);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products / Recipes</h1>

      {/* Add New Product */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Add New Product</h2>
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-1 mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
          className="border p-1 mr-2"
        />
        <button
          onClick={addIngredient}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          + Ingredient
        </button>

        {newProduct.ingredients.map((ing, index) => (
          <div key={index} className="mt-2 flex space-x-2">
            <select
              value={ing.inventory_id}
              onChange={(e) => handleIngredientChange(index, "inventory_id", parseInt(e.target.value))}
              className="border p-1"
            >
              <option value="">Select Ingredient</option>
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={ing.amount}
              onChange={(e) => handleIngredientChange(index, "amount", parseFloat(e.target.value))}
              className="border p-1 w-20"
            />
          </div>
        ))}

        <button
          onClick={createProduct}
          className="mt-2 bg-green-500 text-white px-2 py-1 rounded"
        >
          Add Product
        </button>
      </div>

      {/* Product List */}
      <div>
        <h2 className="font-semibold mb-2">Existing Products</h2>
        <ul className="space-y-2">
          {products.map((prod) => (
            <li key={prod.id} className="p-2 bg-white rounded shadow flex justify-between">
              <span>
                {prod.name} — Price: ${prod.price} — COGS: ${calculateCOGS(prod.ingredients || [])}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
