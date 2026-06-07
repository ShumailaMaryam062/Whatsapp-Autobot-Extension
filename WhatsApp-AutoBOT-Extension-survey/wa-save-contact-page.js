"use strict";
(() => {
  // src/content/wa-save-contact-page.ts
  (function() {
    const ATTR = "data-smartdm-wa-save-contact";
    const EVT = "smartdm-wa-save-contact-result";
    const enc = document.documentElement.getAttribute(ATTR);
    if (!enc)
      return;
    document.documentElement.removeAttribute(ATTR);
    let payload;
    try {
      payload = JSON.parse(decodeURIComponent(escape(atob(enc))));
    } catch {
      return;
    }
    const requestId = payload.requestId || "";
    function done(success, error) {
      window.dispatchEvent(
        new CustomEvent(EVT, {
          detail: { requestId, success, error: error || void 0 }
        })
      );
    }
    const phoneNumber = (payload.phoneNumber || "").replace(/\D/g, "");
    if (!phoneNumber || phoneNumber.length < 8) {
      done(false, "Invalid phoneNumber");
      return;
    }
    void async function() {
      try {
        const req = window.require;
        if (typeof req !== "function") {
          done(false, "window.require is not available");
          return;
        }
        const Save = req("WAWebSaveContactAction");
        if (!Save?.saveContactAction) {
          done(false, "saveContactAction missing (WA build mismatch)");
          return;
        }
        const firstName = typeof payload.firstName === "string" ? payload.firstName : "SmartDM";
        const lastName = typeof payload.lastName === "string" ? payload.lastName : "";
        const syncToAddressbook = payload.syncToAddressbook !== false;
        await Save.saveContactAction({
          firstName,
          lastName,
          phoneNumber,
          prevPhoneNumber: phoneNumber,
          syncToAddressbook,
          username: void 0
        });
        done(true);
      } catch (e) {
        done(false, e instanceof Error ? e.message : String(e));
      }
    }();
  })();
})();
