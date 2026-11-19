# Project rules

- 产品范围与验收见 [Sprint Plan](https://github.com/STERILITZIA02/Group-Internship/wiki/Sprint-Plan)。任务归属与交接见 [Sprint workflow](docs/sprint-workflow.md)。
- 实施前检查已有模块和近期成熟实现，优先复用。按职责拆分，保持低耦合，UI 样式使用统一设计 tokens。
- 明确状态与转移，处理异步竞态、取消和清理。验证受影响的正常、异常与边界分支；测试和断言只覆盖真实风险。
- 修改聚焦当前任务，保留其他人的工作。版本号与升级节奏由用户确定，变更记录只写已完成的修改。
- 文档只写读者需要知道的事实、操作和结果。删去套话、无用的推理和重复强调；同一事实只在一处维护，其他位置直接链接。修订意见不写进成品。
- 英文自然可读，参考 `lieflat-less-ai-tone`。UI: Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.
- 图表沿用 `lieflat-charts` 的真实模板，优先 Lupi Editorial / Basics，统一色系，按真实比例呈现数据。
- 本地检索优先 FastCtx；批量读取，机械替换用 `replace`，语义修改用 `apply_patch`。合同源文、Wiki 和打印版同步更新。
