import { useEffect, useRef, useState } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);
  const direction = useRef("down");

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY.current) < 10) return;

      const newDirection = scrollY > lastScrollY.current ? "down" : "up";

      if (newDirection !== direction.current) {
        direction.current = newDirection;
        setScrollDirection(newDirection);
      }

      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, []);

  return scrollDirection;
}