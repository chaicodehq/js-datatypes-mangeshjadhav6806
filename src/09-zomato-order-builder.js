/**
 * 🍕 Zomato Order Builder
 *
 * Zomato jaisa order summary banana hai! Cart mein items hain (with quantity
 * aur addons), ek optional coupon code hai, aur tujhe final bill banana hai
 * with itemwise breakdown, taxes, delivery fee, aur discount.
 *
 * Rules:
 *   - cart is array of items:
 *     [{ name: "Butter Chicken", price: 350, qty: 2, addons: ["Extra Butter:50", "Naan:40"] }, ...]
 *   - Each addon string format: "AddonName:Price" (split by ":" to get price)
 *   - Per item total = (price + sum of addon prices) * qty
 *   - Calculate:
 *     - items: array of { name, qty, basePrice, addonTotal, itemTotal }
 *     - subtotal: sum of all itemTotals
 *     - deliveryFee: Rs 30 if subtotal < 500, Rs 15 if 500-999, FREE (0) if >= 1000
 *     - gst: 5% of subtotal, rounded to 2 decimal places parseFloat(val.toFixed(2))
 *     - discount: based on coupon (see below)
 *     - grandTotal: subtotal + deliveryFee + gst - discount (minimum 0, use Math.max)
 *     - Round grandTotal to 2 decimal places
 *
 *   Coupon codes (case-insensitive):
 *     - "FIRST50"  => 50% off subtotal, max Rs 150 (use Math.min)
 *     - "FLAT100"  => flat Rs 100 off
 *     - "FREESHIP" => delivery fee becomes 0 (discount = original delivery fee value)
 *     - null/undefined/invalid string => no discount (0)
 *
 *   - Items with qty <= 0 ko skip karo
 *   - Hint: Use map(), reduce(), filter(), split(), parseFloat(),
 *     toFixed(), Math.max(), Math.min(), toLowerCase()
 *
 * Validation:
 *   - Agar cart array nahi hai ya empty hai, return null
 *
 * @param {Array<{ name: string, price: number, qty: number, addons?: string[] }>} cart
 * @param {string} [coupon] - Optional coupon code
 * @returns {{ items: Array<{ name: string, qty: number, basePrice: number, addonTotal: number, itemTotal: number }>, subtotal: number, deliveryFee: number, gst: number, discount: number, grandTotal: number } | null}
 *
 * @example
 *   buildZomatoOrder([{ name: "Biryani", price: 300, qty: 1, addons: ["Raita:30"] }], "FLAT100")
 *   // subtotal: 330, deliveryFee: 30, gst: 16.5, discount: 100
 *   // grandTotal: 330 + 30 + 16.5 - 100 = 276.5
 *
 *   buildZomatoOrder([{ name: "Pizza", price: 500, qty: 2, addons: [] }], "FIRST50")
 *   // subtotal: 1000, deliveryFee: 0, gst: 50, discount: min(500, 150) = 150
 *   // grandTotal: 1000 + 0 + 50 - 150 = 900
 */
export function buildZomatoOrder(cart, coupon) {
  // Your code here
  // ==========================
  // Step 1: Validation
  // ==========================
  // If cart is not an array OR it is empty,
  // return null as mentioned in the question.
  if (!Array.isArray(cart) || cart.length === 0) {
    return null;
  }

  // ==========================
  // Step 2: Remove invalid items
  // ==========================
  // Keep only those items whose quantity is greater than 0.
  const validItems = cart.filter(item => item.qty > 0);

  // ==========================
  // Step 3: Build item summary
  // ==========================
  const items = validItems.map(item => {

    // Calculate total price of all addons.
    // Example:
    // ["Extra Cheese:50", "Coke:40"]
    // becomes 90
    const addonTotal = (item.addons || []).reduce((sum, addon) => {

      // Split "Extra Cheese:50"
      // Result -> ["Extra Cheese", "50"]
      const parts = addon.split(":");

      // Convert "50" into number.
      // If invalid, use 0.
      const addonPrice = parseFloat(parts[1]) || 0;

      // Add current addon price to running total.
      return sum + addonPrice;

    }, 0);

    // Formula given in question
    // (Base Price + Addon Total) × Quantity
    const itemTotal = (item.price + addonTotal) * item.qty;

    // Return object for this item
    return {
      name: item.name,
      qty: item.qty,
      basePrice: item.price,
      addonTotal: addonTotal,
      itemTotal: itemTotal
    };
  });

  // ==========================
  // Step 4: Calculate subtotal
  // ==========================
  // Add all item totals together.
  const subtotal = items.reduce((sum, item) => {
    return sum + item.itemTotal;
  }, 0);

  // ==========================
  // Step 5: Calculate Delivery Fee
  // ==========================
  let deliveryFee = 0;

  if (subtotal < 500) {
    deliveryFee = 30;
  }
  else if (subtotal < 1000) {
    deliveryFee = 15;
  }
  else {
    // FREE delivery
    deliveryFee = 0;
  }

  // ==========================
  // Step 6: Calculate GST
  // ==========================
  // GST = 5% of subtotal
  // Rounded to 2 decimal places.
  const gst = parseFloat((subtotal * 0.05).toFixed(2));

  // ==========================
  // Step 7: Apply Coupon
  // ==========================
  let discount = 0;

  // Coupon should be a string
  if (typeof coupon === "string") {

    // Convert to lowercase
    // FIRST50 -> first50
    const code = coupon.toLowerCase();

    // FIRST50 Coupon
    if (code === "first50") {

      // 50% discount
      const halfPrice = subtotal * 0.5;

      // Maximum discount allowed = 150
      discount = Math.min(halfPrice, 150);
    }

    // FLAT100 Coupon
    else if (code === "flat100") {
      discount = 100;
    }

    // FREESHIP Coupon
    else if (code === "freeship") {

      // Discount equals delivery fee.
      discount = deliveryFee;

      // Delivery becomes free.
      deliveryFee = 0;
    }

    // Invalid coupon
    // discount remains 0.
  }

  // ==========================
  // Step 8: Calculate Grand Total
  // ==========================
  // Formula:
  // subtotal + delivery + gst - discount

  const grandTotal = parseFloat(
    Math.max(
      subtotal + deliveryFee + gst - discount,
      0 // Grand total should never be negative
    ).toFixed(2)
  );

  // ==========================
  // Step 9: Return final object
  // ==========================
  return {
    items,
    subtotal,
    deliveryFee,
    gst,
    discount,
    grandTotal
  };
}
