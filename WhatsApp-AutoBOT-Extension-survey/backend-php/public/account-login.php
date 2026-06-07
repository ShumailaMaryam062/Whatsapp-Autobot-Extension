<?php
declare(strict_types=1);

$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$scriptDir = $scriptDir === '/' ? '' : rtrim($scriptDir, '/');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mr CRM Login</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    :root {
      --bg: #0b1020;
      --panel: #111a33;
      --panel-soft: #172447;
      --text: #f3f6ff;
      --muted: #a9b4d0;
      --accent: #29b77e;
      --accent-soft: #1f9f6e;
      --danger-bg: #4a1f2b;
      --danger-text: #ffd2df;
      --ok-bg: #1b4a3c;
      --ok-text: #d4ffe9;
      --line: #223459;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      color: var(--text);
      background:
        radial-gradient(1200px 700px at 0% -10%, #1a3c7a55, transparent 65%),
        radial-gradient(1000px 600px at 100% 0%, #1f9f6e33, transparent 60%),
        var(--bg);
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .card {
      width: 100%;
      max-width: 460px;
      background: linear-gradient(160deg, var(--panel), var(--panel-soft));
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.4);
    }

    h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }

    p {
      margin: 8px 0 18px;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #d2dcff;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--line);
      padding: 6px 10px;
      border-radius: 999px;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: linear-gradient(135deg, #29b77e, #5ad6a5);
      box-shadow: 0 0 14px rgba(41, 183, 126, 0.9);
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: #dce6ff;
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 11px 12px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: #0b1530;
      color: var(--text);
      margin-bottom: 14px;
      font: inherit;
      font-size: 14px;
    }

    input:focus {
      outline: none;
      border-color: #3ea5ff;
      box-shadow: 0 0 0 3px rgba(62, 165, 255, 0.2);
    }

    button {
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 12px;
      background: linear-gradient(135deg, var(--accent), var(--accent-soft));
      color: #042417;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .row {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 13px;
    }

    a {
      color: #8fc2ff;
      text-decoration: none;
      font-weight: 600;
    }

    a:hover { text-decoration: underline; }

    .msg {
      margin-top: 14px;
      padding: 10px;
      border-radius: 10px;
      display: none;
      white-space: pre-wrap;
      font-size: 13px;
      border: 1px solid transparent;
    }

    .msg.ok {
      display: block;
      background: var(--ok-bg);
      color: var(--ok-text);
      border-color: #2b8469;
    }

    .msg.err {
      display: block;
      background: var(--danger-bg);
      color: var(--danger-text);
      border-color: #8d3045;
    }

    .small {
      margin-top: 12px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    .hidden { display: none !important; }

    .loading-wrap {
      padding: 14px 0 6px;
      text-align: center;
    }

    .spinner {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 3px solid #2b3f69;
      border-top-color: #62b0ff;
      margin: 0 auto 10px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand"><span class="dot"></span> Mr CRM powered by downlabs</div>
    <div id="loadingBlock" class="loading-wrap">
      <div class="spinner"></div>
      <h1 style="font-size:22px;">Checking session...</h1>
      <p style="margin-bottom:0;">Please wait while we verify your login state.</p>
    </div>

    <div id="authBlock" class="hidden">
      <h1>Sign in to your account</h1>
      <p>Access your workspace, manage subscription plans, and sync with the browser extension.</p>

      <form id="loginForm">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email">

        <label for="password">Password</label>
        <input id="password" name="password" type="password" required autocomplete="current-password">

        <button id="submitBtn" type="submit">Sign In</button>
      </form>

      <div class="row">
        <a id="registerLink" href="#">Create account</a>
        <a id="accountLink" href="#">Account dashboard</a>
      </div>
    </div>

    <div id="msg" class="msg"></div>
    <div class="small">After signing in, you can manage plans and limits from your account subscription page.</div>
  </div>

  <script>
    const BASE_PATH = <?php echo json_encode($scriptDir, JSON_UNESCAPED_SLASHES); ?>;
    const ROOT_PATH = BASE_PATH;
    const LOGIN_API_URL = `${BASE_PATH}/api/auth/login`;
    const ME_API_URL = `${BASE_PATH}/api/auth/me`;
    const REGISTER_PAGE_URL = `${ROOT_PATH}/account/register`;
    const ACCOUNT_PAGE_URL = `${ROOT_PATH}/account`;
    const SUBSCRIPTION_PAGE_URL = `${ROOT_PATH}/account/subscription`;

    const loadingBlock = document.getElementById('loadingBlock');
    const authBlock = document.getElementById('authBlock');
    const form = document.getElementById('loginForm');
    const msg = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');
    const registerLink = document.getElementById('registerLink');
    const accountLink = document.getElementById('accountLink');

    registerLink.href = REGISTER_PAGE_URL + window.location.search;
    accountLink.href = ACCOUNT_PAGE_URL;

    function setLoadingState(isLoading) {
      if (isLoading) {
        loadingBlock.classList.remove('hidden');
        authBlock.classList.add('hidden');
        return;
      }

      loadingBlock.classList.add('hidden');
      authBlock.classList.remove('hidden');
    }

    function show(type, text) {
      msg.className = 'msg ' + type;
      msg.textContent = text;
    }

    function saveAuth(payload) {
      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(payload.user));
      localStorage.setItem('workspace', JSON.stringify(payload.workspace));

      window.postMessage({
        type: 'SMARTDM_AUTH_SUCCESS',
        payload
      }, window.location.origin);
    }

    function getSavedAuth() {
      const accessToken = localStorage.getItem('accessToken') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      const userRaw = localStorage.getItem('user');
      const workspaceRaw = localStorage.getItem('workspace');

      if (!accessToken || !userRaw || !workspaceRaw) {
        return null;
      }

      try {
        return {
          accessToken,
          refreshToken,
          user: JSON.parse(userRaw),
          workspace: JSON.parse(workspaceRaw)
        };
      } catch (_) {
        return null;
      }
    }

    function clearSavedAuth() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('workspace');
    }

    function requestAuthSnapshotFromExtension(timeoutMs = 1200) {
      return new Promise((resolve) => {
        let done = false;

        const finish = (payload) => {
          if (done) return;
          done = true;
          window.removeEventListener('message', onMessage);
          resolve(payload || null);
        };

        const onMessage = (event) => {
          if (event.origin !== window.location.origin) {
            return;
          }
          if (!event.data || event.data.type !== 'SMARTDM_AUTH_SNAPSHOT') {
            return;
          }
          finish(event.data.payload || null);
        };

        window.addEventListener('message', onMessage);
        window.postMessage({ type: 'SMARTDM_REQUEST_AUTH_SNAPSHOT' }, window.location.origin);

        setTimeout(() => finish(null), timeoutMs);
      });
    }

    function encodePayloadForCrm(payload) {
      const base = {
        user: payload.user,
        workspace: payload.workspace
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(base))));
    }

    function redirectAfterAuth(payload) {
      const query = new URLSearchParams(window.location.search);
      const returnTo = (query.get('returnTo') || '').toLowerCase();

      if (returnTo === 'crm') {
        const crmUrl = `${window.location.origin}/crm/#/auth/callback?access_token=${encodeURIComponent(payload.accessToken)}&refresh_token=${encodeURIComponent(payload.refreshToken || '')}&payload=${encodeURIComponent(encodePayloadForCrm(payload))}`;
        window.location.href = crmUrl;
        return;
      }

      window.location.href = SUBSCRIPTION_PAGE_URL;
    }

    async function validateSession(accessToken) {
      const res = await fetch(ME_API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return res.ok;
    }

    async function bootstrapLoginPage() {
      setLoadingState(true);
      let existingAuth = getSavedAuth();

      if (!existingAuth) {
        const extSnapshot = await requestAuthSnapshotFromExtension();
        if (extSnapshot && extSnapshot.accessToken && extSnapshot.user && extSnapshot.workspace) {
          saveAuth(extSnapshot);
          existingAuth = extSnapshot;
        }
      }

      if (!existingAuth) {
        setLoadingState(false);
        return;
      }

      try {
        const valid = await validateSession(existingAuth.accessToken);
        if (!valid) {
          clearSavedAuth();
          setLoadingState(false);
          return;
        }

        saveAuth(existingAuth);
        show('ok', 'You are already signed in. Redirecting...');
        setTimeout(() => {
          window.location.href = ACCOUNT_PAGE_URL;
        }, 120);
      } catch (_) {
        clearSavedAuth();
        setLoadingState(false);
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.className = 'msg';
      msg.textContent = '';
      submitBtn.disabled = true;

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await fetch(LOGIN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || ('Login failed: HTTP ' + res.status));
        }

        const payload = {
          accessToken: data.tokens && data.tokens.accessToken,
          refreshToken: data.tokens && data.tokens.refreshToken,
          user: data.user,
          workspace: data.workspace
        };

        if (!payload.accessToken || !payload.user || !payload.workspace) {
          throw new Error('Server did not return complete auth payload.');
        }

        saveAuth(payload);
        show('ok', 'Login successful. Redirecting to your account...');
        setTimeout(() => redirectAfterAuth(payload), 350);
      } catch (err) {
        show('err', err && err.message ? err.message : String(err));
      } finally {
        submitBtn.disabled = false;
      }
    });

    bootstrapLoginPage();
  </script>
</body>
</html>
