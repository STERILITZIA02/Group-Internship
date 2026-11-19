# Demo versions

The main repository pins [Demo-3d](https://github.com/STERILITZIA02/Demo-3d) and [Demo-platform](https://github.com/STERILITZIA02/Demo-platform) as Git submodules. From the project root, check out the versions recorded in the current commit:

```sh
git submodule update --init --recursive
```

## Update a demo version

After the demo PR merges, open a task branch in the main repository. From a clean demo checkout, fetch the merged commit and stage the new reference. For example, to select the 3D commit from `main`:

```sh
git -C demos/Demo-3d fetch origin main
git -C demos/Demo-3d switch --detach FETCH_HEAD
git add demos/Demo-3d
git diff --cached --submodule=log
```

Commit the reference and link the merged demo PR. Use `demos/Demo-platform` for platform updates.
