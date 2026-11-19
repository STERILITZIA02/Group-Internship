# Project rules

- 产品范围与验收见 [Sprint Plan](https://github.com/STERILITZIA02/Group-Internship/wiki/Sprint-Plan)。任务归属与交接见 [Sprint workflow](docs/sprint-workflow.md)。
- 实施前检查已有模块和近期成熟实现，优先复用。按职责拆分，保持低耦合，UI 样式使用统一设计 tokens。
- 网页与画布配色统一维护在 `apps/web/src/styles/tokens.css`。组件从语言包读取可见文字和无障碍标签；存档、命令和错误码使用稳定标识。编辑手势通过视口接口处理坐标和拾取。
- 明确状态与转移，处理异步竞态、取消和清理。验证受影响的正常、异常与边界分支；测试和断言只覆盖真实风险。
- 修改聚焦当前任务，保留其他人的工作。版本号与升级节奏由用户确定，变更记录只写已完成的修改。
- 文档只写读者需要知道的事实、操作和结果。删去套话、无用的推理和重复强调；同一事实只在一处维护，其他位置直接链接。修订意见不写进成品。
- 英文自然可读，参考 `lieflat-less-ai-tone`。UI: Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.
- 图表沿用 `lieflat-charts` 的真实模板，优先 Lupi Editorial / Basics，统一色系，按真实比例呈现数据。
- 本地检索优先 FastCtx；批量读取，机械替换用 `replace`，语义修改用 `apply_patch`。合同源文、Wiki 和打印版同步更新。

## 开发者模式与 MCP

- 提供显式的调试日志开关，生产环境默认关闭详细日志。关键操作记录操作名、关联 ID、结果和失败原因，让开发者能沿一次操作追踪前后端。只记录定位问题所需的字段，凭据和完整用户内容不写入日志。
- 开发或变更供 agent 使用的工作流时，在同一项任务中交付或更新 MCP 工具。工具调用与界面共用应用服务、校验和账号权限，定义清楚输入、结果和错误。优先让 agent 能读取相关状态、执行指定操作并回读结果。
- 在开发工作区用 MCP 客户端走通一个成功场景和一个相关失败场景，核对返回结果、实际状态和对应日志。将启动方式、日志开关及最小调用示例放在实现所在仓库的 README。
