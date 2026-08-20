# Security Policy

## Protected data

Exchange API keys, secret keys, and passphrases are credentials. Clustr Trading Console stores them in the operating-system credential vault and keeps only connection metadata in UI state.

Hyperliquid account connection and execution are not available. Public market data does not require account credentials. Clustr Trading Console rejects Hyperliquid private keys and seed phrases.

Never paste credentials into a conversation, issue, screenshot, log, preset, or configuration committed to source control.

## Permission policy

- Default: public market data or read-only account access.
- Optional: trade permission only through an exchange-specific controlled connector, with per-order risk checks and one-time user approval.
- Prohibited: withdrawal, transfer, deposit-address management, and address-whitelist permissions.

Use a dedicated exchange sub-account, an IP allowlist, and the narrowest available API permissions. Test changes in a supported demo or testnet environment before live use.

## Operating-system credential vaults

The same Clustr plugin automatically selects macOS Keychain, Windows Credential Manager, or Linux Secret Service. Secrets are sent to platform helpers through standard input and never through command arguments. Linux requires an unlocked Secret Service provider and `secret-tool`; a missing or locked vault disables credential operations without creating a plaintext fallback.

Clustr stores a non-secret credential index containing only exchange and profile names. The index never contains API keys, secret keys, passphrases, signatures, or private keys.

## Runtime credential boundary

Vault writes receive secret material over standard input, never through command arguments. Private REST account reads use credentials only in process memory. The official OKX Agent Trade Kit accepts credentials through the child-process environment, so an enabled OKX bridge receives its selected profile in its private environment while it is running. Clustr never writes those environment values into shell configuration, plugin configuration, logs, browser responses, or the decision tape.

An operating-system vault cannot protect credentials from malware that already controls the same logged-in user or can inspect same-user process memory. Use dedicated sub-accounts, exchange-side IP allowlists, narrow permissions, low limits, and prompt revocation when compromise is suspected.

Windows and Linux backend protocol tests run on every platform, but native Windows Credential Manager and Linux Secret Service integration tests must run on their respective operating systems before release. A simulated protocol test on macOS is not evidence that a native backend is production-ready.

The public installer passes `--ignore-scripts` to the DSH package-manager operation. Clustr and its runtime dependencies are distributed as prebuilt artifacts; dependency lifecycle scripts are not allowed to execute during installation. Preset installation is a separate, explicit Clustr action with conflict detection, atomic replacement, and recoverable backups for forced changes.

The optional network-egress diagnostic sends a credential-free request to `api.ipify.org` only after the user activates that check. It returns the public IP seen through the configured proxy so the user can update an exchange allowlist.

## Credential exposure response

If a key appears in a chat, issue, screenshot, clipboard history, terminal recording, or log, revoke it at the exchange immediately. Deleting it from Clustr only removes the local copy; it does not revoke the exchange credential.

## Reporting a vulnerability

Do not open a public issue containing credentials, account identifiers, order details, or an exploitable proof of concept. Use the private security-reporting channel configured by the project owner before public release.
