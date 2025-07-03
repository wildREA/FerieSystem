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

  initToastContainer() {
    if (document.querySelector(".toast-container")) return;
    
    const toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  showToast(message, type = "success", duration = 3000) {
    if (this.toastQueue.size >= this.maxToasts) {
      const oldestToast = this.toastQueue.values().next().value;
      this.removeToast(oldestToast);
    }

    const toastContainer = document.querySelector(".toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    this.toastQueue.add(toast);

    const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.success}</span>
      <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    const removeToastHandler = () => this.removeToast(toast);
    toast.addEventListener("click", removeToastHandler);
    setTimeout(removeToastHandler, duration);

    return toast;
  }

  removeToast(toast) {
    if (!toast || !this.toastQueue.has(toast)) return;

    this.toastQueue.delete(toast);
    toast.classList.add("hide");

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

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
  init() {
    this.bindEvents();
    this.setInitialState();
    this.loadExistingKey();
  }

  bindEvents() {
    this.visibilityBtn.addEventListener("click", () => this.toggleVisibility());
    this.generateBtn.addEventListener("click", () => this.generateNewKey());

    this.textWrapper = this.keyStatus.querySelector(".textWrapper");
    if (this.textWrapper) {
      this.textWrapper.addEventListener("click", () => this.copyToClipboard());
    }
  }

  setInitialState() {
    // Initial state will be set after loading existing key
  }

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

  toggleVisibility() {
    this.isVisible ? this.hideKey() : this.showKey();
  }

  showKey() {
    this.keyStatus.style.filter = "none";
    this.isVisible = true;
    this.updateVisibilityIcon("bi bi-eye", "white", "Hide");
  }

  hideKey() {
    if (!this.currentKey) { this.showCannotHideNotification(); return; }
    
    this.keyStatus.style.filter = "blur(4px)";
    this.isVisible = false;
    this.updateVisibilityIcon("bi bi-eye-slash-fill", "red", "Show");
  }

  showCannotHideNotification() {
    this.showToast("Cannot hide without a key", "error");
  }

  updateVisibilityIcon(className, color, title) {
    this.visibilityIcon.className = className;
    this.visibilityIcon.style.color = color;
    this.visibilityBtn.title = title;
  }

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
