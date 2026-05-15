import {
  isHat,
  isMessageLanguage,
  type HatValue,
  type MessageLanguage,
  type SenderGender,
} from './persona';

const LINK_STORAGE_KEY = 'soraya:givechak-link';
const SENDER_GENDER_KEY = 'soraya:sender-gender';
const HAT_STORAGE_KEY = 'soraya:hat';
const PERSONAL_CONNECTION_KEY = 'soraya:personal-connection';
const MESSAGE_LANGUAGE_KEY = 'soraya:message-language';

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

export function readSavedHat(): HatValue | null {
  try {
    const raw = window.localStorage.getItem(HAT_STORAGE_KEY);
    if (raw && isHat(raw)) return raw;
    return null;
  } catch {
    return null;
  }
}

export function persistHat(value: HatValue) {
  try {
    window.localStorage.setItem(HAT_STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function readSavedPersonalConnection(): string {
  try {
    return window.localStorage.getItem(PERSONAL_CONNECTION_KEY) ?? '';
  } catch {
    return '';
  }
}

export function persistPersonalConnection(value: string) {
  try {
    if (value.trim()) {
      window.localStorage.setItem(PERSONAL_CONNECTION_KEY, value);
    } else {
      window.localStorage.removeItem(PERSONAL_CONNECTION_KEY);
    }
  } catch {
    // ignore
  }
}

export function readSavedMessageLanguage(): MessageLanguage | null {
  try {
    const raw = window.localStorage.getItem(MESSAGE_LANGUAGE_KEY);
    if (raw && isMessageLanguage(raw)) return raw;
    return null;
  } catch {
    return null;
  }
}

export function persistMessageLanguage(value: MessageLanguage) {
  try {
    window.localStorage.setItem(MESSAGE_LANGUAGE_KEY, value);
  } catch {
    // ignore
  }
}
