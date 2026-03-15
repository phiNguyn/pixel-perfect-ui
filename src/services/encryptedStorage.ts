import CryptoJS from "crypto-js";

const SECRET_KEY = "Kx9mQ2wR8pL5vN3t";

// Custom encrypted storage
export const encryptedStorage = {
  getItem: (name: string): string | null => {
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
    try {
      const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error("Encryption failed:", error);
    }
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};
