export async function fetchInventoryBySku(sku) {
  if (!sku) return { stock_quantity: null };

  const res = await fetch(`https://fyvelondon.com/api/get_inventory.php?sku=${encodeURIComponent(sku)}`);

  if (!res.ok) {
    throw new Error(`Inventory request failed: ${res.status}`);
  }

  return res.json();
}