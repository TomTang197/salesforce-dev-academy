import { RefObject, useEffect } from 'react';

/** Modern Web Guidance: light-dismiss fallback for browsers without <dialog closedby>. */
export function useLightDismissFallback(ref: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    const handleClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    };
    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
  }, [ref]);
}
