# Sprint and agent workflow

The project topic and technology stack are undecided. This is a working
framework; the backlog, sprint dates, estimates, and deliverables remain blank.

[Sprint board](https://github.com/users/STERILITZIA02/projects/2) ·
[Milestones](https://github.com/STERILITZIA02/Group-Internship/milestones)

## Where work lives

- `Group-Internship`: shared backlog, course records, main implementation, and
  the demo commits selected for the project.
- `Demo-3d`: an independent demo; scope and stack to be chosen.
- `Demo-platform`: an independent demo; scope and stack to be chosen.

Plan project work in main-repository Issues. Use `area:main`, `area:demo-3d`, or
`area:demo-platform` to show where implementation belongs. Independent demo bugs
may live in the demo repository; link them from the main issue when relevant.

## Weekly cycle

`Sprint 01` through `Sprint 10` are undated placeholders. At planning, agree on
the goal and available time, select a few issues, assign owners, and set the
milestone. Use the Sprint issue template for the plan and review. Keep course
statements in the existing weekly Wiki pages and link to the sprint evidence.

The board uses **Todo → In Progress → In Review → Done**. `Todo` includes work
not yet selected for a sprint; filter by milestone to see the current sprint.
Use `blocked` with a short explanation when waiting for help or a decision.
Reserve `priority:high` for work that should be handled first.

At the weekly demo, record what works, relevant PRs and commits, and remaining
work. Move unfinished issues to a later milestone deliberately. End with a
short retrospective and one useful adjustment for the next week.

## Giving work to an agent

An issue is ready when it identifies the target repository, outcome, scope,
acceptance criteria, and a way to verify the result. Add `agent-ready` when that
context is available. The label records readiness; it does not launch an agent.

Use one focused task branch per issue. Give the agent the issue link and the
target checkout, then let it follow that repository's `AGENTS.md`. If multiple
agents work at the same time, use separate branches/checkouts and agree on file
ownership to avoid overwriting each other's work.

Keep the handoff short: branch or commit, changes made, checks and results,
remaining work, and any decision needed. An agent can prepare a PR; another
team member reviews its outcome and acceptance criteria.

## PR review and completion

Codex review is a second review pass. Use `@codex review` in a PR comment for a
manual review. Automatic review settings belong to each repository separately.
GitHub's required teammate approval still applies.

For main-repository work, merge the reviewed PR and close the issue when its
acceptance criteria are met. For demo work, first merge the demo PR, then update
the main repository's submodule pointer and verify the selected demo commit.
The main pointer-update PR can close the planning issue. A demo PR should use
`Refs STERILITZIA02/Group-Internship#123` rather than closing it prematurely.

## Checks to add after the stack is chosen

The current CI only checks changed-file whitespace and that recorded submodule
commits can be checked out. It is not an application build or test suite.

| Item | Current state |
| --- | --- |
| Install command and dependency lockfile | To be chosen per repository |
| Run and demo instructions | To be written with the first runnable version |
| Build, lint, type-check and test commands | To be chosen for the stack |
| Acceptance test / smoke test | To be written against the agreed behaviour |
| Agent environment / setup command | To be configured after dependencies exist |
| Preview deployment and hosting | To be chosen if needed |
| Version and release policy | Initial version and upgrade cadence set by the user |

Record the actual commands in each repository's README and run them in CI once
available. Add required checks only after they exist and pass.
