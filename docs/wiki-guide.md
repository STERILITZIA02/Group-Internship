# Publishing the Wiki

Clone the [Wiki](https://github.com/STERILITZIA02/Group-Internship/wiki) alongside the project files:

```sh
git clone https://github.com/STERILITZIA02/Group-Internship.wiki.git .wiki-local
```

For an existing checkout, run `git -C .wiki-local pull --ff-only` before editing. Commit the changed pages in that checkout and push to its `master` branch.

## Publish the team contract

Edit [the English source](team-contract.md). From the repository root, use Python with ReportLab installed to regenerate the [A4 PDF](../output/pdf/team-contract.pdf):

```sh
python3 scripts/export_team_contract.py
```

Check the signature page. Publish the same text on the [Contract page](https://github.com/STERILITZIA02/Group-Internship/wiki/Contract) and pin its source and PDF links to the commit containing that edition.
