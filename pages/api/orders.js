import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    // Fetch orders from production Square
    const resp = await fetch("https://connect.squareup.com/v2/orders/search", {
      method: "POST",
      headers: {
        "Square-Version": "2023-10-18",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location_ids: [process.env.SQUARE_LOCATION_ID],
        query: {
          filter: { state_filter: { states: ["OPEN", "COMPLETED"] } },
        },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.errors?.[0]?.detail || "Square API error");

    const orders = data.orders || [];

    // Insert new orders into Supabase
    for (let order of orders) {
      const { id, line_items, created_at } = order;

      // Skip if already exists
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (!existing) {
        const items_detail = (line_items || []).map((item) => ({
          name: item.name,
          quantity: item.quantity ? parseFloat(item.quantity) : 1,
        }));

        await supabase.from("orders").insert([
          {
            id,
            name: order.customer_id || "Guest",
            ingredients: JSON.stringify(items_detail),
            created_at,
          },
        ]);
      }
    }

    // Return all orders from Supabase
    const { data: supabaseOrders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ orders: supabaseOrders });
  } catch (err) {
    console.error("Error fetching/inserting orders:", err);
    res.status(500).json({ error: err.message });
  }
}
