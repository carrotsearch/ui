import { useCallback, useRef } from "react";

/**
 * Captures a reference to an element and exposes a method for resetting its scrollbar.
 */
export const useScrollReset = () => {
  const container = useRef(undefined);
  const scrollReset = useCallback(() => {
    if (container.current) {
      container.current.scrollTop = 0;
    }
  }, []);
  return { container, scrollReset };
};
