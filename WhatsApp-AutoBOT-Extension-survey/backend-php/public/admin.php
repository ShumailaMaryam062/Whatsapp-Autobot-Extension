<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/bootstrap.php';

session_start();

$services = app_services();
$creds = $services->getAdminCredentials();

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: admin.php');
    exit;
}

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    $loginError = '';

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'login') {
        $username = trim((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');

        if (hash_equals($creds['username'], $username) && hash_equals($creds['password'], $password)) {
            $_SESSION['admin_logged_in'] = true;
            header('Location: admin.php');
            exit;
        }

        $loginError = 'Invalid username or password.';
    }

    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mr CRM Admin Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; }
        .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { width: 100%; max-width: 430px; background: #111827; border: 1px solid #1f2937; border-radius: 14px; padding: 24px; }
        h1 { margin-top: 0; font-size: 22px; }
        p { color: #94a3b8; margin: 8px 0 18px; }
        label { display: block; margin-bottom: 6px; color: #cbd5e1; }
        input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0b1220; color: #e2e8f0; margin-bottom: 14px; }
        button { width: 100%; padding: 11px; border: 0; border-radius: 8px; background: #22c55e; color: #052e16; font-weight: bold; cursor: pointer; }
        .error { background: #7f1d1d; color: #fecaca; border: 1px solid #991b1b; padding: 10px; border-radius: 8px; margin-bottom: 14px; }
        .hint { margin-top: 12px; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="card">
        <h1>Mr CRM powered by downlabs</h1>
        <p>Admin console for users, plans, and workspace limits.</p>
        <?php if ($loginError !== ''): ?>
            <div class="error"><?= e($loginError) ?></div>
        <?php endif; ?>
        <form method="post">
            <input type="hidden" name="action" value="login">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" required>

            <label for="password">Password</label>
            <input id="password" name="password" type="password" required>

            <button type="submit">Sign In</button>
        </form>
        <div class="hint">Default credentials come from .env (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).</div>
    </div>
</div>
</body>
</html>
<?php
    exit;
}

$flash = '';
$flashType = 'ok';
$tokenResult = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'create_user_workspace') {
            $result = $services->adminCreateUserAndWorkspace([
                'email' => (string) ($_POST['email'] ?? ''),
                'fullName' => (string) ($_POST['full_name'] ?? ''),
                'password' => (string) ($_POST['password'] ?? ''),
                'workspaceName' => (string) ($_POST['workspace_name'] ?? ''),
                'whatsappPhone' => (string) ($_POST['whatsapp_phone'] ?? ''),
                'planCode' => (string) ($_POST['plan_code'] ?? ''),
                'planName' => (string) ($_POST['plan_name'] ?? ''),
                'messagesLimit' => (string) ($_POST['messages_limit'] ?? ''),
                'aiRepliesLimit' => (string) ($_POST['ai_replies_limit'] ?? ''),
                'contactsLimit' => (string) ($_POST['contacts_limit'] ?? ''),
                'campaignsPerMonth' => (string) ($_POST['campaigns_per_month'] ?? ''),
                'planPriceMonthly' => (string) ($_POST['plan_price_monthly'] ?? ''),
            ]);

            $flash = 'User/workspace created successfully for ' . ($result['user']['email'] ?? 'unknown');
            $flashType = 'ok';
        } elseif ($action === 'issue_tokens') {
            $tokenResult = $services->adminIssueTokens(
                (string) ($_POST['user_id'] ?? ''),
                (string) ($_POST['workspace_id'] ?? '')
            );
            $flash = 'Tokens issued successfully.';
            $flashType = 'ok';
        } elseif ($action === 'create_plan') {
            $services->adminCreatePlan([
                'code' => (string) ($_POST['code'] ?? ''),
                'name' => (string) ($_POST['name'] ?? ''),
                'description' => (string) ($_POST['description'] ?? ''),
                'priceMonthly' => (string) ($_POST['price_monthly'] ?? '0'),
                'messagesPerDay' => (string) ($_POST['messages_per_day'] ?? '100'),
                'aiRepliesPerDay' => (string) ($_POST['ai_replies_per_day'] ?? '50'),
                'contactsLimit' => (string) ($_POST['contacts_limit'] ?? '50'),
                'campaignsPerMonth' => (string) ($_POST['campaigns_per_month'] ?? '5'),
                'sortOrder' => (string) ($_POST['sort_order'] ?? '100'),
                'is_active' => (string) ($_POST['is_active'] ?? '0'),
                'is_default' => (string) ($_POST['is_default'] ?? '0'),
            ]);
            $flash = 'Plan created successfully.';
            $flashType = 'ok';
        } elseif ($action === 'update_plan') {
            $services->adminUpdatePlan(
                (string) ($_POST['plan_id'] ?? ''),
                [
                    'code' => (string) ($_POST['code'] ?? ''),
                    'name' => (string) ($_POST['name'] ?? ''),
                    'description' => (string) ($_POST['description'] ?? ''),
                    'priceMonthly' => (string) ($_POST['price_monthly'] ?? '0'),
                    'messagesPerDay' => (string) ($_POST['messages_per_day'] ?? '100'),
                    'aiRepliesPerDay' => (string) ($_POST['ai_replies_per_day'] ?? '50'),
                    'contactsLimit' => (string) ($_POST['contacts_limit'] ?? '50'),
                    'campaignsPerMonth' => (string) ($_POST['campaigns_per_month'] ?? '5'),
                    'sortOrder' => (string) ($_POST['sort_order'] ?? '100'),
                    'is_active' => (string) ($_POST['is_active'] ?? '0'),
                    'is_default' => (string) ($_POST['is_default'] ?? '0'),
                ]
            );
            $flash = 'Plan updated successfully.';
            $flashType = 'ok';
        } elseif ($action === 'delete_plan') {
            $services->adminDeletePlan((string) ($_POST['plan_id'] ?? ''));
            $flash = 'Plan deleted successfully.';
            $flashType = 'ok';
        }
    } catch (Throwable $e) {
        $flash = $e->getMessage();
        $flashType = 'err';
    }
}

$snapshot = $services->getAdminSnapshot();
$users = $snapshot['users'];
$workspaces = $snapshot['workspaces'];
$usageTodayMap = $snapshot['usageTodayMap'];
$today = $snapshot['today'];
$plans = $services->adminListPlans(true);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mr CRM Admin Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; }
        .top { background: #0f172a; color: #e2e8f0; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .top h1 { margin: 0; font-size: 20px; }
        .container { padding: 18px; max-width: 1380px; margin: 0 auto; }
        .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; overflow-x: auto; }
        .card h2 { margin: 0 0 12px; font-size: 18px; }
        .field { display: grid; gap: 6px; margin-bottom: 10px; }
        .field input, .field select, .field textarea { padding: 9px; border-radius: 8px; border: 1px solid #cbd5e1; font: inherit; }
        .field textarea { min-height: 64px; resize: vertical; }
        .btn { padding: 9px 12px; border-radius: 8px; border: 0; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #2563eb; color: #ffffff; }
        .btn-danger { background: #ef4444; color: #ffffff; }
        .btn-muted { background: #e2e8f0; color: #0f172a; }
        .flash { padding: 10px; border-radius: 8px; margin-bottom: 14px; }
        .flash.ok { background: #dcfce7; border: 1px solid #86efac; color: #14532d; }
        .flash.err { background: #fee2e2; border: 1px solid #fca5a5; color: #7f1d1d; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border-bottom: 1px solid #e2e8f0; text-align: left; padding: 8px; vertical-align: top; }
        th { background: #f1f5f9; white-space: nowrap; }
        code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; }
        .token-box { background: #0f172a; color: #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; word-break: break-all; }
        .inline { display: inline-flex; align-items: center; gap: 6px; }
        .pill { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #e2e8f0; color: #0f172a; }
    </style>
</head>
<body>
<div class="top">
    <h1>Mr CRM powered by downlabs - Backend Admin</h1>
    <form method="post" style="margin:0;">
        <input type="hidden" name="action" value="logout">
        <button class="btn btn-danger" type="submit">Logout</button>
    </form>
</div>

<div class="container">
    <?php if ($flash !== ''): ?>
        <div class="flash <?= e($flashType) ?>"><?= e($flash) ?></div>
    <?php endif; ?>

    <div class="row">
        <div class="card">
            <h2>Create User + Workspace</h2>
            <form method="post">
                <input type="hidden" name="action" value="create_user_workspace">

                <div class="field"><label>Email</label><input type="email" name="email" required></div>
                <div class="field"><label>Full Name</label><input type="text" name="full_name" required></div>
                <div class="field"><label>Password (new user)</label><input type="text" name="password" placeholder="Min 8 chars"></div>
                <div class="field"><label>Workspace Name</label><input type="text" name="workspace_name" required></div>
                <div class="field"><label>WhatsApp Phone</label><input type="text" name="whatsapp_phone" placeholder="+923001234567"></div>

                <div class="field">
                    <label>Plan Template</label>
                    <select name="plan_code">
                        <option value="">Default (Basic)</option>
                        <?php foreach ($plans as $plan): ?>
                            <?php if (!($plan['isActive'] ?? false)) { continue; } ?>
                            <option value="<?= e((string) ($plan['code'] ?? '')) ?>">
                                <?= e((string) ($plan['name'] ?? 'Plan')) ?>
                                (<?= e((string) ($plan['code'] ?? '')) ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="field"><label>Plan Name Override (optional)</label><input type="text" name="plan_name" placeholder="Leave empty to use template"></div>
                <div class="field"><label>Messages / Day</label><input type="number" name="messages_limit" value="100"></div>
                <div class="field"><label>AI Replies / Day (-1 = unlimited)</label><input type="number" name="ai_replies_limit" value="50"></div>
                <div class="field"><label>Contacts Limit (-1 = unlimited)</label><input type="number" name="contacts_limit" value="50"></div>
                <div class="field"><label>Campaigns / Month (-1 = unlimited)</label><input type="number" name="campaigns_per_month" value="5"></div>
                <div class="field"><label>Plan Price Monthly (USD)</label><input type="number" step="0.01" name="plan_price_monthly" value="0"></div>

                <button class="btn btn-primary" type="submit">Create</button>
            </form>
        </div>

        <div class="card">
            <h2>Issue Tokens</h2>
            <form method="post">
                <input type="hidden" name="action" value="issue_tokens">
                <div class="field"><label>User ID</label><input type="text" name="user_id" required></div>
                <div class="field"><label>Workspace ID</label><input type="text" name="workspace_id" required></div>
                <button class="btn btn-primary" type="submit">Generate Access + Refresh</button>
            </form>

            <?php if (is_array($tokenResult)): ?>
                <h3>Generated Tokens</h3>
                <div class="token-box"><strong>Access Token:</strong><br><?= e((string) ($tokenResult['tokens']['accessToken'] ?? '')) ?></div>
                <div style="height:8px"></div>
                <div class="token-box"><strong>Refresh Token:</strong><br><?= e((string) ($tokenResult['tokens']['refreshToken'] ?? '')) ?></div>
            <?php endif; ?>
        </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
        <h2>Plans Management</h2>
        <p style="margin-top:0;color:#475569;">Create and maintain subscription plans. Basic plan should keep contacts limit at 50 by default.</p>

        <form method="post" style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:14px;">
            <input type="hidden" name="action" value="create_plan">
            <div class="row" style="margin-bottom:8px;">
                <div class="field"><label>Code</label><input type="text" name="code" placeholder="basic" required></div>
                <div class="field"><label>Name</label><input type="text" name="name" placeholder="Basic" required></div>
                <div class="field"><label>Price Monthly</label><input type="number" step="0.01" name="price_monthly" value="0" required></div>
                <div class="field"><label>Sort Order</label><input type="number" name="sort_order" value="100" required></div>
            </div>
            <div class="field"><label>Description</label><textarea name="description" placeholder="Plan description"></textarea></div>
            <div class="row" style="margin-bottom:8px;">
                <div class="field"><label>Messages / Day</label><input type="number" name="messages_per_day" value="100" required></div>
                <div class="field"><label>AI Replies / Day</label><input type="number" name="ai_replies_per_day" value="50" required></div>
                <div class="field"><label>Contacts Limit</label><input type="number" name="contacts_limit" value="50" required></div>
                <div class="field"><label>Campaigns / Month</label><input type="number" name="campaigns_per_month" value="5" required></div>
            </div>
            <div class="inline" style="margin-bottom:10px;">
                <input type="hidden" name="is_active" value="0">
                <label class="inline"><input type="checkbox" name="is_active" value="1" checked> Active</label>
                <input type="hidden" name="is_default" value="0">
                <label class="inline"><input type="checkbox" name="is_default" value="1"> Default</label>
            </div>
            <button class="btn btn-primary" type="submit">Create Plan</button>
        </form>

        <table>
            <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Price</th>
                <th>Msgs/Day</th>
                <th>AI/Day</th>
                <th>Contacts</th>
                <th>Campaigns/Month</th>
                <th>State</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($plans as $plan): ?>
                <tr>
                    <td colspan="9" style="padding:0;">
                        <form method="post" style="display:grid;grid-template-columns: 120px 160px 100px 95px 95px 95px 125px 180px 180px;gap:6px;align-items:center;padding:8px;border-bottom:1px solid #e2e8f0;">
                            <input type="hidden" name="action" value="update_plan">
                            <input type="hidden" name="plan_id" value="<?= e((string) ($plan['id'] ?? '')) ?>">

                            <input type="text" name="code" value="<?= e((string) ($plan['code'] ?? '')) ?>" required>
                            <input type="text" name="name" value="<?= e((string) ($plan['name'] ?? '')) ?>" required>
                            <input type="number" step="0.01" name="price_monthly" value="<?= e((string) ($plan['priceMonthly'] ?? 0)) ?>" required>
                            <input type="number" name="messages_per_day" value="<?= e((string) ($plan['messagesPerDay'] ?? 0)) ?>" required>
                            <input type="number" name="ai_replies_per_day" value="<?= e((string) ($plan['aiRepliesPerDay'] ?? 0)) ?>" required>
                            <input type="number" name="contacts_limit" value="<?= e((string) ($plan['contactsLimit'] ?? 0)) ?>" required>
                            <input type="number" name="campaigns_per_month" value="<?= e((string) ($plan['campaignsPerMonth'] ?? 0)) ?>" required>

                            <div class="inline">
                                <input type="hidden" name="is_active" value="0">
                                <label class="inline"><input type="checkbox" name="is_active" value="1" <?= ($plan['isActive'] ?? false) ? 'checked' : '' ?>> Active</label>
                                <input type="hidden" name="is_default" value="0">
                                <label class="inline"><input type="checkbox" name="is_default" value="1" <?= ($plan['isDefault'] ?? false) ? 'checked' : '' ?>> Default</label>
                            </div>

                            <div class="inline">
                                <input type="number" name="sort_order" value="<?= e((string) ($plan['sortOrder'] ?? 100)) ?>" style="width:70px;" title="Sort order">
                                <button class="btn btn-primary" type="submit" style="padding:6px 10px;">Save</button>
                            </div>
                        </form>
                        <form method="post" style="padding:8px;display:flex;justify-content:flex-end;gap:8px;">
                            <input type="hidden" name="action" value="delete_plan">
                            <input type="hidden" name="plan_id" value="<?= e((string) ($plan['id'] ?? '')) ?>">
                            <button class="btn btn-danger" type="submit" style="padding:6px 10px;" onclick="return confirm('Delete this plan?')">Delete</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="card" style="margin-bottom:16px;">
        <h2>Users</h2>
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Created</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($users as $u): ?>
                <tr>
                    <td><code><?= e((string) ($u['id'] ?? '')) ?></code></td>
                    <td><?= e((string) ($u['email'] ?? '')) ?></td>
                    <td><?= e((string) ($u['full_name'] ?? '')) ?></td>
                    <td><?= e((string) ($u['created_at'] ?? '')) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="card">
        <h2>Workspaces (Usage Today: <?= e((string) $today) ?>)</h2>
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Msgs/Day</th>
                <th>AI/Day</th>
                <th>Contacts Limit</th>
                <th>Campaigns/Month</th>
                <th>Used Msgs</th>
                <th>Used AI</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($workspaces as $w): ?>
                <?php $usage = $usageTodayMap[(string) ($w['id'] ?? '')] ?? ['messagesSent' => 0, 'aiReplies' => 0]; ?>
                <tr>
                    <td><code><?= e((string) ($w['id'] ?? '')) ?></code></td>
                    <td><?= e((string) ($w['name'] ?? '')) ?></td>
                    <td><?= e((string) ($w['whatsapp_phone'] ?? '')) ?></td>
                    <td>
                        <?= e((string) ($w['plan_name'] ?? 'Basic')) ?>
                        <?php if (!empty($w['plan_id'])): ?>
                            <span class="pill"><?= e((string) $w['plan_id']) ?></span>
                        <?php endif; ?>
                    </td>
                    <td><?= e((string) ($w['plan_price_monthly'] ?? '0')) ?></td>
                    <td><?= e((string) ($w['plan_messages_per_day'] ?? '0')) ?></td>
                    <td><?= e((string) ($w['plan_ai_replies_per_day'] ?? '0')) ?></td>
                    <td><?= e((string) ($w['plan_contacts_limit'] ?? '0')) ?></td>
                    <td><?= e((string) ($w['plan_campaigns_per_month'] ?? '0')) ?></td>
                    <td><?= e((string) ($usage['messagesSent'] ?? 0)) ?></td>
                    <td><?= e((string) ($usage['aiReplies'] ?? 0)) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
