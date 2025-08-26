import { useEffect, useMemo, useState } from 'react';

// Returns a changing key whenever the window size changes (debounced)
export default function useResizeKey(debounceMs = 150) {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    let raf = null;
    let t = null;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          setSize({ w: window.innerWidth, h: window.innerHeight });
        });
      }, debounceMs);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (t) clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [debounceMs]);

  return useMemo(() => `${size.w}x${size.h}`, [size.w, size.h]);
}


