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
  <title>Mr CRM Subscription</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    :root {
      --bg: #090f1d;
      --panel: #101a32;
      --line: #23385f;
      --text: #f4f8ff;
      --muted: #a0adcc;
      --accent: #3a8fff;
      --success: #31b784;
      --warning: #ffcc65;
      --danger: #ff8ea8;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      color: var(--text);
      background:
        radial-gradient(1150px 700px at 0% -10%, #1d3b7861, transparent 70%),
        radial-gradient(1000px 680px at 100% 0%, #1f9f6f34, transparent 72%),
        var(--bg);
      padding: 24px;
    }

    .shell { max-width: 1100px; margin: 0 auto; }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #d7e2ff;
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

    a.btn, button.btn {
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
    .btn-muted { background: #1b2642; color: #d8e4ff; border: 1px solid #314d7c; }

    h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 800;
    }

    .subtitle {
      margin: 10px 0 18px;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .panel {
      background: linear-gradient(160deg, #101a32, #122142);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 10px;
    }

    .metric {
      border: 1px solid #2e4775;
      border-radius: 12px;
      padding: 12px;
      background: rgba(10, 21, 45, 0.7);
    }

    .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      margin-bottom: 6px;
    }

    .value {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
    }

    .plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
    }

    .plan {
      border: 1px solid #2e4775;
      border-radius: 14px;
      padding: 14px;
      background: linear-gradient(170deg, #0f1932, #142449);
      position: relative;
    }

    .plan.current {
      border-color: #4f8ef7;
      box-shadow: 0 0 0 2px rgba(79, 142, 247, 0.25);
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(49, 183, 132, 0.2);
      color: #9bffd4;
      border: 1px solid rgba(49, 183, 132, 0.5);
    }

    .plan h3 {
      margin: 0 0 4px;
      font-size: 22px;
      font-weight: 800;
    }

    .price {
      font-size: 15px;
      color: #d3ddf6;
      margin-bottom: 10px;
    }

    ul {
      margin: 0 0 12px;
      padding-left: 18px;
      color: #d8e3ff;
      line-height: 1.8;
      font-size: 13px;
    }

    .status {
      margin-top: 10px;
      color: var(--muted);
      font-size: 13px;
      min-height: 20px;
    }

    .warn { color: var(--warning); }
    .ok { color: #97ffd6; }
    .err { color: var(--danger); }

    .empty {
      border: 1px dashed #355486;
      border-radius: 14px;
      padding: 26px;
      text-align: center;
      color: var(--muted);
      background: rgba(16, 26, 50, 0.6);
    }
  </style>
</head>
<body>
<div class="shell">
  <div class="top">
    <div class="brand"><span class="dot"></span> Mr CRM powered by downlabs</div>
    <div class="actions">
      <a id="accountBtn" class="btn btn-secondary" href="#">Account Dashboard</a>
      <a id="loginBtn" class="btn btn-primary" href="#">Sign In</a>
      <button id="refreshBtn" class="btn btn-muted" type="button">Refresh</button>
    </div>
  </div>

  <h1>Subscription & Limits</h1>
  <p class="subtitle">Upgrade your plan and monitor remaining usage for daily messages, AI replies, contacts, and monthly campaigns.</p>

  <div id="summary" class="empty">Loading subscription data...</div>
  <div id="plans" class="plans"></div>
  <div id="status" class="status"></div>
</div>

<script>
  const BASE_PATH = <?php echo json_encode($scriptDir, JSON_UNESCAPED_SLASHES); ?>;
  const ROOT_PATH = BASE_PATH;
  const LOGIN_URL = `${ROOT_PATH}/account/login`;
  const ACCOUNT_URL = `${ROOT_PATH}/account`;

  const accountBtn = document.getElementById('accountBtn');
  const loginBtn = document.getElementById('loginBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const summary = document.getElementById('summary');
  const plans = document.getElementById('plans');
  const status = document.getElementById('status');

  accountBtn.href = ACCOUNT_URL;
  loginBtn.href = LOGIN_URL;

  function setActionState(isLoggedIn) {
    if (isLoggedIn) {
      accountBtn.style.display = 'inline-flex';
      loginBtn.textContent = 'My Account';
      loginBtn.href = ACCOUNT_URL;
      loginBtn.classList.remove('btn-primary');
      loginBtn.classList.add('btn-secondary');
      return;
    }

    accountBtn.style.display = 'none';
    loginBtn.textContent = 'Sign In';
    loginBtn.href = LOGIN_URL;
    loginBtn.classList.remove('btn-secondary');
    loginBtn.classList.add('btn-primary');
  }

  function fmtLimit(value) {
    return Number(value) === -1 ? 'Unlimited' : String(value);
  }

  function fmtPrice(value) {
    const num = Number(value || 0);
    if (num <= 0) return 'Free';
    return `$${num.toFixed(2)}/month`;
  }

  function setStatus(text, cls) {
    status.className = 'status ' + (cls || '');
    status.textContent = text || '';
  }

  function getToken() {
    return localStorage.getItem('accessToken') || '';
  }

  function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('workspace');
  }

  async function loadSubscription() {
    const token = getToken();
    if (!token) {
      setActionState(false);
      summary.className = 'empty';
      summary.innerHTML = '<h3 style="margin-top:0;color:#dbe7ff;">Please sign in first</h3><p>Your account session was not found in this browser.</p>';
      plans.innerHTML = '';
      setStatus('No active session found.', 'warn');
      return;
    }

    setStatus('Loading subscription details...');

    try {
      const res = await fetch(`${BASE_PATH}/api/account/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load subscription data.');
      }

      setActionState(true);
      renderSummary(data);
      renderPlans(data);
      setStatus('Subscription loaded.', 'ok');
    } catch (err) {
      clearAuth();
      setActionState(false);
      summary.className = 'empty';
      summary.innerHTML = '<h3 style="margin-top:0;color:#ffd6df;">Could not load subscription</h3><p>Try refreshing or signing in again.</p>';
      plans.innerHTML = '';
      setStatus(err && err.message ? err.message : String(err), 'err');
    }
  }

  function renderSummary(data) {
    const usage = data.usage || {};
    const plan = data.currentPlan || {};

    summary.className = 'panel';
    summary.innerHTML = `
      <div class="grid">
        <div class="metric">
          <div class="label">Current Plan</div>
          <div class="value" style="font-size:20px;">${plan.name || 'Basic'}</div>
          <div style="margin-top:6px;color:#d0dcff;font-size:13px;">${fmtPrice(plan.priceMonthly)}</div>
        </div>
        <div class="metric">
          <div class="label">Messages Today</div>
          <div class="value">${usage.messagesSent || 0} / ${fmtLimit(usage.dailyLimit)}</div>
          <div style="margin-top:6px;color:#a7bbdf;font-size:12px;">Remaining: ${fmtLimit(usage.remaining && usage.remaining.messages)}</div>
        </div>
        <div class="metric">
          <div class="label">AI Replies Today</div>
          <div class="value">${usage.aiReplies || 0} / ${fmtLimit(usage.aiRepliesLimit)}</div>
          <div style="margin-top:6px;color:#a7bbdf;font-size:12px;">Remaining: ${fmtLimit(usage.remaining && usage.remaining.aiReplies)}</div>
        </div>
        <div class="metric">
          <div class="label">Contacts</div>
          <div class="value">${usage.contactsUsed || 0} / ${fmtLimit(usage.contactsLimit)}</div>
          <div style="margin-top:6px;color:#a7bbdf;font-size:12px;">Remaining: ${fmtLimit(usage.remaining && usage.remaining.contacts)}</div>
        </div>
        <div class="metric">
          <div class="label">Campaigns This Month</div>
          <div class="value">${usage.campaignsUsedThisMonth || 0} / ${fmtLimit(usage.campaignsPerMonth)}</div>
          <div style="margin-top:6px;color:#a7bbdf;font-size:12px;">Remaining: ${fmtLimit(usage.remaining && usage.remaining.campaigns)}</div>
        </div>
      </div>
    `;
  }

  function planFeatures(plan) {
    return [
      `Messages/day: ${fmtLimit(plan.messagesPerDay)}`,
      `AI replies/day: ${fmtLimit(plan.aiRepliesPerDay)}`,
      `Contacts: ${fmtLimit(plan.contactsLimit)}`,
      `Campaigns/month: ${fmtLimit(plan.campaignsPerMonth)}`
    ];
  }

  function renderPlans(data) {
    const current = data.currentPlan || {};
    const list = Array.isArray(data.plans) ? data.plans : [];
    if (list.length === 0) {
      plans.innerHTML = '';
      return;
    }

    plans.innerHTML = '';

    list.forEach((plan) => {
      const card = document.createElement('div');
      const isCurrent = String(plan.code || '').toLowerCase() === String(current.code || '').toLowerCase();
      card.className = 'plan' + (isCurrent ? ' current' : '');

      const features = planFeatures(plan).map((line) => `<li>${line}</li>`).join('');

      card.innerHTML = `
        ${isCurrent ? '<div class="badge">Current</div>' : ''}
        <h3>${plan.name || 'Plan'}</h3>
        <div class="price">${fmtPrice(plan.priceMonthly)}</div>
        <ul>${features}</ul>
        <button class="btn ${isCurrent ? 'btn-muted' : 'btn-primary'}" ${isCurrent ? 'disabled' : ''}>
          ${isCurrent ? 'Current Plan' : 'Upgrade'}
        </button>
      `;

      if (!isCurrent) {
        const button = card.querySelector('button');
        button.addEventListener('click', async () => {
          await upgradePlan(plan.code);
        });
      }

      plans.appendChild(card);
    });
  }

  async function upgradePlan(planCode) {
    const token = getToken();
    if (!token) {
      setStatus('Please sign in first.', 'warn');
      return;
    }

    setStatus('Updating subscription...');

    try {
      const res = await fetch(`${BASE_PATH}/api/account/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planCode })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upgrade plan.');
      }

      if (data.workspace) {
        localStorage.setItem('workspace', JSON.stringify(data.workspace));
      }

      setStatus('Plan updated successfully.', 'ok');
      await loadSubscription();
    } catch (err) {
      setStatus(err && err.message ? err.message : String(err), 'err');
    }
  }

  refreshBtn.addEventListener('click', () => {
    loadSubscription();
  });

  setActionState(Boolean(getToken()));
  loadSubscription();
</script>
</body>
</html>
