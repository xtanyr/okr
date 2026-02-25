// Safe localStorage utilities with error handling

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

export const safeParseJSON = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing JSON for ${key} from localStorage:`, error);
    // Clear corrupted data
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error(`Error removing corrupted ${key} from localStorage:`, removeError);
    }
    return null;
  }
};

export const safeStringifyJSON = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error stringifying JSON for ${key} in localStorage:`, error);
  }
};
