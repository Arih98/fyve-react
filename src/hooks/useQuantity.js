import { useEffect, useState } from "react";

export function useQuantity(resetKey) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [resetKey]);

  const increaseQuantity = (availableStock) => {
    if (availableStock === null || quantity < availableStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return {
    quantity,
    setQuantity,
    increaseQuantity,
    decreaseQuantity
  };
}