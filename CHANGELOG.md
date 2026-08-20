# Changelog

All notable changes to Clustr Trading Console are documented here. Versions follow Semantic Versioning.

## 0.7.1 — 2026-08-21

- Added a complete first-use guide for npm installation, Harness preset activation, exchange connection, updates, removal, and troubleshooting.
- Added explicit post-install instructions to the installer output.
- Added public repository, issue tracker, and homepage metadata to the npm package.
- Clarified the separation between Harness model credentials, exchange credentials, account connectivity, account reading, and execution readiness.

## 0.7.0 — 2026-08-21

- Added approval-gated Bybit Spot, Linear, and Inverse execution through the pinned official Bybit Trading MCP server.
- Added a strict MCP tool allowlist, official order pre-check for Linear contracts, stable `orderLinkId` values, ACK-versus-fill separation, and realtime/history reconciliation without blind resubmission.
- Added Bybit Live/Testnet credential isolation, official instrument and ticker hydration, inverse-contract notional handling, account-permission verification, and Session Tape coverage.
- Added deterministic tests for MCP argument mapping, tool isolation, order acknowledgment, history fallback, pre-check, close-position behavior, and linear/inverse risk math.

## 0.6.0 — 2026-08-20

- Added approval-gated Binance Spot and USDⓈ-M order placement, status query, cancellation, and risk-reducing futures close through official signed REST endpoints.
- Bound every execution window and model order instruction to one explicit exchange/profile pair; ambiguous or mismatched venue intent now fails closed.
- Added Binance server-time synchronization, symbol filter enforcement, stable client order IDs, persistent lifecycle recording, timeout reconciliation, and rate-limit/error classification.
- Added deterministic tests for HMAC signatures, secret redaction, spot/futures mappings, unknown outcomes, permission rejection, clock skew, exchange filters, and authorization routing.

## 0.5.0 — 2026-08-20

- Added one cross-exchange orders and positions workbench for connected accounts, current positions, live exchange orders, and Clustr-tracked order lifecycles.
- Added a persistent order state machine covering validation, approval, submission, exchange acknowledgement, partial fills, cancellation, rejection, uncertain outcomes, reconciliation, and manual review.
- Added timeout-safe order reconciliation with stable client order IDs, exponential backoff, explicit unknown states, and a strict no-blind-retry guarantee.
- Connected the OKX execution path to persistent lifecycle recording and exposed session-scoped refresh and reconciliation controls in the Console.

## 0.4.0 — 2026-08-20

- Added a twelve-method, user-activated market analysis toolbox with standardized evidence, counter-evidence, levels, invalidation, and explicit heuristic-score semantics.
- Simplified Trading Intelligence to a single Market Analysis entry and removed preset-query hero actions.
- Added a persistent, redacted Session Tape for standardized trading-instruction replay, response-time metrics, order reconciliation, and verified-fill slippage.
- Fixed local-package installation in DSH profiles by explicitly targeting the profile workspace root.

## 0.3.0 — 2026-08-20

- Established the `@clustrai/trading-console` public package identity and DSH bundle contract.
- Added an explicit, atomic installer for the `crypto-trader` agent preset.
- Added macOS Keychain, Windows Credential Manager, and Linux Secret Service credential backends in one cross-platform package.
- Added multi-exchange market and account capabilities for OKX, Binance, Bybit, and Hyperliquid with explicit execution boundaries.
- Added deterministic risk permits, scoped execution authorization, order reconciliation, and redacted decision provenance.
- Added release content gates, cross-platform verification workflow, and npm Trusted Publishing configuration.
