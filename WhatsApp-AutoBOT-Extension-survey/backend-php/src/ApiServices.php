<?php
declare(strict_types=1);

require_once __DIR__ . '/Env.php';
require_once __DIR__ . '/HttpException.php';
require_once __DIR__ . '/Jwt.php';
require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/SupabaseRest.php';

final class ApiServices
{
    private array $config;
    private HttpClient $http;
    private SupabaseRest $supabase;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->http = new HttpClient();
        $this->supabase = new SupabaseRest(
            $config['supabase_url'],
            $config['supabase_service_role_key'],
            $config['supabase_anon_key'],
            $this->http
        );
    }

    public function getAdminCredentials(): array
    {
        return [
            'username' => $this->config['admin_username'],
            'password' => $this->config['admin_password'],
        ];
    }

    public function getAdminSnapshot(): array
    {
        $users = $this->sbSelectRows(
            'app_users',
            [],
            'id,email,full_name,is_active,created_at',
            ['order' => 'created_at.desc', 'limit' => '100']
        );

        $workspaces = $this->sbSelectRows(
            'app_workspaces',
            [],
            'id,name,owner_user_id,whatsapp_phone,plan_id,plan_name,plan_messages_per_day,plan_ai_replies_per_day,plan_price_monthly,plan_contacts_limit,plan_campaigns_per_month,extension_install_whatsapp_sent_at,created_at',
            ['order' => 'created_at.desc', 'limit' => '100']
        );

        $today = gmdate('Y-m-d');
        $usageRows = $this->sbSelectRows(
            'app_usage_counters',
            ['date' => 'eq.' . $today],
            'workspace_id,messages_sent,ai_replies,date'
        );

        $usageMap = [];
        foreach ($usageRows as $row) {
            $usageMap[(string) $row['workspace_id']] = [
                'messagesSent' => (int) ($row['messages_sent'] ?? 0),
                'aiReplies' => (int) ($row['ai_replies'] ?? 0),
                'date' => (string) ($row['date'] ?? $today),
            ];
        }

        return [
            'users' => $users,
            'workspaces' => $workspaces,
            'usageTodayMap' => $usageMap,
            'today' => $today,
        ];
    }

    public function adminCreateUserAndWorkspace(array $input): array
    {
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $fullName = trim((string) ($input['fullName'] ?? ''));
        $password = (string) ($input['password'] ?? '');
        $workspaceName = trim((string) ($input['workspaceName'] ?? ''));
        $whatsappPhone = trim((string) ($input['whatsappPhone'] ?? ''));

        $selectedPlan = $this->getPlanByCode((string) ($input['planCode'] ?? ''), true);
        if ($selectedPlan === null) {
            $selectedPlan = $this->getDefaultPlan();
        }

        $planName = trim((string) ($input['planName'] ?? ''));
        if ($planName === '') {
            $planName = (string) ($selectedPlan['name'] ?? 'Basic');
        }

        $messagesLimit = isset($input['messagesLimit'])
            ? (int) $input['messagesLimit']
            : (int) ($selectedPlan['messagesPerDay'] ?? 100);
        $aiRepliesLimit = isset($input['aiRepliesLimit'])
            ? (int) $input['aiRepliesLimit']
            : (int) ($selectedPlan['aiRepliesPerDay'] ?? 50);
        $contactsLimit = isset($input['contactsLimit'])
            ? (int) $input['contactsLimit']
            : (int) ($selectedPlan['contactsLimit'] ?? 50);
        $campaignsPerMonth = isset($input['campaignsPerMonth'])
            ? (int) $input['campaignsPerMonth']
            : (int) ($selectedPlan['campaignsPerMonth'] ?? 5);
        $planPriceMonthly = isset($input['planPriceMonthly'])
            ? (float) $input['planPriceMonthly']
            : (float) ($selectedPlan['priceMonthly'] ?? 0);

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException(400, 'Valid email is required.');
        }
        if ($fullName === '') {
            throw new HttpException(400, 'Full name is required.');
        }
        if ($workspaceName === '') {
            throw new HttpException(400, 'Workspace name is required.');
        }

        $user = $this->sbSelectOne('app_users', ['email' => 'eq.' . $email]);
        if ($user === null) {
            if (strlen($password) < 8) {
                throw new HttpException(400, 'Password must be at least 8 characters for a new user.');
            }
            $user = $this->sbInsertOne('app_users', [
                'email' => $email,
                'full_name' => $fullName,
                'password_hash' => password_hash($password, PASSWORD_BCRYPT),
                'is_active' => true,
                'created_at' => $this->nowIso(),
                'updated_at' => $this->nowIso(),
            ]);
        }

        $workspaceData = [
            'owner_user_id' => $user['id'],
            'name' => $workspaceName,
            'whatsapp_phone' => $whatsappPhone !== '' ? $this->normalizePhone($whatsappPhone) : null,
            'plan_id' => $selectedPlan['id'] ?? null,
            'plan_name' => $planName,
            'plan_messages_per_day' => max(-1, $messagesLimit),
            'plan_ai_replies_per_day' => max(-1, $aiRepliesLimit),
            'plan_price_monthly' => max(0.0, $planPriceMonthly),
            'plan_contacts_limit' => max(-1, $contactsLimit),
            'plan_campaigns_per_month' => max(-1, $campaignsPerMonth),
            'created_at' => $this->nowIso(),
            'updated_at' => $this->nowIso(),
        ];

        $workspace = $this->sbInsertOne('app_workspaces', $workspaceData);

        $this->sbInsertOne('app_workspace_members', [
            'workspace_id' => $workspace['id'],
            'user_id' => $user['id'],
            'role' => 'owner',
            'created_at' => $this->nowIso(),
        ], true);

        $this->sbInsertOne('app_ai_configs', [
            'workspace_id' => $workspace['id'],
            'model' => $this->config['groq_chat_model'],
            'temperature' => 0.7,
            'max_tokens' => 500,
            'reply_delay' => 2000,
            'debounce_time' => 10000,
            'enabled' => true,
            'updated_at' => $this->nowIso(),
        ], true);

        return [
            'user' => $this->userPayload($user),
            'workspace' => $this->workspacePayload($workspace),
        ];
    }

    public function adminIssueTokens(string $userId, string $workspaceId): array
    {
        $user = $this->sbSelectOne('app_users', ['id' => 'eq.' . $userId]);
        if ($user === null) {
            throw new HttpException(404, 'User not found.');
        }

        $workspace = $this->sbSelectOne('app_workspaces', ['id' => 'eq.' . $workspaceId]);
        if ($workspace === null) {
            throw new HttpException(404, 'Workspace not found.');
        }

        $member = $this->sbSelectOne('app_workspace_members', [
            'workspace_id' => 'eq.' . $workspaceId,
            'user_id' => 'eq.' . $userId,
        ]);

        if ($member === null) {
            $this->sbInsertOne('app_workspace_members', [
                'workspace_id' => $workspaceId,
                'user_id' => $userId,
                'role' => 'member',
                'created_at' => $this->nowIso(),
            ], true);
        }

        $tokens = $this->issueTokens($userId, $workspaceId, true);

        return [
            'tokens' => $tokens,
            'user' => $this->userPayload($user),
            'workspace' => $this->workspacePayload($workspace),
        ];
    }

    public function adminListPlans(bool $includeInactive = true): array
    {
        return $this->getAvailablePlans(!$includeInactive);
    }

    public function adminCreatePlan(array $input): array
    {
        $row = $this->buildPlanRowFromInput($input, true);
        if ((bool) ($row['is_default'] ?? false)) {
            $this->clearDefaultPlans();
        }

        $inserted = $this->sbInsertOne('app_plans', $row);
        return $this->mapPlanRow($inserted);
    }

    public function adminUpdatePlan(string $planId, array $input): array
    {
        $existing = $this->sbSelectOne('app_plans', ['id' => 'eq.' . $planId]);
        if ($existing === null) {
            throw new HttpException(404, 'Plan not found.');
        }

        $row = $this->buildPlanRowFromInput($input, false, $existing);
        if ((bool) ($row['is_default'] ?? false)) {
            $this->clearDefaultPlans($planId);
        }

        $updated = $this->sbUpdateOne('app_plans', ['id' => 'eq.' . $planId], $row);
        if ($updated === null) {
            throw new HttpException(404, 'Plan not found.');
        }

        return $this->mapPlanRow($updated);
    }

    public function adminDeletePlan(string $planId): void
    {
        $plan = $this->sbSelectOne('app_plans', ['id' => 'eq.' . $planId]);
        if ($plan === null) {
            throw new HttpException(404, 'Plan not found.');
        }

        if ($this->parseBool($plan['is_default'] ?? false, false)) {
            throw new HttpException(400, 'Default plan cannot be deleted.');
        }

        $workspaceUsingPlan = $this->sbSelectOne(
            'app_workspaces',
            ['plan_id' => 'eq.' . $planId],
            'id',
            ['limit' => '1']
        );
        if ($workspaceUsingPlan !== null) {
            throw new HttpException(409, 'Cannot delete a plan currently assigned to one or more workspaces.');
        }

        $res = $this->supabase->request(
            'DELETE',
            '/rest/v1/app_plans',
            ['id' => 'eq.' . $planId],
            null,
            ['Prefer' => 'return=representation'],
            true,
            true
        );
        $this->ensureSupabaseSuccess($res, 'Failed to delete plan.');
    }

    public function dispatch(
        string $method,
        string $path,
        array $query,
        array $jsonBody,
        array $files,
        array $headers
    ): array {
        $method = strtoupper($method);
        $path = $this->normalizePath($path);

        try {
            if ($method === 'GET' && ($path === '/health' || $path === '/api/health')) {
                return $this->ok([
                    'ok' => true,
                    'service' => 'smartdm-php-backend',
                    'timestamp' => $this->nowIso(),
                ]);
            }

            if ($method === 'GET' && $path === '/api/extension/latest-version') {
                return $this->ok(['version' => $this->config['latest_extension_version']]);
            }

            if ($method === 'POST' && $path === '/api/auth/login') {
                return $this->ok($this->authLogin($jsonBody));
            }

            if ($method === 'POST' && $path === '/api/auth/register') {
                return $this->ok($this->authRegister($jsonBody));
            }

            if ($method === 'GET' && $path === '/api/billing/plans') {
                $includeInactive = strtolower(trim((string) ($query['includeInactive'] ?? ''))) === 'true';
                return $this->ok([
                    'success' => true,
                    'plans' => $this->getAvailablePlans(!$includeInactive),
                ]);
            }

            if ($method === 'GET' && $path === '/api/auth/me') {
                $ctx = $this->requireAuth($headers);
                return $this->ok([
                    'user' => $this->userPayload($ctx['user']),
                    'workspace' => $this->workspacePayload($ctx['workspace']),
                ]);
            }

            if ($method === 'POST' && $path === '/api/auth/refresh') {
                return $this->ok($this->authRefresh($jsonBody));
            }

            if ($method === 'GET' && ($path === '/api/account' || $path === '/api/account/subscription')) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->accountSubscription($ctx));
            }

            if ($method === 'POST' && $path === '/api/account/subscription/upgrade') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->upgradeSubscription($ctx, $jsonBody));
            }

            if ($method === 'GET' && $path === '/api/workspace/me') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->workspacePayload($ctx['workspace']));
            }

            if ($method === 'POST' && $path === '/api/workspace') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->createWorkspace($ctx, $jsonBody));
            }

            if ($method === 'POST' && $path === '/api/workspace/switch') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->switchWorkspace($ctx, $jsonBody));
            }

            if ($method === 'POST' && $path === '/api/workspace/me/extension-install-whatsapp-ping') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->recordExtensionInstallPing($ctx));
            }

            if ($method === 'GET' && preg_match('#^/api/workspace/by-phone/(.+)$#', $path, $matches) === 1) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->getWorkspaceByPhone($ctx, rawurldecode($matches[1])));
            }

            if ($method === 'PATCH' && preg_match('#^/api/workspace/([a-f0-9-]+)$#i', $path, $matches) === 1) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->patchWorkspace($ctx, $matches[1], $jsonBody));
            }

            if ($method === 'GET' && $path === '/api/config/ai-defaults') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->getAiDefaults($ctx));
            }

            if ($method === 'POST' && $path === '/api/ai/openai-chat') {
                $this->requireAuth($headers);
                return $this->proxyGroqChat($jsonBody);
            }

            if ($method === 'POST' && $path === '/api/ai/openai-transcriptions') {
                $this->requireAuth($headers);
                return $this->proxyGroqTranscription($files);
            }

            if ($method === 'POST' && $path === '/api/ai/reply') {
                $this->requireAuth($headers);
                return $this->legacyAiReply($jsonBody);
            }

            if ($method === 'POST' && $path === '/api/usage/track-ai-reply') {
                $ctx = $this->requireAuth($headers);
                return $this->trackAiReply($ctx);
            }

            if ($method === 'GET' && ($path === '/api/usage/today' || $path === '/api/ai/usage/today')) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->usageToday($ctx));
            }

            if ($method === 'POST' && $path === '/api/usage/log-message') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->logMessage($ctx, $jsonBody));
            }

            if ($method === 'GET' && $path === '/api/usage/dashboard-stats') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->dashboardStats($ctx, $query));
            }

            if ($method === 'POST' && $path === '/api/contacts/sync') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->syncContact($ctx, $jsonBody));
            }

            if ($method === 'GET' && preg_match('#^/api/contacts/(.+)/messages$#', $path, $matches) === 1) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->getContactMessages($ctx, rawurldecode($matches[1]), $query));
            }

            if ($method === 'GET' && $path === '/api/message-reply-status/check') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->checkMessageReplyStatus($ctx, $query));
            }

            if ($method === 'POST' && $path === '/api/message-reply-status/record') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->recordMessageReplyStatus($ctx, $jsonBody));
            }

            if ($method === 'GET' && preg_match('#^/api/knowledge/([a-f0-9-]+)$#i', $path, $matches) === 1) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->knowledgeList($ctx, $matches[1]));
            }

            if ($method === 'POST' && $path === '/api/knowledge/text') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->knowledgeAddText($ctx, $jsonBody));
            }

            if ($method === 'POST' && $path === '/api/knowledge/direct') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->knowledgeAddDirect($ctx, $jsonBody));
            }

            if ($method === 'POST' && $path === '/api/knowledge/extract') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->knowledgeExtractUrl($ctx, $jsonBody));
            }

            if ($method === 'POST' && $path === '/api/knowledge/pdf') {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->knowledgeAddPdf($ctx, $files));
            }

            if ($method === 'DELETE' && preg_match('#^/api/knowledge/([^/]+)$#', $path, $matches) === 1) {
                $ctx = $this->requireAuth($headers);
                return $this->ok($this->knowledgeDelete($ctx, rawurldecode($matches[1])));
            }

            return $this->error(404, 'Route not found.');
        } catch (HttpException $e) {
            return $this->error($e->getStatus(), $e->getMessage(), $e->getPayload());
        } catch (Throwable $e) {
            return $this->error(500, 'Internal server error.', ['details' => $e->getMessage()]);
        }
    }

    private function authLogin(array $body): array
    {
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        $workspaceId = trim((string) ($body['workspaceId'] ?? ''));

        if ($email === '' || $password === '') {
            throw new HttpException(400, 'Email and password are required.');
        }

        $user = $this->sbSelectOne('app_users', ['email' => 'eq.' . $email]);
        if ($user === null || !password_verify($password, (string) ($user['password_hash'] ?? ''))) {
            throw new HttpException(401, 'Invalid credentials.');
        }

        if ($workspaceId === '') {
            $member = $this->sbSelectOne(
                'app_workspace_members',
                ['user_id' => 'eq.' . $user['id']],
                'workspace_id,user_id,role',
                ['limit' => '1', 'order' => 'created_at.asc']
            );
            if ($member === null) {
                throw new HttpException(403, 'User has no workspace access.');
            }
            $workspaceId = (string) $member['workspace_id'];
        }

        $this->assertWorkspaceAccess((string) $user['id'], $workspaceId);
        $workspace = $this->getWorkspaceOrFail($workspaceId);

        return [
            'tokens' => $this->issueTokens((string) $user['id'], $workspaceId, true),
            'user' => $this->userPayload($user),
            'workspace' => $this->workspacePayload($workspace),
        ];
    }

    private function authRefresh(array $body): array
    {
        $refreshToken = trim((string) ($body['refreshToken'] ?? ''));
        if ($refreshToken === '') {
            throw new HttpException(400, 'refreshToken is required.');
        }

        $hash = hash('sha256', $refreshToken);
        $tokenRow = $this->sbSelectOne(
            'app_refresh_tokens',
            [
                'token_hash' => 'eq.' . $hash,
                'revoked_at' => 'is.null',
                'expires_at' => 'gt.' . $this->nowIso(),
            ],
            'id,user_id,workspace_id,expires_at',
            ['limit' => '1']
        );

        if ($tokenRow === null) {
            throw new HttpException(401, 'Refresh token is invalid or expired.');
        }

        $this->sbUpdateOne(
            'app_refresh_tokens',
            ['id' => 'eq.' . $tokenRow['id']],
            ['revoked_at' => $this->nowIso()],
            false
        );

        $user = $this->getUserOrFail((string) $tokenRow['user_id']);
        $workspace = $this->getWorkspaceOrFail((string) $tokenRow['workspace_id']);

        return [
            'tokens' => $this->issueTokens((string) $user['id'], (string) $workspace['id'], true),
            'user' => $this->userPayload($user),
            'workspace' => $this->workspacePayload($workspace),
        ];
    }

    private function authRegister(array $body): array
    {
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $fullName = trim((string) ($body['fullName'] ?? $body['name'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $workspaceName = trim((string) ($body['workspaceName'] ?? $body['companyName'] ?? ''));
        $whatsappPhone = trim((string) ($body['whatsappPhone'] ?? ''));
        // Self-registration is intentionally locked to Basic.
        $planCode = 'basic';

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException(400, 'A valid email is required.');
        }
        if ($fullName === '') {
            throw new HttpException(400, 'Full name is required.');
        }
        if (strlen($password) < 8) {
            throw new HttpException(400, 'Password must be at least 8 characters.');
        }
        if ($workspaceName === '') {
            throw new HttpException(400, 'Workspace name is required.');
        }

        $existing = $this->sbSelectOne('app_users', ['email' => 'eq.' . $email], 'id');
        if ($existing !== null) {
            throw new HttpException(409, 'An account with this email already exists.');
        }

        $plan = $this->getPlanByCode($planCode, true);
        if ($plan === null) {
            throw new HttpException(404, 'Basic plan is unavailable.');
        }

        $user = $this->sbInsertOne('app_users', [
            'email' => $email,
            'full_name' => $fullName,
            'password_hash' => password_hash($password, PASSWORD_BCRYPT),
            'is_active' => true,
            'created_at' => $this->nowIso(),
            'updated_at' => $this->nowIso(),
        ]);

        $workspace = $this->sbInsertOne('app_workspaces', array_merge([
            'owner_user_id' => $user['id'],
            'name' => $workspaceName,
            'whatsapp_phone' => $whatsappPhone !== '' ? $this->normalizePhone($whatsappPhone) : null,
            'created_at' => $this->nowIso(),
            'updated_at' => $this->nowIso(),
        ], $this->workspacePlanPatchFromPlan($plan)));

        $this->sbInsertOne('app_workspace_members', [
            'workspace_id' => $workspace['id'],
            'user_id' => $user['id'],
            'role' => 'owner',
            'created_at' => $this->nowIso(),
        ], true);

        $this->sbInsertOne('app_ai_configs', [
            'workspace_id' => $workspace['id'],
            'model' => $this->config['groq_chat_model'],
            'temperature' => 0.7,
            'max_tokens' => 500,
            'reply_delay' => 2000,
            'debounce_time' => 10000,
            'enabled' => true,
            'updated_at' => $this->nowIso(),
        ], true);

        return [
            'tokens' => $this->issueTokens((string) $user['id'], (string) $workspace['id'], true),
            'user' => $this->userPayload($user),
            'workspace' => $this->workspacePayload($workspace),
        ];
    }

    private function createWorkspace(array $ctx, array $body): array
    {
        $name = trim((string) ($body['name'] ?? ''));
        $whatsappPhone = trim((string) ($body['whatsappPhone'] ?? ''));

        if ($name === '') {
            throw new HttpException(400, 'Workspace name is required.');
        }

        $defaultPlan = $this->getDefaultPlan();

        $workspace = $this->sbInsertOne('app_workspaces', array_merge([
            'owner_user_id' => $ctx['user']['id'],
            'name' => $name,
            'whatsapp_phone' => $whatsappPhone !== '' ? $this->normalizePhone($whatsappPhone) : null,
            'created_at' => $this->nowIso(),
            'updated_at' => $this->nowIso(),
        ], $this->workspacePlanPatchFromPlan($defaultPlan)));

        $this->sbInsertOne('app_workspace_members', [
            'workspace_id' => $workspace['id'],
            'user_id' => $ctx['user']['id'],
            'role' => 'owner',
            'created_at' => $this->nowIso(),
        ], true);

        $this->sbInsertOne('app_ai_configs', [
            'workspace_id' => $workspace['id'],
            'model' => $this->config['groq_chat_model'],
            'temperature' => 0.7,
            'max_tokens' => 500,
            'reply_delay' => 2000,
            'debounce_time' => 10000,
            'enabled' => true,
            'updated_at' => $this->nowIso(),
        ], true);

        return ['workspace' => $this->workspacePayload($workspace)];
    }

    private function patchWorkspace(array $ctx, string $workspaceId, array $body): array
    {
        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);

        $patch = [];
        if (array_key_exists('name', $body)) {
            $name = trim((string) $body['name']);
            if ($name === '') {
                throw new HttpException(400, 'Workspace name cannot be empty.');
            }
            $patch['name'] = $name;
        }

        if (array_key_exists('whatsappPhone', $body)) {
            $value = trim((string) $body['whatsappPhone']);
            $patch['whatsapp_phone'] = $value !== '' ? $this->normalizePhone($value) : null;
        }

        if (empty($patch)) {
            $workspace = $this->getWorkspaceOrFail($workspaceId);
            return ['workspace' => $this->workspacePayload($workspace)];
        }

        $patch['updated_at'] = $this->nowIso();

        $updated = $this->sbUpdateOne('app_workspaces', ['id' => 'eq.' . $workspaceId], $patch);
        if ($updated === null) {
            throw new HttpException(404, 'Workspace not found.');
        }

        return ['workspace' => $this->workspacePayload($updated)];
    }

    private function switchWorkspace(array $ctx, array $body): array
    {
        $workspaceId = trim((string) ($body['workspaceId'] ?? ''));
        if ($workspaceId === '') {
            throw new HttpException(400, 'workspaceId is required.');
        }

        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);

        return [
            'accessToken' => $this->issueTokens((string) $ctx['user']['id'], $workspaceId, false)['accessToken'],
        ];
    }

    private function getWorkspaceByPhone(array $ctx, string $phone): array
    {
        $normalized = $this->normalizePhone($phone);
        $workspace = $this->sbSelectOne('app_workspaces', ['whatsapp_phone' => 'eq.' . $normalized]);

        if ($workspace === null) {
            throw new HttpException(404, 'Workspace not found for this phone.');
        }

        $this->assertWorkspaceAccess((string) $ctx['user']['id'], (string) $workspace['id']);

        return ['workspace' => $this->workspacePayload($workspace)];
    }

    private function recordExtensionInstallPing(array $ctx): array
    {
        $timestamp = $this->nowIso();

        $updated = $this->sbUpdateOne(
            'app_workspaces',
            ['id' => 'eq.' . $ctx['workspace']['id']],
            [
                'extension_install_whatsapp_sent_at' => $timestamp,
                'updated_at' => $timestamp,
            ]
        );

        if ($updated === null) {
            throw new HttpException(404, 'Workspace not found.');
        }

        return [
            'extensionInstallWhatsappSentAt' => $updated['extension_install_whatsapp_sent_at'] ?? $timestamp,
        ];
    }

    private function getAiDefaults(array $ctx): array
    {
        $row = $this->sbSelectOne('app_ai_configs', ['workspace_id' => 'eq.' . $ctx['workspace']['id']]);

        if ($row === null) {
            return [
                'model' => $this->config['groq_chat_model'],
                'replyDelay' => 2000,
                'debounceTime' => 10000,
                'maxTokens' => 500,
                'temperature' => 0.7,
            ];
        }

        return [
            'model' => (string) ($row['model'] ?? $this->config['groq_chat_model']),
            'replyDelay' => (int) ($row['reply_delay'] ?? 2000),
            'debounceTime' => (int) ($row['debounce_time'] ?? 10000),
            'maxTokens' => (int) ($row['max_tokens'] ?? 500),
            'temperature' => (float) ($row['temperature'] ?? 0.7),
        ];
    }

    private function proxyGroqChat(array $body): array
    {
        if (!isset($body['messages']) || !is_array($body['messages']) || count($body['messages']) === 0) {
            throw new HttpException(400, 'messages is required.');
        }

        $payload = $body;
        $payload['model'] = $this->config['groq_chat_model'];

        if (isset($payload['max_completion_tokens']) && !isset($payload['max_tokens'])) {
            $payload['max_tokens'] = (int) $payload['max_completion_tokens'];
        }

        $payload['stream'] = false;

        $res = $this->callGroqChat($payload);

        if (!$res['ok']) {
            $errorMessage = $this->extractGroqError($res) ?: 'Groq chat request failed.';
            return $this->error($res['status'] > 0 ? $res['status'] : 500, $errorMessage);
        }

        return [
            'status' => $res['status'],
            'body' => is_array($res['json']) ? $res['json'] : ['error' => ['message' => 'Invalid Groq response']],
        ];
    }

    private function proxyGroqTranscription(array $files): array
    {
        if (!isset($files['file']) || !is_array($files['file']) || (int) ($files['file']['error'] ?? 1) !== UPLOAD_ERR_OK) {
            throw new HttpException(400, 'Audio file is required.');
        }

        $res = $this->callGroqTranscription($files['file']);
        if (!$res['ok']) {
            $errorMessage = $this->extractGroqError($res) ?: 'Groq transcription request failed.';
            return $this->error($res['status'] > 0 ? $res['status'] : 500, $errorMessage);
        }

        return [
            'status' => $res['status'],
            'body' => is_array($res['json']) ? $res['json'] : ['error' => ['message' => 'Invalid Groq response']],
        ];
    }

    private function legacyAiReply(array $body): array
    {
        $customerMessage = trim((string) ($body['message'] ?? ''));
        $campaignGoal = trim((string) ($body['campaignGoal'] ?? ''));
        $history = $body['conversationHistory'] ?? [];

        if ($customerMessage === '') {
            throw new HttpException(400, 'message is required.');
        }

        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a helpful Mr CRM CRM assistant. Reply in the same language as the customer. Keep answers concise and practical. Campaign goal: ' . ($campaignGoal !== '' ? $campaignGoal : 'Provide helpful business support.'),
            ],
        ];

        if (is_array($history)) {
            foreach ($history as $msg) {
                if (!is_array($msg)) {
                    continue;
                }
                $role = (string) ($msg['role'] ?? 'user');
                $content = trim((string) ($msg['content'] ?? ''));
                if ($content === '') {
                    continue;
                }
                if (!in_array($role, ['system', 'user', 'assistant'], true)) {
                    $role = 'user';
                }
                $messages[] = [
                    'role' => $role,
                    'content' => $content,
                ];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $customerMessage];

        $res = $this->callGroqChat([
            'model' => $this->config['groq_chat_model'],
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 500,
            'stream' => false,
        ]);

        if (!$res['ok']) {
            $errorMessage = $this->extractGroqError($res) ?: 'AI reply generation failed.';
            return $this->error($res['status'] > 0 ? $res['status'] : 500, $errorMessage);
        }

        $data = is_array($res['json']) ? $res['json'] : [];
        $reply = (string) ($data['choices'][0]['message']['content'] ?? '');
        if ($reply === '') {
            return $this->error(502, 'AI returned an empty reply.');
        }

        $usage = $data['usage'] ?? [];

        return $this->ok([
            'reply' => $reply,
            'usage' => $usage,
            'tokens' => [
                'prompt' => (int) ($usage['prompt_tokens'] ?? 0),
                'completion' => (int) ($usage['completion_tokens'] ?? 0),
                'total' => (int) ($usage['total_tokens'] ?? 0),
            ],
        ]);
    }

    private function trackAiReply(array $ctx): array
    {
        $today = gmdate('Y-m-d');
        $counter = $this->getOrCreateUsageCounter((string) $ctx['workspace']['id'], $today);

        $used = (int) ($counter['ai_replies'] ?? 0);
        $limit = (int) ($ctx['workspace']['plan_ai_replies_per_day'] ?? 50);

        if ($limit !== -1 && $used >= $limit) {
            return [
                'status' => 429,
                'body' => [
                    'limitExceeded' => true,
                    'used' => $used,
                    'limit' => $limit,
                    'remainingAiReplies' => 0,
                    'planName' => (string) ($ctx['workspace']['plan_name'] ?? 'Basic'),
                ],
            ];
        }

        $newUsed = $used + 1;
        $this->sbUpdateOne('app_usage_counters', ['id' => 'eq.' . $counter['id']], [
            'ai_replies' => $newUsed,
            'updated_at' => $this->nowIso(),
        ], false);

        return $this->ok([
            'limitExceeded' => false,
            'used' => $newUsed,
            'limit' => $limit,
            'remainingAiReplies' => $limit === -1 ? -1 : max(0, $limit - $newUsed),
            'planName' => (string) ($ctx['workspace']['plan_name'] ?? 'Basic'),
        ]);
    }

    private function usageToday(array $ctx): array
    {
        $workspace = $ctx['workspace'];
        $workspaceId = (string) ($workspace['id'] ?? '');
        $today = gmdate('Y-m-d');
        $counter = $this->getOrCreateUsageCounter($workspaceId, $today);

        $messagesSent = (int) ($counter['messages_sent'] ?? 0);
        $aiReplies = (int) ($counter['ai_replies'] ?? 0);
        $dailyLimit = (int) ($workspace['plan_messages_per_day'] ?? 100);
        $aiRepliesLimit = (int) ($workspace['plan_ai_replies_per_day'] ?? 50);
        $contactsLimit = (int) ($workspace['plan_contacts_limit'] ?? $workspace['contacts_limit'] ?? 50);
        $campaignsPerMonth = (int) ($workspace['plan_campaigns_per_month'] ?? $workspace['campaigns_per_month'] ?? 5);

        $contactsUsed = $this->countWorkspaceContacts($workspaceId);
        $campaignsUsedThisMonth = $this->campaignsUsedThisMonth($workspaceId);

        $remainingMessages = $dailyLimit === -1 ? -1 : max(0, $dailyLimit - $messagesSent);
        $remainingAiReplies = $aiRepliesLimit === -1 ? -1 : max(0, $aiRepliesLimit - $aiReplies);
        $remainingContacts = $contactsLimit === -1 ? -1 : max(0, $contactsLimit - $contactsUsed);
        $remainingCampaigns = $campaignsPerMonth === -1 ? -1 : max(0, $campaignsPerMonth - $campaignsUsedThisMonth);

        return [
            'date' => $today,
            'messagesSent' => $messagesSent,
            'aiReplies' => $aiReplies,
            'dailyLimit' => $dailyLimit,
            'aiRepliesLimit' => $aiRepliesLimit,
            'contactsUsed' => $contactsUsed,
            'contactsLimit' => $contactsLimit,
            'campaignsUsedThisMonth' => $campaignsUsedThisMonth,
            'campaignsPerMonth' => $campaignsPerMonth,
            'planName' => (string) ($workspace['plan_name'] ?? 'Basic'),
            'remaining' => [
                'messages' => $remainingMessages,
                'aiReplies' => $remainingAiReplies,
                'contacts' => $remainingContacts,
                'campaigns' => $remainingCampaigns,
            ],
            'plan' => $this->workspacePayload($workspace)['plan'],
        ];
    }

    private function accountSubscription(array $ctx): array
    {
        $workspace = $this->getWorkspaceOrFail((string) ($ctx['workspace']['id'] ?? ''));
        $workspacePayload = $this->workspacePayload($workspace);

        return [
            'success' => true,
            'user' => $this->userPayload($ctx['user']),
            'workspace' => $workspacePayload,
            'currentPlan' => $workspacePayload['plan'],
            'usage' => $this->usageToday([
                'workspace' => $workspace,
                'user' => $ctx['user'],
            ]),
            'plans' => $this->getAvailablePlans(true),
        ];
    }

    private function upgradeSubscription(array $ctx, array $body): array
    {
        $workspaceId = (string) ($ctx['workspace']['id'] ?? '');
        if ($workspaceId === '') {
            throw new HttpException(400, 'Invalid workspace.');
        }

        $this->assertWorkspaceBillingAccess((string) $ctx['user']['id'], $workspaceId);

        $planId = trim((string) ($body['planId'] ?? ''));
        $planCode = trim((string) ($body['planCode'] ?? ''));
        if ($planId === '' && $planCode === '') {
            throw new HttpException(400, 'planId or planCode is required.');
        }

        $plan = $this->getPlanByIdOrCode($planId, $planCode, true);
        if ($plan === null) {
            throw new HttpException(404, 'Requested plan was not found.');
        }

        $updated = $this->sbUpdateOne(
            'app_workspaces',
            ['id' => 'eq.' . $workspaceId],
            array_merge($this->workspacePlanPatchFromPlan($plan), [
                'updated_at' => $this->nowIso(),
            ])
        );

        if ($updated === null) {
            throw new HttpException(404, 'Workspace not found.');
        }

        $workspacePayload = $this->workspacePayload($updated);

        return [
            'success' => true,
            'message' => 'Subscription updated successfully.',
            'workspace' => $workspacePayload,
            'currentPlan' => $workspacePayload['plan'],
            'usage' => $this->usageToday([
                'workspace' => $updated,
                'user' => $ctx['user'],
            ]),
        ];
    }

    private function logMessage(array $ctx, array $body): array
    {
        $phone = trim((string) ($body['phoneNumber'] ?? ''));
        if ($phone === '') {
            throw new HttpException(400, 'phoneNumber is required.');
        }

        $direction = strtolower(trim((string) ($body['direction'] ?? 'outbound')));
        if (!in_array($direction, ['inbound', 'outbound'], true)) {
            $direction = 'outbound';
        }

        $messageTs = $this->parseTimestamp($body['timestamp'] ?? null);

        $this->sbInsertOne('app_message_logs', [
            'workspace_id' => $ctx['workspace']['id'],
            'message_id' => isset($body['messageId']) ? (string) $body['messageId'] : null,
            'phone_number' => $this->normalizePhone($phone),
            'contact_name' => isset($body['contactName']) ? (string) $body['contactName'] : null,
            'content' => isset($body['content']) ? (string) $body['content'] : null,
            'type' => isset($body['type']) ? (string) $body['type'] : 'message',
            'direction' => $direction,
            'status' => isset($body['status']) ? (string) $body['status'] : null,
            'is_ai_generated' => (bool) ($body['isAIGenerated'] ?? false),
            'ai_generation_time_ms' => isset($body['aiGenerationTimeMs']) ? (int) $body['aiGenerationTimeMs'] : null,
            'campaign_id' => isset($body['campaignId']) ? (string) $body['campaignId'] : null,
            'flow_id' => isset($body['flowId']) ? (string) $body['flowId'] : null,
            'metadata' => is_array($body['metadata'] ?? null) ? $body['metadata'] : new stdClass(),
            'created_at' => $this->nowIso(),
            'message_timestamp' => $messageTs,
        ]);

        if ($direction === 'outbound') {
            $today = gmdate('Y-m-d');
            $counter = $this->getOrCreateUsageCounter((string) $ctx['workspace']['id'], $today);
            $newCount = ((int) ($counter['messages_sent'] ?? 0)) + 1;
            $this->sbUpdateOne('app_usage_counters', ['id' => 'eq.' . $counter['id']], [
                'messages_sent' => $newCount,
                'updated_at' => $this->nowIso(),
            ], false);
        }

        return ['success' => true];
    }

    private function dashboardStats(array $ctx, array $query): array
    {
        $period = strtolower(trim((string) ($query['period'] ?? '7days')));
        $startIso = $this->periodStartIso($period);

        $filters = [
            'workspace_id' => 'eq.' . $ctx['workspace']['id'],
        ];
        if ($startIso !== null) {
            $filters['created_at'] = 'gte.' . $startIso;
        }

        $rows = $this->sbSelectRows(
            'app_message_logs',
            $filters,
            'id,phone_number,direction,type,is_ai_generated,ai_generation_time_ms,created_at,campaign_id,flow_id,status,content',
            ['order' => 'created_at.desc', 'limit' => '5000']
        );

        $outgoing = 0;
        $incoming = 0;
        $aiReplies = 0;
        $totalAiTime = 0;
        $totalAiCount = 0;
        $uniqueRecipients = [];
        $messageActivity = [];
        $sources = [
            'direct' => 0,
            'campaigns' => 0,
            'scheduled' => 0,
            'flows' => 0,
        ];

        foreach ($rows as $row) {
            $direction = strtolower((string) ($row['direction'] ?? 'outbound'));
            if ($direction === 'inbound') {
                $incoming++;
            } else {
                $outgoing++;
            }

            if (($row['phone_number'] ?? '') !== '') {
                $uniqueRecipients[(string) $row['phone_number']] = true;
            }

            if ((bool) ($row['is_ai_generated'] ?? false) === true) {
                $aiReplies++;
                $ms = (int) ($row['ai_generation_time_ms'] ?? 0);
                if ($ms > 0) {
                    $totalAiTime += $ms;
                    $totalAiCount++;
                }
            }

            $dateKey = substr((string) ($row['created_at'] ?? ''), 0, 10);
            if ($dateKey !== '') {
                if (!isset($messageActivity[$dateKey])) {
                    $messageActivity[$dateKey] = ['date' => $dateKey, 'outgoing' => 0, 'incoming' => 0];
                }
                if ($direction === 'inbound') {
                    $messageActivity[$dateKey]['incoming']++;
                } else {
                    $messageActivity[$dateKey]['outgoing']++;
                }
            }

            if (!empty($row['flow_id'])) {
                $sources['flows']++;
            } elseif (!empty($row['campaign_id'])) {
                $sources['campaigns']++;
            } elseif (strtolower((string) ($row['type'] ?? '')) === 'scheduled') {
                $sources['scheduled']++;
            } else {
                $sources['direct']++;
            }
        }

        ksort($messageActivity);
        $activityList = array_values($messageActivity);
        $responseRate = $outgoing > 0 ? round(($incoming / max(1, $outgoing)) * 100, 1) : 0.0;

        $recentRows = array_slice($rows, 0, 20);
        $recentActivity = array_map(static function (array $row): array {
            return [
                'id' => $row['id'] ?? null,
                'timestamp' => $row['created_at'] ?? null,
                'type' => $row['type'] ?? 'message',
                'direction' => $row['direction'] ?? 'outbound',
                'phoneNumber' => $row['phone_number'] ?? null,
                'status' => $row['status'] ?? null,
                'content' => $row['content'] ?? null,
            ];
        }, $recentRows);

        return [
            'success' => true,
            'period' => $period,
            'stats' => [
                'outgoingMessages' => $outgoing,
                'incomingMessages' => $incoming,
                'uniqueRecipients' => count($uniqueRecipients),
                'responseRate' => $responseRate,
                'aiReplies' => $aiReplies,
                'avgAIResponse' => $totalAiCount > 0 ? round($totalAiTime / $totalAiCount) : 0,
                'activeFlows' => 0,
                'knowledgeBase' => 0,
            ],
            'messageActivity' => $activityList,
            'messageSources' => $sources,
            'campaignsOverview' => [
                'total' => 0,
                'draft' => 0,
                'scheduled' => 0,
                'active' => 0,
                'completed' => 0,
                'running' => 0,
                'paused' => 0,
                'failed' => 0,
            ],
            'recentActivity' => $recentActivity,
        ];
    }

    private function syncContact(array $ctx, array $body): array
    {
        $phone = trim((string) ($body['phoneNumber'] ?? ''));
        if ($phone === '') {
            throw new HttpException(400, 'phoneNumber is required.');
        }

        $workspaceId = (string) ($ctx['workspace']['id'] ?? '');
        $normalizedPhone = $this->normalizePhone($phone);

        $existingContact = $this->sbSelectOne('app_contacts', [
            'workspace_id' => 'eq.' . $workspaceId,
            'phone_number' => 'eq.' . $normalizedPhone,
        ], 'id');

        $contactsLimit = (int) (
            $ctx['workspace']['plan_contacts_limit']
            ?? $ctx['workspace']['contacts_limit']
            ?? 50
        );

        if ($existingContact === null && $contactsLimit !== -1) {
            $currentCount = $this->countWorkspaceContacts($workspaceId);
            if ($currentCount >= $contactsLimit) {
                throw new HttpException(429, 'Contact limit reached for your current plan.', [
                    'limitExceeded' => true,
                    'type' => 'contacts',
                    'used' => $currentCount,
                    'limit' => $contactsLimit,
                    'planName' => (string) ($ctx['workspace']['plan_name'] ?? 'Basic'),
                ]);
            }
        }

        $row = [
            'workspace_id' => $workspaceId,
            'phone_number' => $normalizedPhone,
            'name' => isset($body['name']) ? trim((string) $body['name']) : null,
            'tags' => is_array($body['tags'] ?? null) ? array_values($body['tags']) : [],
            'status' => isset($body['status']) ? (string) $body['status'] : 'new_lead',
            'notes' => isset($body['notes']) ? (string) $body['notes'] : null,
            'last_message_at' => $this->parseTimestamp($body['lastMessageAt'] ?? null) ?? $this->nowIso(),
            'updated_at' => $this->nowIso(),
        ];

        $res = $this->supabase->upsert(
            'app_contacts',
            [$row],
            ['on_conflict' => 'workspace_id,phone_number'],
            ['Prefer' => 'resolution=merge-duplicates,return=representation']
        );
        $this->ensureSupabaseSuccess($res, 'Failed to sync contact.');

        $contact = is_array($res['json']) && isset($res['json'][0]) && is_array($res['json'][0]) ? $res['json'][0] : null;

        return [
            'success' => true,
            'contact' => $contact,
        ];
    }

    private function getContactMessages(array $ctx, string $phone, array $query): array
    {
        $limit = max(1, min(200, (int) ($query['limit'] ?? 30)));
        $offset = max(0, (int) ($query['offset'] ?? 0));
        $normalized = $this->normalizePhone($phone);

        $baseFilters = [
            'workspace_id' => 'eq.' . $ctx['workspace']['id'],
            'phone_number' => 'eq.' . $normalized,
        ];

        $countRows = $this->sbSelectRows('app_message_logs', $baseFilters, 'id');
        $total = count($countRows);

        $rows = $this->sbSelectRows(
            'app_message_logs',
            $baseFilters,
            'id,content,direction,type,status,is_ai_generated,message_timestamp,created_at,campaign_id,flow_id',
            [
                'order' => 'message_timestamp.desc',
                'limit' => (string) $limit,
                'offset' => (string) $offset,
            ]
        );

        return [
            'success' => true,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
            'messages' => $rows,
        ];
    }

    private function checkMessageReplyStatus(array $ctx, array $query): array
    {
        $messageId = trim((string) ($query['messageId'] ?? ''));
        if ($messageId === '') {
            throw new HttpException(400, 'messageId is required.');
        }

        $row = $this->sbSelectOne('app_message_reply_status', [
            'workspace_id' => 'eq.' . $ctx['workspace']['id'],
            'message_id' => 'eq.' . $messageId,
        ]);

        if ($row === null) {
            return ['handled' => false];
        }

        return [
            'handled' => (bool) ($row['handled'] ?? true),
            'status' => (string) ($row['status'] ?? 'replied'),
        ];
    }

    private function recordMessageReplyStatus(array $ctx, array $body): array
    {
        $rows = [];

        if (isset($body['entries']) && is_array($body['entries'])) {
            foreach ($body['entries'] as $entry) {
                if (!is_array($entry)) {
                    continue;
                }
                $messageId = trim((string) ($entry['messageId'] ?? ''));
                $status = strtolower(trim((string) ($entry['status'] ?? '')));
                if ($messageId === '' || !in_array($status, ['replied', 'skipped'], true)) {
                    continue;
                }
                $rows[] = [
                    'workspace_id' => $ctx['workspace']['id'],
                    'message_id' => $messageId,
                    'status' => $status,
                    'updated_at' => $this->nowIso(),
                ];
            }
        }

        if (empty($rows)) {
            $messageId = trim((string) ($body['messageId'] ?? ''));
            $status = strtolower(trim((string) ($body['status'] ?? '')));
            if ($messageId !== '' && in_array($status, ['replied', 'skipped'], true)) {
                $rows[] = [
                    'workspace_id' => $ctx['workspace']['id'],
                    'message_id' => $messageId,
                    'status' => $status,
                    'updated_at' => $this->nowIso(),
                ];
            }
        }

        if (empty($rows)) {
            throw new HttpException(400, 'No valid message reply status entries provided.');
        }

        $res = $this->supabase->upsert(
            'app_message_reply_status',
            $rows,
            ['on_conflict' => 'workspace_id,message_id'],
            ['Prefer' => 'resolution=merge-duplicates,return=representation']
        );
        $this->ensureSupabaseSuccess($res, 'Failed to record message reply status.');

        return [
            'ok' => true,
            'count' => count($rows),
        ];
    }

    private function knowledgeList(array $ctx, string $workspaceId): array
    {
        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);
        $entries = $this->knowledgeLoadWorkspaceEntries($workspaceId);

        usort($entries, static function (array $a, array $b): int {
            $left = strtotime((string) ($a['createdAt'] ?? '')) ?: 0;
            $right = strtotime((string) ($b['createdAt'] ?? '')) ?: 0;
            return $right <=> $left;
        });

        return [
            'success' => true,
            'knowledgeBases' => $entries,
        ];
    }

    private function knowledgeAddText(array $ctx, array $body): array
    {
        $workspaceId = trim((string) ($body['workspaceId'] ?? ''));
        if ($workspaceId === '') {
            throw new HttpException(400, 'workspaceId is required.');
        }
        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);

        $content = trim((string) ($body['content'] ?? ''));
        if ($content === '') {
            throw new HttpException(400, 'content is required.');
        }

        $title = trim((string) ($body['title'] ?? ''));
        if ($title === '') {
            $title = 'Text entry';
        }

        $extractedData = [
            'description' => substr($content, 0, 1200),
            'raw_text' => substr($content, 0, 12000),
            'source_type' => 'text',
        ];

        $entry = $this->knowledgeBuildEntry([
            'title' => $title,
            'type' => 'text',
            'sourceUrl' => 'manual',
            'extractedData' => $extractedData,
        ]);

        $this->knowledgeUpsertEntry($workspaceId, $entry);

        return [
            'success' => true,
            'knowledgeBase' => $entry,
        ];
    }

    private function knowledgeAddDirect(array $ctx, array $body): array
    {
        $workspaceId = trim((string) ($body['workspaceId'] ?? ''));
        if ($workspaceId === '') {
            throw new HttpException(400, 'workspaceId is required.');
        }
        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);

        $title = trim((string) ($body['title'] ?? ''));
        if ($title === '') {
            $title = 'Knowledge entry';
        }

        $id = trim((string) ($body['id'] ?? ''));
        $type = trim((string) ($body['type'] ?? 'direct'));
        $source = trim((string) ($body['source'] ?? 'direct'));
        $extractedData = is_array($body['extractedData'] ?? null) ? $body['extractedData'] : [];

        $entry = $this->knowledgeBuildEntry([
            'id' => $id !== '' ? $id : null,
            'title' => $title,
            'type' => $type,
            'sourceUrl' => $source,
            'extractedData' => $extractedData,
        ]);

        $this->knowledgeUpsertEntry($workspaceId, $entry);

        return [
            'success' => true,
            'knowledgeBase' => $entry,
        ];
    }

    private function knowledgeExtractUrl(array $ctx, array $body): array
    {
        $workspaceId = trim((string) ($body['workspaceId'] ?? ''));
        if ($workspaceId === '') {
            throw new HttpException(400, 'workspaceId is required.');
        }
        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);

        $url = trim((string) ($body['url'] ?? ''));
        if ($url === '') {
            throw new HttpException(400, 'url is required.');
        }
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new HttpException(400, 'Invalid URL.');
        }

        $rawText = '';
        try {
            $fetch = $this->http->request('GET', $url, [], null, [
                'User-Agent' => 'Mozilla/5.0 Mr CRM Knowledge Extractor',
                'Accept' => 'text/html,application/xhtml+xml',
            ], false);
            if ($fetch['ok'] === true) {
                $html = (string) ($fetch['body'] ?? '');
                $rawText = $this->extractReadableTextFromHtml($html);
            }
        } catch (Throwable) {
            $rawText = '';
        }

        if ($rawText === '') {
            $rawText = 'Imported source URL: ' . $url;
        }

        $title = parse_url($url, PHP_URL_HOST);
        if (!is_string($title) || $title === '') {
            $title = 'Website content';
        }

        $entry = $this->knowledgeBuildEntry([
            'title' => $title,
            'type' => 'url',
            'sourceUrl' => $url,
            'extractedData' => [
                'company_name' => $title,
                'description' => substr($rawText, 0, 1200),
                'raw_text' => substr($rawText, 0, 16000),
                'source_url' => $url,
            ],
        ]);

        $this->knowledgeUpsertEntry($workspaceId, $entry);

        return [
            'success' => true,
            'knowledgeBase' => $entry,
        ];
    }

    private function knowledgeAddPdf(array $ctx, array $files): array
    {
        $workspaceId = trim((string) ($_POST['workspaceId'] ?? ''));
        if ($workspaceId === '') {
            throw new HttpException(400, 'workspaceId is required.');
        }
        $this->assertWorkspaceAccess((string) $ctx['user']['id'], $workspaceId);

        if (!isset($files['file']) || !is_array($files['file']) || (int) ($files['file']['error'] ?? 1) !== UPLOAD_ERR_OK) {
            throw new HttpException(400, 'PDF file is required.');
        }

        $filename = trim((string) ($files['file']['name'] ?? 'document.pdf'));
        if ($filename === '') {
            $filename = 'document.pdf';
        }

        $entry = $this->knowledgeBuildEntry([
            'title' => $filename,
            'type' => 'pdf',
            'sourceUrl' => $filename,
            'extractedData' => [
                'description' => 'PDF uploaded: ' . $filename,
                'raw_text' => 'PDF uploaded: ' . $filename,
                'source_type' => 'pdf',
            ],
        ]);

        $this->knowledgeUpsertEntry($workspaceId, $entry);

        return [
            'success' => true,
            'knowledgeBase' => $entry,
        ];
    }

    private function knowledgeDelete(array $ctx, string $knowledgeId): array
    {
        $workspaceId = (string) ($ctx['workspace']['id'] ?? '');
        if ($workspaceId === '') {
            throw new HttpException(400, 'Invalid workspace.');
        }

        $entries = $this->knowledgeLoadWorkspaceEntries($workspaceId);
        $remaining = array_values(array_filter($entries, static function (array $item) use ($knowledgeId): bool {
            return (string) ($item['id'] ?? '') !== $knowledgeId;
        }));

        $this->knowledgeSaveWorkspaceEntries($workspaceId, $remaining);

        return [
            'success' => true,
            'id' => $knowledgeId,
        ];
    }

    private function knowledgeBuildEntry(array $input): array
    {
        $id = trim((string) ($input['id'] ?? ''));
        if ($id === '') {
            $id = $this->generateUuidV4();
        }

        $title = trim((string) ($input['title'] ?? 'Knowledge entry'));
        $type = trim((string) ($input['type'] ?? 'text'));
        $sourceUrl = trim((string) ($input['sourceUrl'] ?? $type));
        $extractedData = is_array($input['extractedData'] ?? null) ? $input['extractedData'] : [];

        return [
            'id' => $id,
            'title' => $title,
            'type' => $type,
            'sourceUrl' => $sourceUrl,
            'extractedData' => $extractedData,
            'createdAt' => $this->nowIso(),
        ];
    }

    private function knowledgeUpsertEntry(string $workspaceId, array $entry): void
    {
        $entries = $this->knowledgeLoadWorkspaceEntries($workspaceId);
        $updated = [];
        $replaced = false;

        foreach ($entries as $existing) {
            if ((string) ($existing['id'] ?? '') === (string) ($entry['id'] ?? '')) {
                $updated[] = array_merge($existing, $entry, ['createdAt' => $existing['createdAt'] ?? $entry['createdAt']]);
                $replaced = true;
                continue;
            }
            $updated[] = $existing;
        }

        if (!$replaced) {
            $updated[] = $entry;
        }

        $this->knowledgeSaveWorkspaceEntries($workspaceId, $updated);
    }

    private function knowledgeLoadWorkspaceEntries(string $workspaceId): array
    {
        $filePath = $this->knowledgeFilePath($workspaceId);
        if (!is_file($filePath)) {
            return [];
        }

        $raw = file_get_contents($filePath);
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return [];
        }

        $entries = [];
        foreach ($decoded as $row) {
            if (!is_array($row)) {
                continue;
            }
            $id = trim((string) ($row['id'] ?? ''));
            if ($id === '') {
                continue;
            }
            $entries[] = [
                'id' => $id,
                'title' => (string) ($row['title'] ?? 'Knowledge entry'),
                'type' => (string) ($row['type'] ?? 'text'),
                'sourceUrl' => (string) ($row['sourceUrl'] ?? ($row['type'] ?? 'text')),
                'extractedData' => is_array($row['extractedData'] ?? null) ? $row['extractedData'] : [],
                'createdAt' => (string) ($row['createdAt'] ?? $this->nowIso()),
            ];
        }

        return $entries;
    }

    private function knowledgeSaveWorkspaceEntries(string $workspaceId, array $entries): void
    {
        $filePath = $this->knowledgeFilePath($workspaceId);
        $dir = dirname($filePath);
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new HttpException(500, 'Unable to create knowledge storage directory.');
        }

        $json = json_encode(array_values($entries), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false || file_put_contents($filePath, $json) === false) {
            throw new HttpException(500, 'Unable to persist knowledge entries.');
        }
    }

    private function knowledgeFilePath(string $workspaceId): string
    {
        $safeWorkspaceId = preg_replace('/[^a-zA-Z0-9_-]/', '_', $workspaceId) ?? 'workspace';
        return dirname(__DIR__) . '/storage/knowledge/' . $safeWorkspaceId . '.json';
    }

    private function extractReadableTextFromHtml(string $html): string
    {
        $withoutScripts = preg_replace('#<script\b[^>]*>.*?</script>#is', ' ', $html) ?? $html;
        $withoutStyles = preg_replace('#<style\b[^>]*>.*?</style>#is', ' ', $withoutScripts) ?? $withoutScripts;
        $text = strip_tags($withoutStyles);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text) ?? $text;
        return trim($text);
    }

    private function generateUuidV4(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12)
        );
    }

    private function requireAuth(array $headers): array
    {
        $token = $this->extractBearerToken($headers);
        if ($token === null) {
            throw new HttpException(401, 'Missing Bearer token.');
        }

        $payload = Jwt::decode($token, $this->config['app_jwt_secret']);
        if (($payload['typ'] ?? '') !== 'access') {
            throw new HttpException(401, 'Invalid access token type.');
        }

        $userId = trim((string) ($payload['sub'] ?? ''));
        $workspaceId = trim((string) ($payload['wid'] ?? $payload['workspace_id'] ?? ''));

        if ($userId === '' || $workspaceId === '') {
            throw new HttpException(401, 'Invalid token payload.');
        }

        $user = $this->getUserOrFail($userId);
        $workspace = $this->getWorkspaceOrFail($workspaceId);

        $this->assertWorkspaceAccess($userId, $workspaceId);

        return [
            'payload' => $payload,
            'user' => $user,
            'workspace' => $workspace,
        ];
    }

    private function issueTokens(string $userId, string $workspaceId, bool $includeRefresh): array
    {
        $now = time();
        $accessExp = $now + max(300, (int) $this->config['access_token_ttl_seconds']);

        $accessToken = Jwt::encode([
            'iss' => 'smartdm-php-backend',
            'sub' => $userId,
            'wid' => $workspaceId,
            'typ' => 'access',
            'iat' => $now,
            'exp' => $accessExp,
        ], $this->config['app_jwt_secret']);

        $result = ['accessToken' => $accessToken];

        if ($includeRefresh) {
            $refreshToken = rtrim(strtr(base64_encode(random_bytes(48)), '+/', '-_'), '=');
            $refreshExp = gmdate('c', $now + (86400 * max(1, (int) $this->config['refresh_token_ttl_days'])));

            $this->sbInsertOne('app_refresh_tokens', [
                'user_id' => $userId,
                'workspace_id' => $workspaceId,
                'token_hash' => hash('sha256', $refreshToken),
                'expires_at' => $refreshExp,
                'created_at' => $this->nowIso(),
            ]);

            $result['refreshToken'] = $refreshToken;
        }

        return $result;
    }

    private function getOrCreateUsageCounter(string $workspaceId, string $date): array
    {
        $row = $this->sbSelectOne('app_usage_counters', [
            'workspace_id' => 'eq.' . $workspaceId,
            'date' => 'eq.' . $date,
        ]);

        if ($row !== null) {
            return $row;
        }

        try {
            return $this->sbInsertOne('app_usage_counters', [
                'workspace_id' => $workspaceId,
                'date' => $date,
                'messages_sent' => 0,
                'ai_replies' => 0,
                'campaigns_created' => 0,
                'updated_at' => $this->nowIso(),
            ]);
        } catch (HttpException $e) {
            if ($e->getStatus() === 409) {
                $retry = $this->sbSelectOne('app_usage_counters', [
                    'workspace_id' => 'eq.' . $workspaceId,
                    'date' => 'eq.' . $date,
                ]);
                if ($retry !== null) {
                    return $retry;
                }
            }
            throw $e;
        }
    }

    private function callGroqChat(array $payload): array
    {
        return $this->http->request(
            'POST',
            'https://api.groq.com/openai/v1/chat/completions',
            [],
            $payload,
            [
                'Authorization' => 'Bearer ' . $this->config['groq_api_key'],
            ],
            true
        );
    }

    private function callGroqTranscription(array $file): array
    {
        $tmp = (string) ($file['tmp_name'] ?? '');
        $name = (string) ($file['name'] ?? 'audio.ogg');
        $type = (string) ($file['type'] ?? 'audio/ogg');

        if ($tmp === '' || !is_file($tmp)) {
            throw new HttpException(400, 'Invalid uploaded audio file.');
        }

        $ch = curl_init('https://api.groq.com/openai/v1/audio/transcriptions');
        if ($ch === false) {
            throw new RuntimeException('Failed to initialize cURL for transcription.');
        }

        $responseHeaders = [];
        $postFields = [
            'file' => new CURLFile($tmp, $type, $name),
            'model' => $this->config['groq_stt_model'],
        ];

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_CONNECTTIMEOUT => 20,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->config['groq_api_key'],
            ],
            CURLOPT_HEADERFUNCTION => static function ($curl, string $header) use (&$responseHeaders): int {
                $len = strlen($header);
                $parts = explode(':', $header, 2);
                if (count($parts) === 2) {
                    $name = strtolower(trim($parts[0]));
                    $value = trim($parts[1]);
                    $responseHeaders[$name] = $value;
                }
                return $len;
            },
        ]);

        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new RuntimeException('Groq transcription request failed: ' . $error);
        }

        $json = null;
        if ($raw !== '') {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $json = $decoded;
            }
        }

        return [
            'ok' => $status >= 200 && $status < 300,
            'status' => $status,
            'headers' => $responseHeaders,
            'body' => $raw,
            'json' => $json,
        ];
    }

    private function extractGroqError(array $res): ?string
    {
        if (!isset($res['json']) || !is_array($res['json'])) {
            return null;
        }
        $json = $res['json'];
        if (isset($json['error']['message']) && is_string($json['error']['message'])) {
            return $json['error']['message'];
        }
        if (isset($json['message']) && is_string($json['message'])) {
            return $json['message'];
        }
        return null;
    }

    private function getUserOrFail(string $userId): array
    {
        $user = $this->sbSelectOne('app_users', ['id' => 'eq.' . $userId]);
        if ($user === null) {
            throw new HttpException(401, 'User not found.');
        }
        return $user;
    }

    private function getWorkspaceOrFail(string $workspaceId): array
    {
        $workspace = $this->sbSelectOne('app_workspaces', ['id' => 'eq.' . $workspaceId]);
        if ($workspace === null) {
            throw new HttpException(401, 'Workspace not found.');
        }
        return $workspace;
    }

    private function assertWorkspaceAccess(string $userId, string $workspaceId): void
    {
        $member = $this->sbSelectOne('app_workspace_members', [
            'workspace_id' => 'eq.' . $workspaceId,
            'user_id' => 'eq.' . $userId,
        ]);

        if ($member !== null) {
            return;
        }

        $workspace = $this->sbSelectOne('app_workspaces', ['id' => 'eq.' . $workspaceId], 'id,owner_user_id');
        if ($workspace !== null && (string) ($workspace['owner_user_id'] ?? '') === $userId) {
            return;
        }

        throw new HttpException(403, 'You do not have access to this workspace.');
    }

    private function extractBearerToken(array $headers): ?string
    {
        $authHeader = '';
        foreach ($headers as $key => $value) {
            if (strtolower((string) $key) === 'authorization') {
                $authHeader = (string) $value;
                break;
            }
        }

        if ($authHeader === '' && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = (string) $_SERVER['HTTP_AUTHORIZATION'];
        }

        if ($authHeader === '') {
            return null;
        }

        if (stripos($authHeader, 'Bearer ') !== 0) {
            return null;
        }

        return trim(substr($authHeader, 7));
    }

    private function sbSelectRows(string $table, array $filters = [], string $select = '*', array $extra = []): array
    {
        $query = array_merge(['select' => $select], $filters, $extra);
        $res = $this->supabase->select($table, $query);
        $this->ensureSupabaseSuccess($res, 'Database select failed.');

        if (!is_array($res['json'])) {
            return [];
        }

        return array_values(array_filter($res['json'], static fn($v): bool => is_array($v)));
    }

    private function sbSelectOne(
        string $table,
        array $filters = [],
        string $select = '*',
        array $extra = []
    ): ?array {
        $rows = $this->sbSelectRows($table, $filters, $select, array_merge(['limit' => '1'], $extra));
        return $rows[0] ?? null;
    }

    private function sbInsertOne(string $table, array $row, bool $ignoreConflict = false): array
    {
        $headers = ['Prefer' => 'return=representation'];
        if ($ignoreConflict) {
            $headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
        }

        $res = $this->supabase->insert($table, [$row], [], $headers);
        $this->ensureSupabaseSuccess($res, 'Database insert failed.');

        if (!is_array($res['json']) || !isset($res['json'][0]) || !is_array($res['json'][0])) {
            throw new HttpException(500, 'Unexpected insert response from database.');
        }

        return $res['json'][0];
    }

    private function sbUpdateOne(
        string $table,
        array $filters,
        array $data,
        bool $expectRow = true
    ): ?array {
        $res = $this->supabase->update($table, $data, $filters, ['Prefer' => 'return=representation']);
        $this->ensureSupabaseSuccess($res, 'Database update failed.');

        if (!is_array($res['json']) || !isset($res['json'][0]) || !is_array($res['json'][0])) {
            return $expectRow ? null : [];
        }

        return $res['json'][0];
    }

    private function ensureSupabaseSuccess(array $res, string $fallbackMessage): void
    {
        if ($res['ok'] === true) {
            return;
        }

        $status = (int) ($res['status'] ?? 500);
        $message = $fallbackMessage;

        if (isset($res['json']) && is_array($res['json'])) {
            if (isset($res['json']['message']) && is_string($res['json']['message'])) {
                $message = $res['json']['message'];
            } elseif (isset($res['json']['error']) && is_string($res['json']['error'])) {
                $message = $res['json']['error'];
            }
        }

        throw new HttpException($status > 0 ? $status : 500, $message, ['supabase' => $res['json'] ?? null]);
    }

    private function periodStartIso(string $period): ?string
    {
        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

        return match ($period) {
            'today' => $now->setTime(0, 0)->format(DateTimeInterface::ATOM),
            '7days' => $now->sub(new DateInterval('P7D'))->format(DateTimeInterface::ATOM),
            '30days' => $now->sub(new DateInterval('P30D'))->format(DateTimeInterface::ATOM),
            'all' => null,
            default => $now->sub(new DateInterval('P7D'))->format(DateTimeInterface::ATOM),
        };
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return trim($phone);
        }
        return '+' . $digits;
    }

    private function parseTimestamp(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            $num = (float) $value;
            if ($num > 1000000000000) {
                $num = floor($num / 1000);
            }
            return gmdate('c', (int) $num);
        }

        $ts = strtotime((string) $value);
        if ($ts === false) {
            return null;
        }

        return gmdate('c', $ts);
    }

    private function getAvailablePlans(bool $activeOnly = true): array
    {
        $filters = [];
        if ($activeOnly) {
            $filters['is_active'] = 'eq.true';
        }

        try {
            $rows = $this->sbSelectRows(
                'app_plans',
                $filters,
                'id,code,name,description,price_monthly,messages_per_day,ai_replies_per_day,contacts_limit,campaigns_per_month,is_active,is_default,sort_order,created_at,updated_at',
                ['order' => 'sort_order.asc']
            );

            if (!empty($rows)) {
                return array_map(fn(array $row): array => $this->mapPlanRow($row), $rows);
            }
        } catch (Throwable) {
            // Fall back to built-in plans when database migration has not been applied yet.
        }

        $fallback = $this->fallbackPlans();
        if ($activeOnly) {
            $fallback = array_values(array_filter($fallback, static fn(array $plan): bool => (bool) ($plan['isActive'] ?? false)));
        }

        return $fallback;
    }

    private function getPlanByCode(string $planCode, bool $activeOnly = true): ?array
    {
        $needle = strtolower(trim($planCode));
        if ($needle === '') {
            return null;
        }

        foreach ($this->getAvailablePlans($activeOnly) as $plan) {
            if (strtolower((string) ($plan['code'] ?? '')) === $needle) {
                return $plan;
            }
        }

        return null;
    }

    private function getPlanByIdOrCode(string $planId, string $planCode, bool $activeOnly = true): ?array
    {
        $planId = trim($planId);
        $planCode = strtolower(trim($planCode));

        foreach ($this->getAvailablePlans($activeOnly) as $plan) {
            if ($planId !== '' && (string) ($plan['id'] ?? '') === $planId) {
                return $plan;
            }
            if ($planCode !== '' && strtolower((string) ($plan['code'] ?? '')) === $planCode) {
                return $plan;
            }
        }

        return null;
    }

    private function getDefaultPlan(): array
    {
        $plans = $this->getAvailablePlans(true);
        foreach ($plans as $plan) {
            if ((bool) ($plan['isDefault'] ?? false)) {
                return $plan;
            }
        }

        if (!empty($plans)) {
            return $plans[0];
        }

        return $this->fallbackPlans()[0];
    }

    private function mapPlanRow(array $row): array
    {
        return [
            'id' => (string) ($row['id'] ?? ''),
            'code' => strtolower((string) ($row['code'] ?? '')),
            'name' => (string) ($row['name'] ?? ''),
            'description' => (string) ($row['description'] ?? ''),
            'priceMonthly' => (float) ($row['price_monthly'] ?? 0),
            'messagesPerDay' => (int) ($row['messages_per_day'] ?? 100),
            'aiRepliesPerDay' => (int) ($row['ai_replies_per_day'] ?? 50),
            'contactsLimit' => (int) ($row['contacts_limit'] ?? 50),
            'campaignsPerMonth' => (int) ($row['campaigns_per_month'] ?? 5),
            'isActive' => $this->parseBool($row['is_active'] ?? true, true),
            'isDefault' => $this->parseBool($row['is_default'] ?? false, false),
            'sortOrder' => (int) ($row['sort_order'] ?? 100),
        ];
    }

    private function fallbackPlans(): array
    {
        return [
            [
                'id' => null,
                'code' => 'basic',
                'name' => 'Basic',
                'description' => 'Great for getting started',
                'priceMonthly' => 0.0,
                'messagesPerDay' => 100,
                'aiRepliesPerDay' => 50,
                'contactsLimit' => 50,
                'campaignsPerMonth' => 5,
                'isActive' => true,
                'isDefault' => true,
                'sortOrder' => 10,
            ],
            [
                'id' => null,
                'code' => 'premium',
                'name' => 'Premium',
                'description' => 'For growing teams that need higher limits',
                'priceMonthly' => 29.0,
                'messagesPerDay' => 1000,
                'aiRepliesPerDay' => 500,
                'contactsLimit' => 2000,
                'campaignsPerMonth' => 100,
                'isActive' => true,
                'isDefault' => false,
                'sortOrder' => 20,
            ],
            [
                'id' => null,
                'code' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'Unlimited usage and priority support',
                'priceMonthly' => 99.0,
                'messagesPerDay' => -1,
                'aiRepliesPerDay' => -1,
                'contactsLimit' => -1,
                'campaignsPerMonth' => -1,
                'isActive' => true,
                'isDefault' => false,
                'sortOrder' => 30,
            ],
        ];
    }

    private function workspacePlanPatchFromPlan(array $plan): array
    {
        return [
            'plan_id' => ($plan['id'] ?? null) ?: null,
            'plan_name' => (string) ($plan['name'] ?? 'Basic'),
            'plan_messages_per_day' => max(-1, (int) ($plan['messagesPerDay'] ?? 100)),
            'plan_ai_replies_per_day' => max(-1, (int) ($plan['aiRepliesPerDay'] ?? 50)),
            'plan_price_monthly' => max(0.0, (float) ($plan['priceMonthly'] ?? 0)),
            'plan_contacts_limit' => max(-1, (int) ($plan['contactsLimit'] ?? 50)),
            'plan_campaigns_per_month' => max(-1, (int) ($plan['campaignsPerMonth'] ?? 5)),
        ];
    }

    private function buildPlanRowFromInput(array $input, bool $isCreate, array $existing = []): array
    {
        $code = strtolower(trim((string) ($input['code'] ?? ($existing['code'] ?? ''))));
        $name = trim((string) ($input['name'] ?? ($existing['name'] ?? '')));
        $description = trim((string) ($input['description'] ?? ($existing['description'] ?? '')));

        if ($isCreate && $code === '') {
            throw new HttpException(400, 'Plan code is required.');
        }
        if ($code !== '' && preg_match('/^[a-z0-9][a-z0-9_-]{1,31}$/', $code) !== 1) {
            throw new HttpException(400, 'Plan code must start with a letter/number and only include lowercase letters, numbers, _ or - characters.');
        }
        if ($name === '') {
            throw new HttpException(400, 'Plan name is required.');
        }

        $priceInput = $input['priceMonthly'] ?? $input['price_monthly'] ?? ($existing['price_monthly'] ?? 0);
        $priceMonthly = (float) $priceInput;
        if ($priceMonthly < 0) {
            throw new HttpException(400, 'priceMonthly must be 0 or greater.');
        }

        $messagesPerDay = $this->parseLimitValue(
            $input['messagesPerDay'] ?? $input['messages_per_day'] ?? ($existing['messages_per_day'] ?? 100),
            'messagesPerDay'
        );
        $aiRepliesPerDay = $this->parseLimitValue(
            $input['aiRepliesPerDay'] ?? $input['ai_replies_per_day'] ?? ($existing['ai_replies_per_day'] ?? 50),
            'aiRepliesPerDay'
        );
        $contactsLimit = $this->parseLimitValue(
            $input['contactsLimit'] ?? $input['contacts_limit'] ?? ($existing['contacts_limit'] ?? 50),
            'contactsLimit'
        );
        $campaignsPerMonth = $this->parseLimitValue(
            $input['campaignsPerMonth'] ?? $input['campaigns_per_month'] ?? ($existing['campaigns_per_month'] ?? 5),
            'campaignsPerMonth'
        );

        $isActiveDefault = $this->parseBool($existing['is_active'] ?? true, true);
        $isDefaultDefault = $this->parseBool($existing['is_default'] ?? false, false);
        $isActive = $this->parseBool(
            $input['isActive'] ?? $input['is_active'] ?? $isActiveDefault,
            $isActiveDefault
        );
        $isDefault = $this->parseBool(
            $input['isDefault'] ?? $input['is_default'] ?? $isDefaultDefault,
            $isDefaultDefault
        );

        $sortOrder = (int) ($input['sortOrder'] ?? $input['sort_order'] ?? ($existing['sort_order'] ?? 100));

        $row = [
            'code' => $code,
            'name' => $name,
            'description' => $description,
            'price_monthly' => round($priceMonthly, 2),
            'messages_per_day' => $messagesPerDay,
            'ai_replies_per_day' => $aiRepliesPerDay,
            'contacts_limit' => $contactsLimit,
            'campaigns_per_month' => $campaignsPerMonth,
            'is_active' => $isActive,
            'is_default' => $isDefault,
            'sort_order' => $sortOrder,
            'updated_at' => $this->nowIso(),
        ];

        if ($isCreate) {
            $row['created_at'] = $this->nowIso();
        }

        return $row;
    }

    private function parseLimitValue(mixed $value, string $field): int
    {
        if ($value === null || $value === '') {
            throw new HttpException(400, $field . ' is required.');
        }

        $parsed = (int) $value;
        if ($parsed < -1) {
            throw new HttpException(400, $field . ' must be -1 or greater.');
        }

        return $parsed;
    }

    private function parseBool(mixed $value, bool $default = false): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_int($value) || is_float($value)) {
            return (int) $value === 1;
        }

        $normalized = strtolower(trim((string) $value));
        if ($normalized === '') {
            return $default;
        }

        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }
        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return false;
        }

        return $default;
    }

    private function clearDefaultPlans(?string $excludePlanId = null): void
    {
        $filters = ['is_default' => 'eq.true'];
        if ($excludePlanId !== null && $excludePlanId !== '') {
            $filters['id'] = 'neq.' . $excludePlanId;
        }

        $res = $this->supabase->update(
            'app_plans',
            [
                'is_default' => false,
                'updated_at' => $this->nowIso(),
            ],
            $filters,
            ['Prefer' => 'return=minimal']
        );
        $this->ensureSupabaseSuccess($res, 'Failed to update default plan flags.');
    }

    private function countWorkspaceContacts(string $workspaceId): int
    {
        if ($workspaceId === '') {
            return 0;
        }

        $rows = $this->sbSelectRows('app_contacts', ['workspace_id' => 'eq.' . $workspaceId], 'id');
        return count($rows);
    }

    private function campaignsUsedThisMonth(string $workspaceId): int
    {
        if ($workspaceId === '') {
            return 0;
        }

        $rows = $this->sbSelectRows(
            'app_usage_counters',
            ['workspace_id' => 'eq.' . $workspaceId],
            'date,campaigns_created',
            ['limit' => '400']
        );

        $month = gmdate('Y-m');
        $used = 0;
        foreach ($rows as $row) {
            $date = (string) ($row['date'] ?? '');
            if (!str_starts_with($date, $month)) {
                continue;
            }
            $used += (int) ($row['campaigns_created'] ?? 0);
        }

        return $used;
    }

    private function assertWorkspaceBillingAccess(string $userId, string $workspaceId): void
    {
        $workspace = $this->sbSelectOne('app_workspaces', ['id' => 'eq.' . $workspaceId], 'id,owner_user_id');
        if ($workspace === null) {
            throw new HttpException(404, 'Workspace not found.');
        }

        if ((string) ($workspace['owner_user_id'] ?? '') === $userId) {
            return;
        }

        $member = $this->sbSelectOne('app_workspace_members', [
            'workspace_id' => 'eq.' . $workspaceId,
            'user_id' => 'eq.' . $userId,
        ], 'role');

        $role = strtolower((string) ($member['role'] ?? ''));
        if (in_array($role, ['owner', 'admin'], true)) {
            return;
        }

        throw new HttpException(403, 'Only workspace owners/admins can manage subscription plans.');
    }

    private function workspacePayload(array $workspace): array
    {
        $planName = (string) ($workspace['plan_name'] ?? 'Basic');
        $planCode = strtolower(trim((string) ($workspace['plan_code'] ?? '')));
        if ($planCode === '') {
            $slug = strtolower((string) preg_replace('/[^a-z0-9]+/', '-', $planName));
            $planCode = trim($slug, '-');
            if ($planCode === '') {
                $planCode = 'basic';
            }
        }

        return [
            'id' => (string) ($workspace['id'] ?? ''),
            'name' => (string) ($workspace['name'] ?? ''),
            'whatsappPhone' => $workspace['whatsapp_phone'] ?? null,
            'extensionInstallWhatsappSentAt' => $workspace['extension_install_whatsapp_sent_at'] ?? null,
            'plan' => [
                'id' => ($workspace['plan_id'] ?? null) !== null ? (string) $workspace['plan_id'] : null,
                'code' => $planCode,
                'name' => $planName,
                'priceMonthly' => (float) ($workspace['plan_price_monthly'] ?? 0),
                'messagesPerDay' => (int) ($workspace['plan_messages_per_day'] ?? 100),
                'aiRepliesPerDay' => (int) ($workspace['plan_ai_replies_per_day'] ?? 50),
                // Frontend expects these fields.
                'contactsLimit' => (int) (
                    $workspace['plan_contacts_limit']
                    ?? $workspace['contacts_limit']
                    ?? 50
                ),
                'campaignsPerMonth' => (int) (
                    $workspace['plan_campaigns_per_month']
                    ?? $workspace['campaigns_per_month']
                    ?? 5
                ),
            ],
        ];
    }

    private function userPayload(array $user): array
    {
        return [
            'id' => (string) ($user['id'] ?? ''),
            'email' => (string) ($user['email'] ?? ''),
            'name' => (string) ($user['full_name'] ?? ''),
        ];
    }

    private function normalizePath(string $path): string
    {
        $path = '/' . ltrim($path, '/');
        if ($path !== '/') {
            $path = rtrim($path, '/');
        }
        return $path;
    }

    private function nowIso(): string
    {
        return gmdate('c');
    }

    private function ok(array $body, int $status = 200): array
    {
        return [
            'status' => $status,
            'body' => $body,
        ];
    }

    private function error(int $status, string $message, array $extra = []): array
    {
        return [
            'status' => $status,
            'body' => array_merge(['error' => $message], $extra),
        ];
    }
}
