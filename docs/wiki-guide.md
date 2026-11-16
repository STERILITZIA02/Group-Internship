# Course Wiki

[Open the course Wiki](https://github.com/STERILITZIA02/Group-Internship/wiki).

The Wiki is the canonical location for course-facing project descriptions,
team details, weekly work statements, meeting records, and submission evidence.
The project brief and technical documentation in this repository remain useful
inputs; update relevant links when scope changes.

## Pages

- Home, Project Description, Team, Course Requirements, and Project Plan.
- Weekly Work Statements index and one page for each of Weeks 01–10.
- Individual Work Statement Template for courses requiring separate statements.
- Meeting Log, Decision and Risk Log, and Deliverables and Evidence.
- Sidebar and footer for navigation and draft status.

The course rubric and official statement format have not yet been supplied.
All weekly pages are drafts, with no claimed hours, completed work, or approval.
Confirm the required fields, deadlines, word limits, and submission channel
before treating these pages as course-ready submissions.

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

Use each weekly page's individual-contribution section for every confirmed
member. Add or remove placeholder rows only after confirming the roster.
Record actual hours, not estimates presented as actuals. Link evidence and
identify who reviewed the final statement. Publishing a Wiki page does not
submit it to the university's course system.

## Public information

The Wiki is public. Use agreed display names and GitHub handles in the team
directory; contact emails used for invitations are not published by default.
Keep student IDs, private feedback, credentials, and restricted evidence in
the course's approved private system, linking only where appropriate.
