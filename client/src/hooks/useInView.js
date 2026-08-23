import { useEffect, useRef, useState } from "react";

// Returns a ref to attach to any element, and whether it's currently
// in the viewport. Used to trigger fade/slide-in animations on scroll
// without pulling in an animation library.
export const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el); // only animate in once
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};
