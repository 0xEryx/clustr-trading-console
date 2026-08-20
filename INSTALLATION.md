# Clustr Trading Console: Installation and First Use

This guide covers installation from npm into DeepSeek Harness Web, the first Clustr session, exchange connection, updates, and removal.

## 1. Requirements

- DeepSeek Harness Web installed locally
- Node.js 22.19 or newer
- pnpm 10.33
- a supported local credential vault for private exchange accounts:
  - macOS: Keychain
  - Windows 10/11: Credential Manager and Windows PowerShell
  - Linux desktop: an unlocked Secret Service provider and `secret-tool`

Public market functions remain available when the local credential vault is unavailable. Credential saving and private account access fail closed; Clustr does not fall back to plaintext files, `.env`, chat history, or browser storage.

## 2. Install

Open a terminal and run:

```bash
npx @clustrai/trading-console@latest install --profile web
```

The first installation downloads the npm package and its pinned dependencies. It can take tens of seconds. Do not close the terminal before the completion message appears.

The installer performs two operations:

1. adds the exact Clustr package version through the DeepSeek Harness plugin command;
2. installs the Clustr-managed `crypto-trader` Agent Preset without replacing a user-modified preset.

Restart DeepSeek Harness Web after installation.

## 3. Create the first Clustr session

If Harness presents its own model/API Key setup, complete that first. The Harness model key authorizes language-model access; it is not an OKX, Binance, or Bybit credential.

Then:

1. select or create a workspace;
2. start a new conversation;
3. open **Agent Preset**;
4. select **Clustr Trading Console**;
5. create the conversation.

Clustr is session-scoped. Existing ordinary Harness conversations remain ordinary conversations. A Clustr session receives the Clustr icon and Console surface; selecting another preset for a new session does not activate trading features.

## 4. Connect an exchange account

Open **Clustr Settings** and select OKX, Binance, or Bybit. Create a named profile so balances and positions from different accounts remain distinguishable.

Use this sequence:

1. create a dedicated exchange API key;
2. enable **Read** only for the first connection;
3. disable **Withdraw** and **Transfer**;
4. bind the actual network egress IP when the exchange supports an IP allowlist;
5. enter the credential in Clustr Settings;
6. run **Test Connection**;
7. choose **Verify and Save** only after the test succeeds.

Clustr validates credentials before storing them. Keys with withdrawal or transfer capability are rejected. Saved secrets stay in the operating-system vault and do not return to the browser.

Hyperliquid account connection and execution are currently unavailable. Clustr does not ask for a Hyperliquid private key or seed phrase.

## 5. Enable execution only when needed

Read-only is the default. A user can explicitly open a time-bounded execution window for one named OKX, Binance, or Bybit account. The window is limited by exchange, profile, instruments, order count, risk ceiling, and expiry.

Every eligible write still requires:

- current market and account data;
- exchange filters and instrument metadata;
- a deterministic risk permit;
- valid autonomy scope;
- a one-time Harness approval;
- order-state reconciliation after submission.

Eligibility does not mean approval, exchange acceptance, or fill. Clustr reports these order states separately.

## 6. Verify the installation

```bash
npx @clustrai/trading-console@latest doctor
```

Inside Harness, verify that:

- **Clustr Trading Console** appears in Agent Preset;
- a Clustr session shows the Clustr Console entry;
- ordinary sessions remain isolated from the Console;
- Settings shows separate market, account, and execution states.

## 7. Update

Run the installation command again:

```bash
npx @clustrai/trading-console@latest install --profile web
```

Restart DeepSeek Harness Web after the command completes. The installer refuses to overwrite a locally modified Clustr preset unless the user explicitly supplies `--force`; when forced, the existing preset is moved to a timestamped backup.

## 8. Remove

If exchange credentials should be deleted, first remove each connected account in Clustr Settings. This deletes the corresponding operating-system vault record and verifies the deletion outcome.

Then run:

```bash
npx @clustrai/trading-console@latest uninstall --profile web
```

Restart Harness. The Clustr bundle and an unmodified Clustr-managed preset are removed. Ordinary Harness sessions and user workspaces remain intact.

## Troubleshooting

### The install command appears idle

The first `npx` run may spend several seconds resolving and downloading packages before it prints progress. Wait for either the completion message or a concrete error.

### The preset does not appear

Restart DeepSeek Harness Web, then run the doctor command. Confirm that the installation and the running Harness use the same DSH home directory.

### Exchange connection test fails

Check the exchange, environment, API-key permissions, passphrase where applicable, system time, and IP allowlist. A saved credential is not proof that account reading is healthy; use the explicit connection test and account status.

### Account reads work but execution is unavailable

Execution requires a supported exchange, a key with Read + Trade and no withdrawal/transfer capability, an active bounded execution window, fresh data, and per-write approval. Account connection, account reading, and execution readiness are separate states.

### Network access is restricted

Clustr honors `HTTPS_PROXY`, `HTTP_PROXY`, and `NO_PROXY`; macOS system HTTP/HTTPS proxy settings are detected automatically. Use an explicit trusted proxy only when required. Clustr never selects an unknown third-party proxy.

## Support and security

- Source and issues: <https://github.com/0xEryx/clustr-trading-console>
- npm package: <https://www.npmjs.com/package/@clustrai/trading-console>
- Security reporting: see [SECURITY.md](./SECURITY.md)
