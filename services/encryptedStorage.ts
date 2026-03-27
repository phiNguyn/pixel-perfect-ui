import CryptoJS from "crypto-js";

const SECRET_KEY = "Kx9mQ2wR8pL5vN3t";

// Custom encrypted storage
export const encryptedStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const encrypted = localStorage.getItem(name);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedStr) return null;

      return decryptedStr;
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error("Encryption failed:", error);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};
