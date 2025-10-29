import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*");
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) console.error("Error updating status:", error);
    else fetchOrders();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">KDS / Orders</h1>

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
