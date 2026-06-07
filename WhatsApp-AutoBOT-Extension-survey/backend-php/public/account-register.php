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
  <title>Create Mr CRM Account</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    :root {
      --bg: #090f1d;
      --panel: #101a32;
      --line: #22375f;
      --text: #f2f6ff;
      --muted: #9eabcb;
      --accent: #31b784;
      --accent-deep: #1f9f6f;
      --info: #70b8ff;
      --err-bg: #4d1d2a;
      --err-line: #9d3550;
      --ok-bg: #17493a;
      --ok-line: #2a8468;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      color: var(--text);
      background:
        radial-gradient(1000px 700px at 5% -10%, #233f7766, transparent 70%),
        radial-gradient(900px 650px at 100% 0%, #1f9f6f3a, transparent 70%),
        var(--bg);
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .card {
      width: 100%;
      max-width: 520px;
      background: linear-gradient(160deg, #101a32, #122040);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.45);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      margin-bottom: 12px;
      color: #d3dcff;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--line);
      padding: 6px 10px;
      border-radius: 999px;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: linear-gradient(135deg, #31b784, #6de0b7);
      box-shadow: 0 0 14px rgba(49, 183, 132, 0.9);
    }

    h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
    }

    p {
      margin: 8px 0 18px;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (min-width: 640px) {
      .grid { grid-template-columns: 1fr 1fr; }
      .full { grid-column: 1 / -1; }
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #dce6ff;
    }

    input, select {
      width: 100%;
      padding: 11px 12px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: #0a1530;
      color: var(--text);
      font: inherit;
      font-size: 14px;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--info);
      box-shadow: 0 0 0 3px rgba(112, 184, 255, 0.2);
    }

    button {
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 12px;
      background: linear-gradient(135deg, var(--accent), var(--accent-deep));
      color: #07241a;
      font-weight: 700;
      cursor: pointer;
      margin-top: 14px;
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .msg {
      margin-top: 14px;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid transparent;
      display: none;
      white-space: pre-wrap;
      font-size: 13px;
    }

    .msg.ok {
      display: block;
      background: var(--ok-bg);
      border-color: var(--ok-line);
      color: #d6ffea;
    }

    .msg.err {
      display: block;
      background: var(--err-bg);
      border-color: var(--err-line);
      color: #ffd2df;
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
      color: #97c8ff;
      text-decoration: none;
      font-weight: 600;
    }

    a:hover { text-decoration: underline; }

    .hint {
      margin-top: 10px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand"><span class="dot"></span> Mr CRM powered by downlabs</div>
    <h1>Create your account</h1>
    <p>Register directly and start using your workspace without waiting for manual admin setup.</p>

    <form id="registerForm">
      <div class="grid">
        <div>
          <label for="fullName">Full Name</label>
          <input id="fullName" name="fullName" type="text" required autocomplete="name">
        </div>
        <div>
          <label for="workspaceName">Workspace Name</label>
          <input id="workspaceName" name="workspaceName" type="text" required placeholder="My Team CRM">
        </div>
        <div class="full">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required autocomplete="email">
        </div>
        <div class="full">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" minlength="8" required autocomplete="new-password">
        </div>
        <div class="full">
          <label for="planCode">Plan</label>
          <select id="planCode" name="planCode" required disabled>
            <option value="basic" selected>Basic - Free - Contacts: 50</option>
          </select>
        </div>
      </div>

      <input type="hidden" id="planCodeHidden" name="planCode" value="basic">

      <button id="submitBtn" type="submit">Create Account</button>
    </form>

    <div class="row">
      <a id="loginLink" href="#">Already have an account? Sign in</a>
      <a id="subscriptionLink" href="#">View subscription page</a>
    </div>

    <div id="msg" class="msg"></div>
    <div class="hint">Basic plan starts with 50 contacts by default. You can upgrade from your subscription page anytime.</div>
  </div>

  <script>
    const BASE_PATH = <?php echo json_encode($scriptDir, JSON_UNESCAPED_SLASHES); ?>;
    const ROOT_PATH = BASE_PATH;
    const REGISTER_API_URL = `${BASE_PATH}/api/auth/register`;
    const LOGIN_PAGE_URL = `${ROOT_PATH}/account/login`;
    const SUBSCRIPTION_PAGE_URL = `${ROOT_PATH}/account/subscription`;

    const form = document.getElementById('registerForm');
    const msg = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');
    const planSelect = document.getElementById('planCode');
    const loginLink = document.getElementById('loginLink');
    const subscriptionLink = document.getElementById('subscriptionLink');

    loginLink.href = LOGIN_PAGE_URL + window.location.search;
    subscriptionLink.href = SUBSCRIPTION_PAGE_URL;

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

    function encodePayloadForCrm(payload) {
      const base = { user: payload.user, workspace: payload.workspace };
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

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.className = 'msg';
      msg.textContent = '';
      submitBtn.disabled = true;

      const body = {
        fullName: document.getElementById('fullName').value.trim(),
        workspaceName: document.getElementById('workspaceName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        planCode: 'basic'
      };

      try {
        const res = await fetch(REGISTER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || ('Registration failed: HTTP ' + res.status));
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
        show('ok', 'Account created successfully. Redirecting to your subscription page...');
        setTimeout(() => redirectAfterAuth(payload), 350);
      } catch (err) {
        show('err', err && err.message ? err.message : String(err));
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
