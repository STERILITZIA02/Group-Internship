# Demo repositories

| Directory | Independent repository | Scope |
| --- | --- | --- |
| `Demo-3d` | [Demo-3d](https://github.com/STERILITZIA02/Demo-3d) | To be agreed |
| `Demo-platform` | [Demo-platform](https://github.com/STERILITZIA02/Demo-platform) | To be agreed |

These are Git submodules. The main repository records a specific commit for
each demo, so a presentation can be reproduced later.

## Fetch the recorded demo versions

```sh
git submodule update --init --recursive
```

A normal submodule update checks out the recorded commit in detached HEAD
state. Create a task branch before editing a demo:

```sh
git -C demos/Demo-3d switch -c feat/task-name
```

Commit and push inside the demo repository, then open its PR. After that PR is
merged, select the intended commit in the main checkout:

```sh
git -C demos/Demo-3d fetch origin
git -C demos/Demo-3d switch --detach origin/main
git add demos/Demo-3d
git commit -m "chore: update 3d demo reference"
```

Use a main-repository task branch for that pointer change and submit it through
a PR. Start with a clean demo working tree; finish or save in-progress work
before changing the selected commit. Substitute `Demo-platform` for the other
demo. Do not use an automatic remote update when reproducing a saved demo.

Project planning stays in the main repository. A demo's branch rules,
collaborators, CI, and Codex settings are configured separately.
