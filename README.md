# Clustr Trading Console

**The AI trader operating console for DeepSeek Harness.**

Clustr Trading Console turns a trading request into a traceable workflow: collect current market and account evidence, run user-selected analysis, apply deterministic risk rules, request approval for a write, submit through the selected exchange adapter, reconcile the resulting order state, and record the outcome in Session Tape.

[![npm](https://img.shields.io/npm/v/@clustrai/trading-console?label=npm)](https://www.npmjs.com/package/@clustrai/trading-console)
[![license](https://img.shields.io/badge/license-Apache--2.0-6f5cff)](./LICENSE)

## Install in one command

```bash
npx @clustrai/trading-console@latest install --profile web
```

Wait until the terminal prints **Clustr Trading Console installation complete**, then restart DeepSeek Harness Web. The first download can take tens of seconds.

In Harness:

1. Complete the Harness model-access setup if this is a new installation. This key gives Harness access to a language model; it is separate from any exchange credential.
2. Create a new conversation and select **Clustr Trading Console** from **Agent Preset**.
3. Open **Clustr Settings**, create a named exchange account, and run **Test Connection**.
4. Verify and save the account. Start with a read-only API key.
5. Ask an account, market, analysis, or planning question. Execution remains locked until the user explicitly opens a bounded execution window.

The installer supports macOS, Windows 10/11, and Linux desktop with the same npm package. See [Installation and first use](./INSTALLATION.md) for operating-system requirements, update, removal, and troubleshooting.

## Why Clustr

- **Trading-aware context:** market structure, account state, positions, risk boundaries, and order status are presented as separate facts.
- **User-activated analysis:** twelve analysis systems run only when selected and always include evidence, counter-evidence, key levels, and invalidation conditions.
- **Controlled execution:** exchange/account scope, fresh data, risk permits, single-use approval, stable client order IDs, and timeout reconciliation sit between model intent and an exchange write.
- **Session Tape:** trading instructions, decision nodes, response time, order state, and verified slippage are recorded in a redacted, standardized timeline.
- **Local credential custody:** exchange secrets stay in macOS Keychain, Windows Credential Manager, or Linux Secret Service and never return to the browser after saving.

## Activation and isolation

Installing the plugin does not replace the default DeepSeek Harness experience. New sessions continue to use the built-in `cordis` preset unless the user selects **Clustr Trading Console** from the Agent Preset selector. The Clustr background, trading hero, safety status, and console context are mounted only in sessions whose preset is `crypto-trader`.

Preset selection is session-scoped. Different workspaces can therefore contain ordinary Harness sessions and Clustr trading sessions at the same time. A session that already contains messages keeps its original preset; create a new session to change modes without mixing trading instructions into an unrelated conversation.

## Capabilities

- Clustr experience across the Harness sidebar, session header, input dock, conversation view, settings, and agent preset
- OKX public/account/spot/swap tools through the official OKX Agent Trade Kit MCP
- searchable instrument catalogs and candlestick loading across OKX, Binance, Bybit, and Hyperliquid
- separate account balance and position views for every connected exchange profile
- native account adapters for OKX, Binance Spot/USDⓈ-M, and Bybit Unified accounts
- signed Binance Spot and USDⓈ-M order placement, query, cancellation, and risk-reducing futures close through the official REST API
- Bybit Spot, Linear, and Inverse order placement, query, cancellation, pre-check, and risk-reducing close through the official Bybit Trading MCP
- cross-exchange price consensus with source freshness and dispersion warnings
- twelve user-activated market-analysis methods with standardized evidence, counter-evidence, levels, events, and invalidation output
- structured trade theses, role-based disagreement records, comparison scenarios, time-bounded K-line replay, trading memory, and decision provenance
- deterministic position-size and strategy-expectancy calculators
- per-order risk limits and one-time Harness approval for every enabled write
- atomic consumption of autonomy scope and single-use risk permits, stable client order IDs, timeout reconciliation, and a global emergency stop
- one Clustr plugin package with automatic credential-vault selection: macOS Keychain, Windows Credential Manager, or Linux Secret Service; secrets never enter command arguments and never return to the browser after saving
- proxy-aware exchange networking that honors explicit or environment proxy settings and automatically detects the macOS HTTP/HTTPS system proxy
- persistent, redacted decision provenance plus a session-scoped trading-instruction tape with response-time and verified-slippage metrics

## Security defaults

- read-only mode is enabled by default; an eligible user may explicitly select one named OKX, Binance, or Bybit account and enable a time-bounded, approval-gated execution window from Settings
- execution unlock is limited to exactly one exchange/profile pair, 1–30 instruments, a maximum order count, a per-trade risk ceiling, and an automatic expiry; restoring read-only revokes unused permits and returns autonomy to Observe
- withdrawals, transfers, deposits, and address-whitelist mutations are permanently outside the tool catalog
- tools without a trustworthy MCP `readOnlyHint` are blocked rather than guessed
- local APIs require loopback host and client addresses; credential mutations additionally require same-origin JSON requests and a per-process CSRF token
- API credentials are never stored in the preset, plugin config, localStorage, chat history, or audit log
- exchange SDK versions are pinned exactly
- credentials are tested against the exchange before they are stored; keys with withdrawal or transfer capability are rejected

For exchange API keys, start with read-only access. If execution is required, enable only Read + Trade, apply an IP allowlist, use a dedicated sub-account, and keep withdrawal permissions disabled.

## Exchange capability boundaries

| Exchange | Account connection | Private account reading | Trade execution |
| --- | --- | --- | --- |
| OKX | API key, secret, passphrase; multiple named profiles | Balances and positions | OKX Agent Trade Kit behind a time-bounded user unlock, risk permit, scoped autonomy, and Harness one-time approval |
| Binance | API key and secret; multiple named profiles | Spot balances plus USDⓈ-M account and positions | Signed official Spot and USDⓈ-M REST endpoints behind exact-account authorization, exchange filters, fresh data, risk permits, one-time approval, stable client IDs, and timeout reconciliation |
| Bybit | API key and secret; multiple named Live or Testnet profiles | Unified wallet, open orders, and common linear/inverse positions through V5 | Pinned official Bybit Trading MCP behind exact-account authorization, official Linear pre-check, fresh same-environment data, risk permits, one-time approval, stable order-link IDs, and realtime/history reconciliation |
| Hyperliquid | Not available | Not available | Public market data remains available; account connection and execution are not exposed in this release |

The Exchanges surface represents account connectivity, not a claim about where chart data is sourced. Market venue is selected separately in the instrument search. Account material saved, account readable, and execution enabled are distinct states. Hyperliquid account connection is not available, and Clustr never asks for a Hyperliquid private key or seed phrase.

## Fast-path agent runtime

Clustr exposes ten task-level tools to a Clustr session: context, market packet, analysis, risk, order, thesis, simulation, memory, provenance, and operating status. Raw exchange methods and general development tools remain outside the model-facing catalog. They are composed behind the task-level tools so the agent sees a small, stable interface while the deterministic execution chain keeps its original checks.

Requests follow an intent-specific path:

- account, balance, position, quote, connection, and status questions use the lowest reasoning budget and may return immediately after the required read;
- market analysis, trading plans, and explicit order work use a higher reasoning budget;
- deep, adversarial, and stress-test requests use the maximum reasoning budget;
- market analysis consumes a compact market packet containing freshness, trend, volatility, support/resistance, spread, and depth evidence instead of inserting raw candle arrays into the conversation;
- recurring heartbeat timestamps do not change the system prompt. Only meaningful execution, autonomy, emergency-stop, account, or uncertain-order changes advance the prompt state version.

This routing changes response cost and latency, not safety authority. Model reasoning never replaces the risk kernel, scoped autonomy, one-time approval, execution-account check, or order reconciliation state machine.

## Installation and verification

Requirements: DeepSeek Harness Web, Node.js 22.19 or newer, and pnpm 10.33. Private account connections additionally require the native credential vault for the current operating system:

- macOS: Keychain and the bundled Security Framework helper;
- Windows 10/11: Windows Credential Manager through Windows PowerShell;
- Linux desktop: an unlocked Secret Service provider and the `secret-tool` command, commonly supplied by `libsecret-tools` or the distribution equivalent.

The plugin package is the same on every operating system and selects the backend from `process.platform` and `process.arch`. If the matching vault is missing, locked, or unsupported, public market features remain available while credential saving and private account access fail closed. Clustr never falls back to `.env`, plaintext JSON, browser storage, or an unencrypted file.

The package includes a Clustr installer because DeepSeek Harness keeps user-authored agent presets outside npm package directories. The installer adds the exact package version through the official DSH plugin command and then atomically installs the `crypto-trader` preset without silently overwriting local edits:

```bash
npx @clustrai/trading-console@latest install --profile web
```

Restart DeepSeek Harness Web after installation. Open Clustr Settings, choose a venue, enter a named profile, and use **Test Connection** before **Verify and Save**.

Create exchange credentials with Read permission only. If OKX, Binance, or Bybit execution is intentionally enabled later, create a separate key with Read + Trade, disable Withdraw/Transfer, bind the actual network egress IP, and use a dedicated sub-account. Select Bybit Testnet when saving a test credential; its MCP process, account reads, instruments, and prices remain isolated from Live. Clustr never silently mixes test and live environments.

The equivalent explicit two-step installation is:

```bash
dsh plugin --profile web add @clustrai/trading-console
npx @clustrai/trading-console setup
```

To uninstall, remove both the DSH bundle and its managed preset:

```bash
npx @clustrai/trading-console@latest uninstall --profile web
```

To update, run the installation command again. npm resolves `@latest`, Harness replaces the installed bundle, and the installer updates only an unmodified Clustr-managed preset:

```bash
npx @clustrai/trading-console@latest install --profile web
```

Before uninstalling, remove connected accounts in Clustr Settings if the corresponding operating-system vault entries should also be deleted. Plugin removal does not claim to erase credentials that remain in the OS vault.

The installer refuses to overwrite or delete a locally modified preset. `--force` is explicit and recoverable: the previous preset is moved to a timestamped backup instead of being erased.

For a source checkout, run `pnpm install`, followed by `pnpm run release:check`. The command builds the browser bundle, runs the complete test suite and release gate, and prints the exact npm tarball contents without publishing them.

Example patch:

```yaml
- insert:
    - id: clustr-trading-console
      name: '@clustrai/trading-console'
      config:
        okxProfile: demo
        readOnly: true
        allowUserExecutionUnlock: true
        maxExecutionUnlockMinutes: 480
        useSystemProxy: true
        modules: [market, account, spot, swap]
```

On macOS, Clustr automatically reads the enabled system HTTP/HTTPS proxy. On every platform, `HTTPS_PROXY`, `HTTP_PROXY`, and `NO_PROXY` are honored. An explicit `proxyUrl` can be configured when necessary; proxy credentials are redacted from status responses. Clustr never switches to an unknown third-party proxy.

Clustr keeps a non-secret account index at `~/.dsh/clustr/credential-index.json`. The index contains only exchange and profile names so Linux can restore named account rows without enumerating or exporting Secret Service values. Actual API credentials remain exclusively in the operating-system vault.

## Cross-platform release contract

Clustr Trading Console is one product and one plugin version. The common UI, agent tools, risk kernel, account adapters, and execution policy are shared across platforms; only the credential-vault backend changes. Marketplace installation should remain a single **Install** action. Offline distributions may use platform-labelled archives, but every archive must carry the same plugin version and source revision.

Before a cross-platform release, CI must run the common test suite plus native integration jobs on macOS, Windows, and Linux. Each job must verify save, read, restart persistence, locked-vault refusal, deletion confirmation, secret absence from argv/stdout/stderr/logs/audit/HTTP responses, and fail-closed behavior when the vault is unavailable.

The settings action **Query Current Network Egress IP** contacts `api.ipify.org` only when the user clicks it. The result helps configure an exchange IP allowlist; no exchange credentials are sent to that service.

## Operating Core

Clustr organizes trading work across nine connected capability layers:

1. multi-source market intelligence
2. structured collaborative judgment records
3. persistent trade theses and evidence
4. comparison scenarios
5. time-bounded K-line replay
6. deterministic risk evaluation and single-use permits
7. scoped, expiring autonomy levels
8. local trading memory and outcome review
9. redacted decision provenance

The analysis toolbox includes Wyckoff, Elliott Wave candidates, ATR-standardized Gann angles, Dow Theory, Ichimoku, Fibonacci retracement, Volume Profile, SMC structure, Turtle/Donchian breakout, Bollinger + RSI + MACD, SuperTrend + ADX/ATR, and VWAP + OBV + MFI. Every method is user-activated and never runs merely because a chart is visible. A heuristic structure score is not a calibrated probability. Formula sources and method limits are documented in [ANALYSIS_METHODS.md](./ANALYSIS_METHODS.md).

The plugin does not patch DeepSeek Harness core files. Every surface is registered through Harness services and slots so uninstalling the plugin restores the original product.
