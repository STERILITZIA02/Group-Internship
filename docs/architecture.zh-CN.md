# 庭院编辑器架构

桌面、平板和手机打开同一份庭院。用户可以在手机上把树移到围栏旁，在平板上比较两个树位的晚餐树影，再从电脑打开选定方案和养护记录。

当前开发基座使用 Vue 3、TypeScript、Vite 和 Three.js。Fastify 将多边形场景写入本地 JSON 文件，MCP 客户端通过同一服务读写。托管版规划使用 Supabase 管理账号、PostgreSQL 和模型文件。[本地启动与检查](../README.md#run-the-local-editor)

## 代码放在哪里

| 目录 | 职责 | 对外接口 |
| --- | --- | --- |
| `packages/scene` | 定义存档、命令和校验格式。 | `applyCommand(scene, command)` 返回更新后的场景。UI 和 MCP 共用错误码。 |
| `apps/web/src/editor` | 处理手势、吸附、数值转换和未保存的编辑。 | 手势向视口查询落点和对象 ID，松手时提交一次变换。 |
| `apps/web/src/viewport` | 持有 Three.js 的相机、网格、材质和绘制循环。 | 接收场景、选区、预览和配色。向编辑器返回普通坐标。 |
| `apps/web/src/components` | 文件工具栏、视口、对象列表和属性面板。 | 组件通过 props 读取状态，通过事件提交操作。`App.vue` 组装工作区。 |
| `apps/web/src/io` | HTTP 读写和 JSON 文件导入导出。 | 编辑器取得已保存的场景版本，错误码在显示时翻译。 |
| `apps/api/src` | HTTP 处理命令，文件存储按版本串行写入，stdio MCP 调用同一 HTTP 服务。 | 开发代理、API 和 MCP 从 `config/local-service.ts` 取得本地服务地址。 |

界面和画布共享主题，语言包负责文字、插值和数字格式。主题或语言的变化只影响呈现。[主题、语言包与编辑参数的维护入口](../README.md#extend-the-editor)

## 一份庭院怎样保存

- **Workspace → Deck。** Workspace 保存成员关系，Deck 是一次可独立打开的庭院设计。`decks` 存放 `workspace_id`、`revision` 和 `document jsonb`。文档包含 `schemaVersion`、场地、地形、实体和候选方案。相机和当前选区属于各自的编辑会话。
- **位置与地形。** 长度用米，角度输入用度，场景计算用弧度。右手系，Y 向上。真北对齐时 X 向东、−Z 向北。场地记录经纬度、IANA 时区和从平面图上方（−Z）顺时针转到真北的角度。地形先用规则高度网格，贴地、量尺和阴影分析共用同一三角划分。现有 Demo 的东、北、高坐标在导入时转换为 `[east, up, -north]`。用院门、桌角和树根检查位置与朝向。[Demo 坐标说明](https://github.com/STERILITZIA02/Demo-3d#render-the-garden)
- **植物与资产。** `entityId` 标识院子里的这一株，`speciesId` 指向品种资料，`assetVersionId` 指向显示模型。实体保存位置、四元数和缩放。冠幅、种植日期和实测值单独保存，带单位和来源。上传先支持 GLB，记录校准尺寸和根部锚点。原文件和可显示的版本存对象存储，Deck 只引用已上传的版本。
- **方案与养护。** 比较 A/B 时，两边共用同一版场地、同一株树、冠幅、当地时刻和相机，仅替换候选位置。选定后，一条命令将位置和选择理由写回该实体。养护记录以 `deckId + entityId` 关联。换树位或换模型后仍能查到同一株树的历史。

## 地形、环境图层与积水评估

| 功能 | 实现 |
| --- | --- |
| 地形编辑 | 编辑器把选区和目标高程传给场景包。整平将选区设为同一高程，放坡按起点和终点高程插值。一次确认保存一组网格点的变化，更新贴地物体的位置。原地形和改坡方案可分别打开。 |
| 环境叠加层 | 场景包按地点、时间、真北和冠幅计算日照。水源层标出水龙头等取水点。土壤湿度和风速按输入数据的覆盖范围着色，保留来源、时刻、单位及实测或估算标记。只有全场风速时显示一个场地读数。缺少数据的区域留空。视口负责绘制，开关图层只改变当前视图。 |
| 暴雨风险评估 | 在同一降雨情景下对比两版高度网格。将场地边缘的排水出口作为边界，按地面高程查找低于溢流口的洼地，标出潜在积水范围。记录所用的地形版本、出口和情景参数。选定应对方案时保存位置和理由。 |

在样例地形上标出封闭洼地，再从低点向出口开一条连续下坡的浅沟。保持土壤、降雨条件和视角固定，检查原洼地的标记是否缩小或消失。切换画质后重复读取同一位置的高程和评估结果。

## 托管版的保存协议

| 入口 | 行为 |
| --- | --- |
| `GET /api/decks/:id` · MCP `get_deck` | 返回场景和当前 `revision`。 |
| `POST /api/decks/:id/commands` · MCP `apply_command` | 传入 `commandId`、`baseRevision`、操作类型和参数。返回 `commandId`、新版本和实际写入的差异。 |

拖动时在本地预览，松手或确认数值才提交绝对变换。API 验证 Supabase 登录凭证，按工作区成员身份执行。事务锁定 Deck 行，先检查本次命令是否已经成功，再比对版本、应用命令、保存文档，并向 `deck_changes` 追加改动前后的值。按 Deck 分别对命令 ID 和提交版本设唯一约束。原请求重试时返回原结果。另一台设备抢先保存时，返回版本冲突，客户端保留本次编辑，让用户在新版上重新应用。开启开发日志后，用 `commandId` 可查到入口、结果和失败原因。[Supabase 登录凭证](https://supabase.com/docs/guides/auth/jwts)

同一账号跨设备重新打开 Deck，用以上两个接口即可。加入实时共同编辑时，WebSocket 按版本广播已提交的差异，重连从缺失版本补读。光标和拖动预览单独广播。撤销提交反向操作，并检查被修改对象的当前值。

## 三端输入与布局

| 设备 | 视图 | 操作 |
| --- | --- | --- |
| 桌面 | 画布旁常驻对象列表和属性面板。 | 单击选择，拖动选中物体或控制柄。拖空白处转动相机，滚轮缩放，数值框精确调整位置、旋转和尺寸。 |
| 平板 | 宽屏显示侧栏，窄屏收起属性面板。 | 手指或笔点选物体后拖动。双指平移、捏合缩放。接入鼠标和键盘即可使用桌面操作。 |
| 手机 | 画布占主区域，选中后用底部面板编辑同一组字段。 | 单指拖选中物体，拖空白处转相机，双指导航。对象列表用于选中被树冠遮住的物体。屏幕键盘打开时仍能确认数值。 |

输入按每次 Pointer Event 的实际指针类型处理，面板按可用宽度排列。手势开始时确定由相机或对象接管。第二指加入时撤回单指拖动预览，转入相机导航。`pointercancel` 也结束预览。画布接管手势，页面面板保留原生滚动、文本输入和焦点。触控按钮预留 44 CSS px 点击区，底栏避开系统安全区。[Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## GPU 与渲染预算

使用 Three.js `WebGLRenderer`。实际创建 WebGL 2 上下文后进入 3D。各端从同一套标准材质和模型开始，根据交互帧耗时选画质。WebGPU 在目标设备上表现出可重复的收益时，再接入视口。场景格式和编辑接口保持通用。[Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) · [WebGPU 渲染路径](https://threejs.org/manual/pages/webgpurenderer)

| 开销 | 落地方式 |
| --- | --- |
| 高像素密度 | 用 CSS 尺寸布局，单独设置画布的绘制分辨率。起始像素比上限 1.5。连续拖动超出帧预算时先降到 1，再降低远景细节和装饰阴影。降档后复测，稳定后再升档。 |
| 植被与模型 | 相同几何、材质的植物按区域实例化，近处用完整模型，远处用简化树冠。先载入可编辑的低细节几何，再补纹理。纹理采用 KTX2/Basis 时，由加载器按 GPU 支持选压缩格式。切换庭院时释放不再引用的几何、材质和纹理。[InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) · [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html) |
| 空闲与交互 | 场景、相机、选区或资源有变化时请求绘制。拖动和相机惯性期间逐帧绘制，停稳后休眠。直接按实体 ID 更新变化的实例。 |
| 树影与通行 | 把庭院当地日期和时间换算成同一时刻，用 SunCalc 算太阳方向。从桌面和花床的采样点沿太阳方向检查是否被规范树冠等遮挡体挡住，各画质共用结果。通行比较沿路线检查桶的占用宽度和最窄处，软管长度沿用户画出的折线累加。[SunCalc](https://github.com/mourner/suncalc) |
| GPU 暂不可用 | 保留当前 Deck 和已确认的操作。上下文恢复后从场景重建视口。设备无法创建 WebGL 2 时，仍可通过对象列表查看、输入精确数值和保存，并显示重新打开 3D 的入口。[上下文恢复](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event) |

**真机验收目标。** 固定一份带地形、围栏和导入模型的庭院，准备普通种植与密植两档，记录各档的植物数和资产版本。每台设备按同一路径转动视角、拖树、切换树位，采集 30 秒交互帧。记录帧间隔 p95、绘制分辨率、draw calls 和提交绘制的三角形数。普通核显笔记本的 p95 目标为 17 ms 以内，平板和中档手机为 34 ms 以内。冷启动单独计时，到第一棵树可选中为止。设备覆盖 iPhone 和 iPad 的 Safari、Android Chrome，以及桌面的 Safari、Chromium 和 Firefox。每条结果注明设备、浏览器和画质档位。

## 搭建顺序

1. **开本地环境。** 在主仓库配置 pnpm workspace，使用 Vite 的 `vue-ts` 模板建立 `apps/web`，Fastify 建立 `apps/api`。Supabase CLI 的 `supabase init` 和 `supabase start` 提供本地账号、PostgreSQL 和存储。Vite 将 `/api` 代理至 Fastify 的 HTTP 路由，API 同进程挂载 `/mcp`。交付的根脚本 `pnpm dev` 启动 Web 和 API。[Vite 模板](https://vite.dev/guide/) · [Supabase 本地环境](https://supabase.com/docs/guides/local-development/cli/getting-started)
2. **跑通第一棵树。** 用设计阶段确定的存档样例和 `set_transform` 命令，在 MVP 中建工作区、成员、Deck 和变更记录表。接入登录，在桌面和触屏上移动树、输入尺寸、保存、重新登录并回读。Agent 用同一账号读、改、再读，开发者凭命令 ID 能定位此次操作。
3. **交付可试用的庭院。** 部署静态 Web、一个 Node 服务和托管 Supabase，将同域 `/api`、`/mcp` 转发给 Node。接通注册、工作区列表、A/B 选址、遮阴与通行比较、选择理由和首条养护任务，在第二台设备打开并继续编辑。后续照片重建可输出带校准点和来源的候选场景，经用户确认后写入 Deck。[Sprint Plan](https://github.com/STERILITZIA02/Group-Internship/wiki/Sprint-Plan)
