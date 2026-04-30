declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: GoogleButtonConfig
          ) => void;
          revoke: (hint: string, callback: (response: GoogleRevokeResponse) => void) => void;
        };
      };
    };
  }
}

export interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
  state_cookie_domain?: string;
  prompt_parent_id?: string;
  nonce?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  client_id: string;
}

export interface GooglePromptNotification {
  isNotDisplayed?: string;
  isSkippedMoment?: string;
  notCreated?: string;
}

export interface GoogleButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  local?: string;
}

export interface GoogleRevokeResponse {
  successful?: boolean;
  error?: string;
}

let googleScriptLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (googleScriptLoaded && window.google) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Identity Services script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function initializeGoogleSignIn(
  clientId: string,
  callback: (credential: string) => void,
  options?: {
    autoSelect?: boolean;
    cancelOnTapOutside?: boolean;
    promptParentId?: string;
  }
): void {
  if (!window.google) {
    console.error("Google Identity Services not loaded");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => {
      callback(response.credential);
    },
    auto_select: options?.autoSelect ?? false,
    cancel_on_tap_outside: options?.cancelOnTapOutside ?? true,
    prompt_parent_id: options?.promptParentId,
  });
}

export function renderGoogleButton(
  element: HTMLElement,
  options?: GoogleButtonConfig
): void {
  if (!window.google) {
    console.error("Google Identity Services not loaded");
    return;
  }

  window.google.accounts.id.renderButton(element, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "rectangular",
    logo_alignment: "left",
    ...options,
  });
}

export function triggerGooglePrompt(): void {
  if (!window.google) {
    console.error("Google Identity Services not loaded");
    return;
  }

  window.google.accounts.id.prompt();
}

export function revokeGoogleToken(
  hint: string,
  callback: (response: GoogleRevokeResponse) => void
): void {
  if (!window.google) {
    console.error("Google Identity Services not loaded");
    return;
  }

  window.google.accounts.id.revoke(hint, callback);
}
