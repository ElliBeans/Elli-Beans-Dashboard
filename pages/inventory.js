import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [par, setPar] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch inventory from Supabase
  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("inventory").select("*");
    if (error) console.error("Error fetching inventory:", error);
    else setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Add new inventory item
  const addItem = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("inventory").insert([
      {
        name,
        quantity: Number(quantity),
        par_level: Number(par),     // ✅ FIXED
        cost: Number(cost),
      },
    ]);

    if (error) {
      console.error("Error adding item:", error);
    } else {
      setName("");
      setQuantity("");
      setPar("");
      setCost("");
      fetchInventory();
    }
  };

  // Update quantity
  const updateQuantity = async (id, newQty) => {
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: Number(newQty) })
      .eq("id", id);

    if (error) console.error("Error updating quantity:", error);
    else fetchInventory();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>

      {/* Add Item Form */}
      <form
        onSubmit={addItem}
        className="mb-6 p-4 bg-white rounded shadow space-y-3 max-w-md"
      >
        <h2 className="font-semibold text-lg">Add New Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Par Level"
          value={par}
          onChange={(e) => setPar(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </form>

      {/* Inventory List */}
      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Par Level</th>
              <th className="p-2">Cost</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.name}</td>

                {/* Quantity Editable */}
                <td className="p-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, e.target.value)
                    }
                    className="w-16 p-1 border rounded"
                  />
                </td>

                {/* ✅ FIXED: par_level */}
                <td className="p-2">{item.par_level}</td>

                <td className="p-2">${Number(item.cost).toFixed(2)}</td>

                <td className="p-2">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
