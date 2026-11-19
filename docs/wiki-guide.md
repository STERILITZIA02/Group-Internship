# Course Wiki

[Open the course Wiki](https://github.com/STERILITZIA02/Group-Internship/wiki).

The Wiki is the canonical location for course-facing project descriptions,
team details, weekly work statements, meeting records, and submission evidence.
The project brief and technical documentation in this repository remain useful
inputs; update relevant links when scope changes.

## Pages

- Home, Project Description, Team, Sprint Plan, planning tools, and submissions.
- Contract, including task agreements, crisis management, and the printable PDF.
- Weekly Work Statements index and one page for each of Weeks 01–10.
- Individual Work Statement Template for courses requiring separate statements.
- Meeting Log, Decision and Risk Log, and Deliverables and Evidence.
- Sidebar links to the project pages and team records.

## Editing and publishing

Collaborators may use the Wiki's Edit button. Wiki changes are stored in a
separate Git repository; code repository branch protection does not review
Wiki edits. Have another group member check statements before course submission.

For local editing, clone the Wiki inside this repository's ignored directory:

```sh
git clone https://github.com/STERILITZIA02/Group-Internship.wiki.git .wiki-local
git -C .wiki-local pull --ff-only
```

If `.wiki-local` already exists, only run the pull command. Edit its Markdown
files, review the diff, commit the intended pages, and push to its default
branch. Always pull first to preserve teammates' web edits. Do not force-push.

## Contract PDF

The editable contract is `docs/team-contract.md`. Its text is also published on
the Wiki's Contract page. The printable copy is `output/pdf/team-contract.pdf`.
After changing the source, regenerate the PDF with Python and ReportLab:

```sh
python3 scripts/export_team_contract.py
```

Update the Wiki text from the same source, retain the download link, and check
the PDF pages before publishing. Print on A4 at actual size. The final page has
five separate spaces for signatures and dates.

## Public information

The Wiki is public. Use agreed display names and GitHub handles in the team
directory; contact emails used for invitations are not published by default.
Keep student IDs, private feedback, credentials, and restricted evidence in
the course's approved private system, linking only where appropriate.
