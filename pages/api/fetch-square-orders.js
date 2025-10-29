import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://connect.squareup.com/v2/orders?location_id=${process.env.SQUARE_LOCATION_ID}`,
      {
        headers: {
          "Square-Version": "2023-09-20",
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const orders = data.orders || [];

    // Insert new orders into Supabase
    for (let order of orders) {
      const { id, line_items } = order;

      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (!existing) {
        const items_detail = line_items.map((item) => ({
          id: item.catalog_object_id,
          name: item.name,
        }));

        await supabase.from("orders").insert([
          {
            id,
            customer_name: order.customer_id || "Guest",
            items: items_detail.map((i) => i.id),
            items_detail,
            status: "Pending",
          },
        ]);
      }
    }

    res.status(200).json({ message: "Orders synced!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
