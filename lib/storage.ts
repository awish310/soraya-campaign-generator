const LINK_STORAGE_KEY = 'soraya:givechak-link';

export function readSavedLink(): string {
  try {
    return window.localStorage.getItem(LINK_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function persistLink(value: string) {
  try {
    if (value) {
      window.localStorage.setItem(LINK_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(LINK_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private mode, quota) — silently skip
  }
}
