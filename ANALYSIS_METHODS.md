# Clustr 市场分析工具库

Clustr 的市场分析方法全部由用户手动选择并运行。图表加载、切换标的或切换周期不会自动执行任何分析。每次运行只读取当前所选交易场所、市场、品种和周期的 OHLCV 数据，并返回统一结构：方向、结构匹配度、支持证据、反证、关键价位、候选事件和失效条件。

“结构匹配度”是确定性规则的证据分数，不是成功概率、收益预测或交易许可。分析结果不能绕过账户权限、风险内核、用户审批或交易所订单状态机。

## 方法目录

| 方法 | 主要判断 | 适合观察 | 关键限制 |
|---|---|---|---|
| 威科夫市场结构 | 交易区间、Spring、UT/UTAD、SOS、SOW 与量价行为 | 区间吸收、突破或派发候选 | 仅凭 K 线无法确认主力意图；必须允许“证据不足” |
| 艾略特波浪候选 | 已确认摆动点上的五浪推进与三浪修正几何约束 | 有清晰层级的趋势与修正 | 波浪计数存在多解；输出是候选计数，不是唯一解释 |
| 江恩角度（ATR 标准化） | 从主要摆动点观察 1×1、1×2、2×1 价格/时间角度 | 稳定波动尺度下的趋势速度 | 传统图表缩放主观；Clustr 使用 ATR 标准化并明确该替代定义 |
| 道氏趋势结构 | 更高高点/更高低点或更低高点/更低低点，并用成交量验证 | 中期趋势确认和结构破坏 | 单一品种 OHLCV 不等于传统多指数互证 |
| 一目均衡表 | 云层、转换线、基准线与价格相对位置 | 趋势、均衡区和潜在支撑阻力 | 震荡行情会频繁穿云；结果必须保留中性状态 |
| 斐波那契回撤共振 | 主导摆动上的 23.6%、38.2%、50%、61.8%、78.6% 回撤区 | 趋势回撤和结构位共振 | 摆动起止点会影响结果；不能单独作为入场信号 |
| 成交量分布 / Market Profile | 近似成交量分箱、POC、VAH、VAL 和接受区 | 价值区、成交密集区和偏离 | K 线成交量无法替代逐笔成交；结果标注为估算 |
| SMC 市场结构 | BOS、CHoCH、流动性扫单与 FVG 候选 | 结构切换和流动性事件 | 术语缺乏统一行业标准；Clustr 给出所用确定性定义 |
| 海龟 / Donchian 突破 | 20/55 周期通道突破、ATR 波动与退出边界 | 持续趋势与突破 | 震荡环境容易产生假突破；ATR 只描述波动，不预测方向 |
| 布林带 + RSI + MACD | 波动带、动量极值和趋势动量一致性 | 趋势延续、均值回归和波动收缩 | 指标共享价格输入，不应把三个相关指标当作三份独立证据 |
| SuperTrend + ADX/ATR | ATR 跟踪带给出方向，ADX 过滤弱趋势 | 波动调整后的趋势跟随 | 突发跳空或高波动会扩大跟踪带并产生滞后 |
| VWAP + OBV + MFI | 样本锚定 VWAP、累积量价与资金流强度 | 价格相对成交重心和量价背离 | 不是交易所完整成交分布；跨日周期属于样本锚定而非正式日内 VWAP |

## 统一输出与安全边界

- `signal` 只允许 `bullish`、`bearish`、`neutral`；中性结果不是错误。
- `evidence` 与 `counterEvidence` 必须同时可见，避免只展示支持当前方向的材料。
- `invalidation` 描述当前分析在什么条件下失效，不自动生成止损订单。
- `levels` 是分析参考位，不是已批准订单价格。
- `events` 可以在图表上标记，但只有本次用户运行的方法会产生标记。
- 输入不足、字段异常或方法不存在时返回明确拒绝，不使用虚构数据补齐。

## 开源核对来源

Clustr 没有复制下列项目的交易策略源码。BSD、MIT 与 MPL 项目用于公式核对、测试样本和结果语义对照；未明确许可证的仓库只作为研究资料，不进入发布产物。

- [TA-Lib](https://ta-lib.org/)：RSI、MACD、ATR、ADX、布林带、OBV、MFI 等经典指标定义与行为核对，BSD。
- [ta4j](https://github.com/ta4j/ta4j)：Donchian、Ichimoku、SuperTrend、趋势与摆动类指标的 Java 开源实现对照，MIT。
- [Pandas TA Classic](https://github.com/xgboosted/pandas-ta-classic)：多指标命名、参数与组合策略交叉验证，MIT。
- [py-market-profile](https://github.com/bfolkens/py-market-profile)：Market Profile、POC 与价值区概念对照，BSD。
- [SM Radar Pine](https://github.com/CedInvest/sm-radar-pine)：BOS、CHoCH、FVG 等 SMC 术语的公开实现参考，MPL-2.0。
- [HarmonicPatterns](https://github.com/djoffrey/HarmonicPatterns)：摆动与斐波那契几何的研究参考；源码不进入 Clustr。
- [B. Gann Indicators](https://github.com/rajatjpatel/B-Gann-and-Financial-Astrology-Indicators)：江恩角度研究参考；源码不进入 Clustr。

任何方法的历史表现都需要在独立数据、包含费用与滑点的无未来信息环境中验证。工具库本身不构成投资建议或盈利承诺。
