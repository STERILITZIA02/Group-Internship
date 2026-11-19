<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/luxluane-dark-bg.png">
  <img src="assets/brand/luxluane-light-bg.png" width="160" alt="LuxLuane team logo">
</picture>

# 3D landscape and garden design

We’re LuxLuane, the team building a browser-based 3D landscape editor for desktop, tablet and phone. Someone planning their first garden should be able to open a template and sketch an idea in minutes. A landscape design team should be able to use that same scene to work from site measurements, compare layouts with a client and hand over the chosen plan.

The editor will let users shape terrain, upload their own models and snap objects into place or set their position, rotation and dimensions precisely. Physical and time-based simulations will help answer practical questions: will a gate clear a raised bed, and where will a mature tree cast shade at dinner time? Each user will have a workspace for design projects, with shared editing, comments and a history of changes.

For a real site, the scene will serve as a digital twin. Selecting a plant or feature will bring up its measurements, sources, care notes and site constraints. Designers will be able to see what was measured, what was estimated and what still needs a site visit. A later research goal is to turn one or more site photos into an editable starting scene that users can calibrate with their own measurements.

AI agents will work through an open, documented Model Context Protocol (MCP) interface to inspect a scene, make authorised edits and verify the result. An operation log will connect each request to the changes it produced or the error it encountered.

[Project overview](https://github.com/STERILITZIA02/Group-Internship/wiki/Project-Description) · [Sprint plan](https://github.com/STERILITZIA02/Group-Internship/wiki/Sprint-Plan) · [Project board](https://github.com/users/STERILITZIA02/projects/2)

## Development checkout

```sh
git clone --recurse-submodules https://github.com/STERILITZIA02/Group-Internship.git
cd Group-Internship
```

| Repository | Contents |
| --- | --- |
| [Demo-3d](https://github.com/STERILITZIA02/Demo-3d) | Measured garden scenes, shade comparisons and the rendering scripts |
| [Demo-platform](https://github.com/STERILITZIA02/Demo-platform) | Workspace for touch-editing and saved-plan prototypes |

[Contributing](CONTRIBUTING.md) · [Updating the demo versions](demos/README.md) · [License](LICENSE)
