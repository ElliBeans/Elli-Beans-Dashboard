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

    // Optional: Poll every 5 seconds for new orders
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

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
              className="p-4 bg-white rounded shadow flex justify-between"
            >
              <div>
                <p className="font-semibold">{order.customer_name || "Guest"}</p>
                <p>
                  Items:{" "}
                  {order.items
                    .map(
                      (id) =>
                        order.items_detail.find((i) => i.id === id)?.name || "Unknown"
                    )
                    .join(", ")}
                </p>
              </div>
              <div>
                <p>Status: {order.status || "Pending"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
