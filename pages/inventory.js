import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [par, setPar] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch
