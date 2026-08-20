# Clustr Trading Console 平台支持

Clustr Trading Console 以一个插件名称、一个版本号和一套共享交易逻辑发布。平台差异只存在于凭证保险库后端。

| 平台 | 自动选择的保险库 | 当前验证级别 | 缺失时行为 |
|---|---|---|---|
| macOS arm64/x64 | Keychain / Security Framework | 本机运行与自动化测试 | 账户功能关闭，公共行情保留 |
| Windows x64/arm64 | Credential Manager / Password Vault | 协议与故障注入测试；发布前要求 Windows CI 实测 | 账户功能关闭，公共行情保留 |
| Linux x64/arm64 | Secret Service / `secret-tool` | 协议与故障注入测试；发布前要求 Linux CI 实测 | 账户功能关闭，公共行情保留 |
| 其他平台 | 无 | fail-closed 测试 | 账户功能关闭，公共行情保留 |

## 单一插件分发

- 插件市场只提供一个 **Clustr Trading Console** 安装入口。
- 插件运行时依据 Node.js 的平台与 CPU 架构自动选择后端。
- 离线压缩包可以按平台区分，但必须共享相同插件版本、源代码提交和能力矩阵。
- 不允许因平台差异复制 UI、System Prompt、风险内核或订单规则。

## 发布门禁

每个平台必须在原生 CI 中完成：保险库保存、读取、重启持久化、锁定拒绝、删除复查、多账户索引、秘密泄漏 Canary、浏览器响应扫描以及无保险库时的 fail-closed。Windows/Linux 在通过各自原生 CI 前，只能标记为协议实现完成，不能标记为生产实测通过。

原生保险库基础验证命令为 `pnpm run test:native-vault`。它只写入随机生成的测试凭证，完成读回、枚举与删除复查后立即清理，不连接任何交易所。发布流水线还必须补充锁定保险库、服务缺失和恶意输出等平台故障场景。
