"use strict";
(() => {
  // src/utils/extension-debug.ts
  var EXTENSION_VERBOSE_LOGS = false;
  function extLog(...args) {
    if (EXTENSION_VERBOSE_LOGS)
      console.log(...args);
  }

  // src/content/auth-bridge.ts
  extLog("[SmartDM Auth Bridge] Initializing...");
  var ALLOWED_ORIGINS = [
    "https://birthday.agent0s.dev",
    "https://birthday.agent0s.dev"
  ];
  function isAllowedOrigin(origin) {
    return ALLOWED_ORIGINS.includes(origin);
  }
  window.addEventListener("message", async (event) => {
    if (!isAllowedOrigin(event.origin)) {
      console.warn("[Auth Bridge] Blocked message from unauthorized origin:", event.origin);
      return;
    }
    if (event.data.type === "SMARTDM_AUTH_SUCCESS") {
      extLog("[Auth Bridge] \u{1F4E8} Received auth from website");
      const { accessToken, refreshToken, user, workspace } = event.data.payload;
      if (!accessToken || !user || !workspace) {
        console.error("[Auth Bridge] \u274C Invalid auth payload");
        return;
      }
      try {
        await chrome.storage.local.set({
          accessToken,
          refreshToken,
          user,
          workspace,
          lastSync: Date.now(),
          authSource: "website"
        });
        extLog("[Auth Bridge] \u2705 Extension authenticated successfully");
        extLog("[Auth Bridge] \u{1F464} User:", user.name);
        extLog("[Auth Bridge] \u{1F4CA} Plan:", workspace?.plan?.name);
        chrome.runtime.sendMessage({
          type: "AUTH_SYNCED",
          payload: { user, workspace }
        }).catch((err) => {
          console.warn("[Auth Bridge] Background script not ready:", err);
        });
        showSuccessNotification(user.name, workspace?.plan?.name);
      } catch (error) {
        console.error("[Auth Bridge] \u274C Failed to save auth:", error);
        showErrorNotification("Failed to sync authentication");
      }
    }
    if (event.data.type === "SMARTDM_REQUEST_AUTH_SNAPSHOT") {
      try {
        const data = await chrome.storage.local.get([
          "accessToken",
          "refreshToken",
          "user",
          "workspace"
        ]);
        const hasAuth = !!(data.accessToken && data.user && data.workspace);
        window.postMessage({
          type: "SMARTDM_AUTH_SNAPSHOT",
          payload: hasAuth ? {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || "",
            user: data.user,
            workspace: data.workspace
          } : null
        }, window.location.origin);
      } catch (error) {
        window.postMessage({
          type: "SMARTDM_AUTH_SNAPSHOT",
          payload: null,
          error: String(error)
        }, window.location.origin);
      }
      return;
    }
    if (event.data.type === "SMARTDM_LOGOUT") {
      extLog("[Auth Bridge] \u{1F4E8} Received logout from website");
      try {
        await chrome.storage.local.clear();
        extLog("[Auth Bridge] \u2705 Extension logged out");
        showInfoNotification("Logged out successfully");
      } catch (error) {
        console.error("[Auth Bridge] \u274C Failed to logout:", error);
      }
    }
    if (event.data.type === "SMARTDM_AICONFIG_PATCH" && event.data.source === "smartdm-crm") {
      const patch = event.data.payload?.aiConfig;
      if (!patch || typeof patch !== "object")
        return;
      try {
        const data = await chrome.storage.local.get(["aiConfig"]);
        const base = data.aiConfig && typeof data.aiConfig === "object" ? { ...data.aiConfig } : {};
        await chrome.storage.local.set({ aiConfig: { ...base, ...patch } });
        extLog("[Auth Bridge] aiConfig merged from web CRM (for WhatsApp extension)");
      } catch (error) {
        console.error("[Auth Bridge] \u274C aiConfig merge failed:", error);
      }
      return;
    }
    if (event.data.type === "SMARTDM_STATS_UPDATE") {
      extLog("[Auth Bridge] \u{1F4CA} Received stats update from website");
      try {
        const currentData = await chrome.storage.local.get(["workspace"]);
        if (currentData.workspace) {
          currentData.workspace.stats = event.data.payload;
          await chrome.storage.local.set({ workspace: currentData.workspace });
          extLog("[Auth Bridge] \u2705 Stats updated");
        }
      } catch (error) {
        console.error("[Auth Bridge] \u274C Failed to update stats:", error);
      }
    }
  });
  function showSuccessNotification(userName, planName = "Free") {
    const notification = createNotification(
      "\u2705 SmartDM Ready!",
      `Welcome ${userName}! Plan: ${planName}`,
      "success"
    );
    document.body.appendChild(notification);
    removeNotificationAfterDelay(notification, 4e3);
  }
  function showErrorNotification(message) {
    const notification = createNotification(
      "\u274C Error",
      message,
      "error"
    );
    document.body.appendChild(notification);
    removeNotificationAfterDelay(notification, 3e3);
  }
  function showInfoNotification(message) {
    const notification = createNotification(
      "\u2139\uFE0F SmartDM",
      message,
      "info"
    );
    document.body.appendChild(notification);
    removeNotificationAfterDelay(notification, 2500);
  }
  function createNotification(title, message, type) {
    const notification = document.createElement("div");
    const colors = {
      success: "linear-gradient(135deg, #20B2AA, #4A9FD8)",
      error: "linear-gradient(135deg, #ff4444, #cc0000)",
      info: "linear-gradient(135deg, #667eea, #764ba2)"
    };
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    min-width: 280px;
    max-width: 400px;
    animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
    notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">${title}</div>
        <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">${message}</div>
      </div>
      <button 
        onclick="this.parentElement.parentElement.remove()" 
        style="
          background: rgba(255,255,255,0.2); 
          border: none; 
          color: white; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0;
        "
      >\xD7</button>
    </div>
  `;
    if (!document.getElementById("smartdm-notification-styles")) {
      const style = document.createElement("style");
      style.id = "smartdm-notification-styles";
      style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
      document.head.appendChild(style);
    }
    return notification;
  }
  function removeNotificationAfterDelay(notification, delay) {
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(400px)";
      notification.style.transition = "all 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, delay);
  }
  if (window.location.hostname.includes("birthday.agent0s.dev")) {
    extLog("[Auth Bridge] Checking for existing auth...");
    setTimeout(async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");
        const workspace = localStorage.getItem("workspace");
        if (accessToken && user && workspace) {
          extLog("[Auth Bridge] Found existing auth in localStorage");
          const extensionData = await chrome.storage.local.get(["accessToken"]);
          if (!extensionData.accessToken) {
            extLog("[Auth Bridge] Syncing auth to extension...");
            window.postMessage({
              type: "SMARTDM_AUTH_SUCCESS",
              payload: {
                accessToken,
                refreshToken: localStorage.getItem("refreshToken"),
                user: JSON.parse(user),
                workspace: JSON.parse(workspace)
              }
            }, window.location.origin);
          } else {
            extLog("[Auth Bridge] Extension already has auth");
          }
        }
      } catch (error) {
        console.error("[Auth Bridge] Failed to check existing auth:", error);
      }
    }, 1e3);
  }
  extLog("[SmartDM Auth Bridge] \u2705 Ready");
})();
