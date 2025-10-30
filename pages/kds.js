import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*");
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
    setLoading(false);
  };

  // Fetch low-stock items
  const fetchLowStock = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .lte("quantity", "min_quantity"); // quantity <= min_quantity
    if (error) console.error("Error fetching low-stock items:", error);
    else setLowStockItems(data);
  };

  // Poll orders and low-stock items every 5 seconds
  useEffect(() => {
    fetchOrders();
    fetchLowStock();

    const interval = setInterval(() => {
      fetchOrders();
      fetchLowStock();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Deduct inventory based on order items
  const deductInventory = async (order) => {
    try {
      for (let itemId of order.items) {
        // Get the product/recipe
        const { data: productData } = await supabase
          .from("products")
          .select("*")
          .eq("id", itemId)
          .single();

        if (!productData) continue;

        // Deduct each ingredient
        for (let ingredient of productData.ingredients) {
          const { data: invData } = await supabase
            .from("inventory")
            .select("*")
            .eq("id", ingredient.inventory_id)
            .single();

          if (!invData) continue;

          await supabase
            .from("inventory")
            .update({ quantity: invData.quantity - ingredient.amount })
            .eq("id", ingredient.inventory_id);
        }
      }
    } catch (error) {
      console.error("Error deducting inventory:", error);
    }
  };

  // Update order status & deduct inventory if Complete
  const updateStatus = async (id, newStatus) => {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (!order) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) console.error("Error updating status:", error);
    else {
      if (newStatus === "Complete") await deductInventory(order);
      fetchOrders();
      fetchLowStock(); // refresh low-stock alerts after inventory deduction
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">KDS / Orders</h1>

      {/* Low-stock alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="font-bold text-red-700 mb-2">⚠️ Low Stock Alerts</h2>
          <ul>
            {lowStockItems.map((item) => (
              <li key={item.id}>
                {item.name}: {item.quantity} left
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{order.customer_name || "Guest"}</p>
                <p>
                  Items:{" "}
                  {order.items
                    .map(
                      (id) =>
                        order.items_detail.find((i) => i.id === id)?.name ||
                        "Unknown"
                    )
                    .join(", ")}
                </p>
              </div>
              <div className="flex space-x-2">
                <p className="mr-2">Status: {order.status || "Pending"}</p>
                {order.status !== "In Progress" && (
                  <button
                    onClick={() => updateStatus(order.id, "In Progress")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Start
                  </button>
                )}
                {order.status !== "Complete" && (
                  <button
                    onClick={() => updateStatus(order.id, "Complete")}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Complete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
