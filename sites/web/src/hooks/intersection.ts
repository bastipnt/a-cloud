import { RefObject, useEffect } from "react";

export const useIntersection = (
  targetRef: RefObject<HTMLElement | null>,
  callbackFn: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) => {
  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new IntersectionObserver(callbackFn, options);

    observer.observe(targetRef.current);

    return () => {
      if (targetRef.current) observer.unobserve(targetRef.current);
    };
  }, [targetRef.current]);
};
