import type { SenderGender } from './persona';

const LINK_STORAGE_KEY = 'soraya:givechak-link';
const SENDER_GENDER_KEY = 'soraya:sender-gender';

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

export function readSavedSenderGender(): SenderGender | null {
  try {
    const raw = window.localStorage.getItem(SENDER_GENDER_KEY);
    if (raw === 'male' || raw === 'female') return raw;
    return null;
  } catch {
    return null;
  }
}

export function persistSenderGender(value: SenderGender | null) {
  try {
    if (value === 'male' || value === 'female') {
      window.localStorage.setItem(SENDER_GENDER_KEY, value);
    } else {
      window.localStorage.removeItem(SENDER_GENDER_KEY);
    }
  } catch {
    // ignore
  }
}
