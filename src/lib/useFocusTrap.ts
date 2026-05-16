/*
 * ATHENA - Student Success Platform
 * Section: FOCUS TRAP HOOK
 *
 * Traps keyboard focus inside a modal/dialog.
 * - Prevents Tab from escaping the modal
 * - Returns focus to the trigger element on close
 * - WCAG AA keyboard navigation requirement
 *
 * Usage:
 *   const modalRef = useRef<HTMLDivElement>(null);
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   useFocusTrap(modalRef, triggerRef, isOpen);
 */

import { useEffect, useRef, type RefObject } from 'react';

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  isActive: boolean
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Save the currently focused element (the trigger)
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element inside the modal
    const container = containerRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    // Trap Tab key within the modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to trigger element
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isActive, containerRef, triggerRef]);
}