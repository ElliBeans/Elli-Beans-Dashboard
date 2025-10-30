export default async function handler(req, res) {
  try {
    const resp = await fetch("https://connect.squareupsandbox.com/v2/orders/search", {
      method: "POST",
      headers: {
        "Square-Version": "2023-10-18",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location_ids: [process.env.SQUARE_LOCATION_ID],
        query: { filter: { state_filter: { states: ["OPEN", "COMPLETED"] } } },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.errors?.[0]?.detail || "Square API error");

    res.status(200).json({ orders: data.orders || [] });
  } catch (err) {
    console.error("Error fetching Square orders:", err);
    res.status(500).json({ error: err.message });
  }
}
