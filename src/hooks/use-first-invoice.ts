"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "mirqolyzer_first_invoice_celebrated";

export function useFirstInvoice() {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const alreadyCelebrated = localStorage.getItem(STORAGE_KEY);
    if (alreadyCelebrated) return false;

    localStorage.setItem(STORAGE_KEY, "true");
    setShowConfetti(true);
    return true;
  }, []);

  const dismiss = useCallback(() => {
    setShowConfetti(false);
  }, []);

  return { showConfetti, triggerConfetti, dismiss };
}
