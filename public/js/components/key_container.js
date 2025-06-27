/**
 * Registration Key Container Component
 * Handles the display, generation, and visibility toggling of registration keys
 */
class KeyContainer {
  constructor() {
    this.keyContainer = document.querySelector(".key-container");
    this.keyDisplay = document.querySelector(".key-display");
    this.keyStatus = document.getElementById("key_status");
    this.textWrapper = null;
    this.visibilityBtn = document.getElementById("visibility");
    this.generateBtn = document.getElementById("generate_key");
    this.visibilityIcon = this.visibilityBtn.querySelector("i");
    this.isVisible = false;
    this.currentKey = null;
    this.toastQueue = new Set();
    this.maxToasts = 3;

    this.init();
    this.initToastContainer();
  }

  /**
   * Initialize toast notification container
   */
  initToastContainer() {
    if (document.querySelector(".toast-container")) return;
    
    const toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = "success", duration = 3000) {
    if (this.toastQueue.size >= this.maxToasts) {
      const oldestToast = this.toastQueue.values().next().value;
      this.removeToast(oldestToast);
    }

    const toastContainer = document.querySelector(".toast-container");
    const toast = document.createElement("div");
    this.toastQueue.add(toast);

    const baseStyles = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      margin-bottom: 12px;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      min-width: 320px;
      max-width: 400px;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      cursor: pointer;
    `;

    const typeStyles = {
      success: "background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);",
      error: "background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);",
      info: "background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);",
      warning: "background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);",
    };

    toast.style.cssText = baseStyles + (typeStyles[type] || typeStyles.success);

    const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };

    toast.innerHTML = `
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        font-size: 12px;
        font-weight: bold;
      ">${icons[type] || icons.success}</span>
      <span style="flex: 1;">${message}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)";
    });

    const removeToastHandler = () => this.removeToast(toast);
    toast.addEventListener("click", removeToastHandler);
    setTimeout(removeToastHandler, duration);

    return toast;
  }

  /**
   * Remove toast notification with proper cleanup
   */
  removeToast(toast) {
    if (!toast || !this.toastQueue.has(toast)) return;

    this.toastQueue.delete(toast);
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Load existing registration key from the server
   */
  async loadExistingKey() {
    try {
      const response = await fetch("/api/reg-key");

      if (!response.ok) {
        throw new Error(`Failed to fetch key: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.key) {
        this.setKey(data.key);
        this.hideKey();
      } else {
        this.setKey(null);
        this.showKey();
      }
    } catch (error) {
      console.error("Error fetching registration key:", error);
      this.setKey(null);
      this.showKey();
    }
  }
  /**
   * Initialize component - set up event listeners and load existing key
   */
  init() {
    this.bindEvents();
    this.setInitialState();
    this.loadExistingKey();
  }

  /**
   * Bind event listeners to UI elements
   */
  bindEvents() {
    this.visibilityBtn.addEventListener("click", () => this.toggleVisibility());
    this.generateBtn.addEventListener("click", () => this.generateNewKey());

    this.textWrapper = this.keyStatus.querySelector(".textWrapper");
    if (this.textWrapper) {
      this.textWrapper.addEventListener("click", () => this.copyToClipboard());
    }
  }

  /**
   * Set initial UI state
   */
  setInitialState() {
    // Initial state will be set after loading existing key
  }

  /**
   * Set the current key and update the display
   */
  setKey(key) {
    this.currentKey = key;

    if (!this.textWrapper) {
      this.textWrapper = this.keyStatus.querySelector(".textWrapper");
      if (!this.textWrapper) {
        this.textWrapper = document.createElement("span");
        this.textWrapper.className = "textWrapper";
        this.keyStatus.innerHTML = "";
        this.keyStatus.appendChild(this.textWrapper);
        this.textWrapper.addEventListener("click", () => this.copyToClipboard());
      }
    }

    this.textWrapper.textContent = key || "No key generated";
  }

  /**
   * Toggle key visibility
   */
  toggleVisibility() {
    this.isVisible ? this.hideKey() : this.showKey();
  }

  /**
   * Show the registration key
   */
  showKey() {
    this.keyStatus.style.filter = "none";
    this.isVisible = true;
    this.updateVisibilityIcon("bi bi-eye", "white", "Hide");
  }

  /**
   * Hide the registration key
   */
  hideKey() {
    if (!this.currentKey) return;
    
    this.keyStatus.style.filter = "blur(4px)";
    this.isVisible = false;
    this.updateVisibilityIcon("bi bi-eye-slash-fill", "red", "Show");
  }

  /**
   * Update visibility icon appearance
   */
  updateVisibilityIcon(className, color, title) {
    this.visibilityIcon.className = className;
    this.visibilityIcon.style.color = color;
    this.visibilityBtn.title = title;
  }

  /**
   * Generate a new registration key
   */
  async generateNewKey() {
    try {
      if (this.currentKey) {
        this.hideKey();
      }

      const response = await fetch("/api/reg-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate key: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.key) {
        this.setKey(data.key);
        this.hideKey();
      } else {
        throw new Error(data.error || "Failed to generate key");
      }
    } catch (error) {
      console.error("Error generating new key:", error);
      if (this.textWrapper) {
        this.textWrapper.textContent = "Error generating key";
      }
    }
  }

  /**
   * Copy the current key to clipboard
   */
  async copyToClipboard() {
    if (!this.currentKey) {
      this.showToast("No key available to copy", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(this.currentKey);
      this.showToast("Registration key copied to clipboard", "success");
    } catch (err) {
      try {
        this.fallbackCopyToClipboard(this.currentKey);
        this.showToast("Registration key copied to clipboard", "success");
      } catch (fallbackErr) {
        console.error("Failed to copy to clipboard:", fallbackErr);
        this.showToast("Failed to copy key to clipboard", "error");
      }
    }
  }

  /**
   * Fallback method for copying to clipboard in older browsers
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      opacity: 0;
      pointer-events: none;
    `;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (!successful) {
      throw new Error("Fallback copy method failed");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new KeyContainer();
});
