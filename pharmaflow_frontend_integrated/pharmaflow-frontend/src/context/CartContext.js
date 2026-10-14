import { createContext, useCallback, useContext, useEffect, useState } from "react";
import cartService from "../services/cartService";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = useCallback(async () => {
    try {
      const items = await cartService.getCart();
      setCartItems(items);
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export default function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
