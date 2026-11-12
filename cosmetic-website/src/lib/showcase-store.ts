import { useMemo, useSyncExternalStore } from "react";
import type { Palette } from "./palette";

export type Showcase = {
  id: string;
  name: string;
  imageDataUrl: string; // transparent PNG as data URL (prototype only)
  palette: Palette;
  approvedAt: string;
};

const KEY = "cosmetic-showcases";
const EVENT = "showcases-changed";

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveShowcase(item: Showcase): boolean {
  try {
    const list: Showcase[] = JSON.parse(readRaw() || "[]");
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 5)));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false; // storage full or blocked
  }
}

export function clearShowcases() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useApprovedShowcases(): Showcase[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as Showcase[]) : [];
    } catch {
      return [];
    }
  }, [raw]);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}