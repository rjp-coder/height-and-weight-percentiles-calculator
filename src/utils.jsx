import { useRef } from "react";

function useDebounce(cb, delay) {
  const timeoutId = useRef();

  return function (...args) {
    if (timeoutId.current) {
      // This check is not strictly necessary
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => cb(...args), delay);
  };
}
export { useDebounce };
