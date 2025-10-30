import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [lastCheck, setLastCheck] = useState(new Date().toISOString());

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchInventory();
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // check every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error loading products:", error);
    else setProducts(data || []);
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase.from("inventory").select("*");
    if (error) console.error("Error loading inventory:", error);
    else setInventory(data || []);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders"); // our proxy endpoint for Square
      const data = await res.json();
      if (data.orders && data.orders.length > 0) {
        const newOrders = data.orders.filter(
          (o) => new Date(o.created_at) > new Date(lastCheck)
        );
        if (newOrders.length > 0) {
          handleNewOrders(newOrders);
          setOrders((prev) => [...newOrders, ...prev]);
          setLastCheck(new Date().toISOString());
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleNewOrders = async (newOrders) => {
    for (let order of newOrders) {
      for (let item of order.line_items || []) {
        const product = products.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase()
        );
        if (product && product.ingredients) {
          for (let ing of product.ingredients) {
            const invItem = inventory.find((i) => i.id === ing.inventory_id);
            if (invItem) {
              const newQty = invItem.quantity - ing.amount;
              await supabase
                .from("inventory")
                .update({ quantity: newQty })
                .eq("id", invItem.id);

              if (newQty <= invItem.par_level) {
                console.warn(`⚠️ ${invItem.name} is below par!`);
              }
            }
          }
        }
      }
    }
    fetchInventory(); // refresh inventory after deductions
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kitchen Display System</h1>
      <p className="text-gray-600 mb-4">
        Automatically updates inventory when new orders come in.
      </p>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">Order #{order.id}</h2>
            <ul className="mt-2 list-disc pl-5">
              {order.line_items?.map((item, idx) => (
                <li key={idx}>{item.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
