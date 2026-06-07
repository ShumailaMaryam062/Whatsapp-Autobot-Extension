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
  <title>Mr CRM Account</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    :root {
      --bg: #090f1d;
      --panel: #101a32;
      --line: #23385f;
      --text: #f3f7ff;
      --muted: #9eaccc;
      --accent: #3a8fff;
      --danger: #e76078;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      color: var(--text);
      background:
        radial-gradient(1100px 700px at 0% -10%, #23407a66, transparent 70%),
        radial-gradient(1000px 650px at 100% 0%, #1f9f6f36, transparent 72%),
        var(--bg);
      padding: 24px;
    }

    .shell {
      max-width: 980px;
      margin: 0 auto;
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #d6e1ff;
      font-size: 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--line);
      padding: 7px 11px;
      border-radius: 999px;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: linear-gradient(135deg, #31b784, #7ce8be);
      box-shadow: 0 0 12px rgba(49, 183, 132, 0.9);
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button, a.btn {
      border: 0;
      border-radius: 10px;
      padding: 10px 13px;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary { background: linear-gradient(135deg, #3a8fff, #286ed8); color: #f4f8ff; }
    .btn-secondary { background: #1a2747; color: #d8e4ff; border: 1px solid #2d4675; }
    .btn-danger { background: #3f1f29; color: #ffd3df; border: 1px solid #7c3147; }

    h1 {
      margin: 0 0 8px;
      font-size: 30px;
      font-weight: 800;
    }

    .subtitle {
      margin: 0 0 18px;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 12px;
    }

    .card {
      background: linear-gradient(160deg, #101a32, #122142);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
      min-height: 120px;
    }

    .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      margin-bottom: 7px;
    }

    .value {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      word-break: break-word;
    }

    .tiny {
      margin-top: 8px;
      color: var(--muted);
      font-size: 12px;
    }

    .empty {
      border: 1px dashed #355486;
      border-radius: 14px;
      padding: 26px;
      text-align: center;
      color: var(--muted);
      background: rgba(16, 26, 50, 0.6);
    }

    .status {
      margin-top: 12px;
      font-size: 13px;
      color: var(--muted);
    }
  </style>
</head>
<body>
<div class="shell">
  <div class="top">
    <div class="brand"><span class="dot"></span> Mr CRM powered by downlabs</div>
    <div class="actions">
      <a id="subscriptionBtn" class="btn btn-secondary" href="#">Manage Subscription</a>
      <a id="loginBtn" class="btn btn-primary" href="#">Sign In</a>
      <a id="registerBtn" class="btn btn-secondary" href="#">Register</a>
      <button id="logoutBtn" class="btn btn-danger" type="button">Logout</button>
    </div>
  </div>

  <h1>Account Dashboard</h1>
  <p class="subtitle">View your current plan, daily usage, and remaining limits for messages, AI replies, contacts, and campaigns.</p>

  <div id="content" class="empty">Loading account information...</div>
  <div id="status" class="status"></div>
</div>

<script>
  const BASE_PATH = <?php echo json_encode($scriptDir, JSON_UNESCAPED_SLASHES); ?>;
  const ROOT_PATH = BASE_PATH;
  const LOGIN_URL = `${ROOT_PATH}/account/login`;
  const REGISTER_URL = `${ROOT_PATH}/account/register`;
  const SUBSCRIPTION_URL = `${ROOT_PATH}/account/subscription`;

  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const subscriptionBtn = document.getElementById('subscriptionBtn');
  const content = document.getElementById('content');
  const status = document.getElementById('status');

  loginBtn.href = LOGIN_URL;
  registerBtn.href = REGISTER_URL;
  subscriptionBtn.href = SUBSCRIPTION_URL;

  function setActionState(isLoggedIn) {
    if (isLoggedIn) {
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      subscriptionBtn.style.display = 'inline-flex';
      logoutBtn.style.display = 'inline-flex';
      return;
    }

    loginBtn.style.display = 'inline-flex';
    registerBtn.style.display = 'inline-flex';
    subscriptionBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('workspace');
  }

  function fmtLimit(value) {
    return Number(value) === -1 ? 'Unlimited' : String(value);
  }

  function setStatus(text) {
    status.textContent = text || '';
  }

  function logout() {
    clearAuth();
    window.postMessage({ type: 'SMARTDM_LOGOUT' }, window.location.origin);
    window.location.href = LOGIN_URL;
  }

  logoutBtn.addEventListener('click', logout);

  function renderGuest() {
    setActionState(false);
    content.className = 'empty';
    content.innerHTML = '<h3 style="margin-top:0;color:#dbe7ff;">You are not signed in</h3><p>Sign in or create an account to manage your plan and usage.</p>';
    setStatus('No active session found.');
  }

  function renderAccount(data) {
    setActionState(true);
    const usage = data.usage || {};
    const plan = data.currentPlan || (data.workspace && data.workspace.plan) || {};
    const user = data.user || {};
    const workspace = data.workspace || {};

    content.className = 'grid';
    content.innerHTML = `
      <div class="card">
        <div class="label">Account</div>
        <div class="value" style="font-size:18px;">${user.name || '-'} </div>
        <div class="tiny">${user.email || '-'}</div>
      </div>
      <div class="card">
        <div class="label">Workspace</div>
        <div class="value" style="font-size:18px;">${workspace.name || '-'}</div>
        <div class="tiny">Plan: ${plan.name || 'Basic'}</div>
      </div>
      <div class="card">
        <div class="label">Messages Today</div>
        <div class="value">${usage.messagesSent || 0} / ${fmtLimit(usage.dailyLimit)}</div>
        <div class="tiny">Remaining: ${fmtLimit(usage.remaining && usage.remaining.messages)}</div>
      </div>
      <div class="card">
        <div class="label">AI Replies Today</div>
        <div class="value">${usage.aiReplies || 0} / ${fmtLimit(usage.aiRepliesLimit)}</div>
        <div class="tiny">Remaining: ${fmtLimit(usage.remaining && usage.remaining.aiReplies)}</div>
      </div>
      <div class="card">
        <div class="label">Contacts</div>
        <div class="value">${usage.contactsUsed || 0} / ${fmtLimit(usage.contactsLimit)}</div>
        <div class="tiny">Remaining: ${fmtLimit(usage.remaining && usage.remaining.contacts)}</div>
      </div>
      <div class="card">
        <div class="label">Campaigns This Month</div>
        <div class="value">${usage.campaignsUsedThisMonth || 0} / ${fmtLimit(usage.campaignsPerMonth)}</div>
        <div class="tiny">Remaining: ${fmtLimit(usage.remaining && usage.remaining.campaigns)}</div>
      </div>
    `;

    setStatus('Subscription and usage loaded successfully.');
  }

  async function loadAccount() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      renderGuest();
      return;
    }

    try {
      const res = await fetch(`${BASE_PATH}/api/account/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load account details.');
      }

      renderAccount(data);
    } catch (err) {
      clearAuth();
      renderGuest();
      setStatus(err && err.message ? err.message : String(err));
    }
  }

  setActionState(Boolean(localStorage.getItem('accessToken')));
  loadAccount();
</script>
</body>
</html>
