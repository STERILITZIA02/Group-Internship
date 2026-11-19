<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/luxluane-dark-bg.png">
  <img src="assets/brand/luxluane-light-bg.png" width="160" alt="LuxLuane team logo">
</picture>

# 3D landscape and garden design

We’re LuxLuane, the team building a browser-based 3D landscape editor for desktop, tablet and phone. Someone planning their first garden should be able to open a template and sketch an idea in minutes. A landscape design team should be able to use that same scene to work from site measurements, compare layouts with a client and hand over the chosen plan.

The terrain editor will let users grade a slope, level a planting bed and place uploaded models by snapping them into place or entering their position, rotation and dimensions. Designers will be able to check gate clearance, edit a shared workspace together, leave comments and review earlier changes.

Environmental overlays will map water sources, estimated soil moisture and wind speed. A sunlight layer will show where a young tree or its mature canopy casts shade at a chosen time. Teams can use these simulations to assess risks and plan a response to heavy rain, for example by comparing where water might pool before and after regrading a slope.

For a real site, the scene will serve as a digital twin. Selecting a plant or feature will bring up its measurements, sources, care notes and site constraints. Designers will be able to see what was measured, what was estimated and what still needs a site visit. A later research goal is to turn one or more site photos into an editable starting scene that users can calibrate with their own measurements.

AI agents will work through an open, documented Model Context Protocol (MCP) interface to inspect a scene, make authorised edits and verify the result. An operation log will connect each request to the changes it produced or the error it encountered.

[Project overview](https://github.com/STERILITZIA02/Group-Internship/wiki/Project-Description) · [Editor architecture (中文)](docs/architecture.zh-CN.md) · [Sprint plan](https://github.com/STERILITZIA02/Group-Internship/wiki/Sprint-Plan) · [Project board](https://github.com/users/STERILITZIA02/projects/2)

## Run the local editor

Use Node.js **24.22.2** and pnpm **10.8.0**. The workspace and CI use the same lockfile.

```sh
git clone --recurse-submodules https://github.com/STERILITZIA02/Group-Internship.git
cd Group-Internship
npm install --global pnpm@10.8.0
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173`. Choose a shape and click **Add polygon**. With **Select**, drag an object to snap it to the 0.25 m grid or drag the background to orbit. **Pan** moves the view even when the pointer starts on an object. Two fingers pan and zoom. Select an object to enter exact coordinates, rotation and scale in the inspector. [Workspace preview](docs/images/editor-workspace.png)

Edits save to `data/scene.json` on the computer running the service. **Export JSON** downloads a portable scene and **Open file** imports it. **Reload** reads the latest saved revision, including edits made by an MCP client. A conflicting edit stays available to export. To use a different working file, set `SCENE_FILE` to an absolute path before startup.

| Location | Responsibility |
| --- | --- |
| `packages/scene` | Versioned scene format, commands and transform rules. Metres, Y up, north along −Z. Stored rotations are radians. |
| `apps/web` | Vue inspector, pointer gestures and an on-demand Three.js viewport. The object list and numeric editor also work without WebGL 2. |
| `apps/api` | Local Fastify service on port 4174. Saves one complete revision by atomic rename. Browser and MCP writes share the same queue and revision check. |

### Extend the editor

- **Theme.** Edit the [CSS tokens](apps/web/src/styles/tokens.css). For a named theme, override them under `:root[data-theme="name"]` and set that attribute on the document root. The four `--viewport-*` colours take sRGB hex values and update the live canvas.
- **Language.** Add a catalog beside [English](apps/web/src/i18n/locales/en.ts) and register its language tag and text direction in the [locale registry](apps/web/src/i18n/index.ts). Keep named placeholders such as `{shape}` and `{index}` in the translation. The editor matches browser language preferences and falls back to English.
- **Tools and panels.** [Select and Pan](apps/web/src/editor/tools.ts) implement pointer operations against the [viewport contract](apps/web/src/editor/viewport.ts). Add a tool there, its icon to the canvas toolbar and its name to the language catalog. The [workspace shell](apps/web/src/components/EditorWorkspace.vue) places the library and inspector beside the canvas on desktop or in the bottom panel on narrow screens.
- **Scene content.** The [ground and polygon layers](apps/web/src/viewport/layers) own their Three.js resources. The ground layer supplies pointer intersections. The polygon layer maps picked meshes to stable scene IDs. [Editor settings](apps/web/src/editor/settings.ts) control placement and snapping, and [viewport settings](apps/web/src/viewport/settings.ts) control camera and render parameters.

### Agent access

With `pnpm dev` running, add a stdio MCP server in your client. Use `node` as the command and the absolute path to `apps/api/src/mcp.ts` as its only argument. Call `get_scene`, then `apply_command` with the returned `baseRevision` and a command. For example, on an empty scene at revision 0:

```json
{
  "baseRevision": 0,
  "command": {
    "type": "add",
    "polygon": {
      "id": "642edcbe-43ca-47d4-a3cc-ee1258a690cb",
      "sides": 3,
      "transform": { "x": 0, "z": 0, "rotation": 0, "scale": 1 }
    }
  }
}
```

Call `get_scene` again to verify the edit. Start with `DEBUG_SCENE=1 pnpm dev` to trace a command ID to its result in the API terminal. This service runs on loopback and uses the local user's filesystem.

### Checks

```sh
pnpm check
pnpm exec playwright install chromium
pnpm test:browser
```

`pnpm check` runs formatting, lint, type checks, file, MCP and locale tests, then builds the web app. Browser checks exercise the production build against a temporary scene, including a theme change with a polygon selected.

## Demo repositories

| Repository | Contents |
| --- | --- |
| [Demo-3d](https://github.com/STERILITZIA02/Demo-3d) | Measured garden scenes, shade comparisons and the rendering scripts |
| [Demo-platform](https://github.com/STERILITZIA02/Demo-platform) | Workspace for touch-editing and saved-plan prototypes |

[Contributing](CONTRIBUTING.md) · [Updating the demo versions](demos/README.md) · [License](LICENSE)
