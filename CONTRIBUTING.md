# Contributing

This repository supports an invited internship group. Repository access does
not establish permission to reuse materials externally. Contributions do not
transfer copyright or override university, employment, or internship agreements.

## Workflow

Use the [Sprint board](https://github.com/users/STERILITZIA02/projects/2) and
[agent workflow](docs/sprint-workflow.md) for planning and handoffs. Demo code
lives in the [independent demo repositories](demos/README.md).

1. Create or select an issue with a clear outcome and acceptance criteria.
2. Assign an owner and choose the relevant weekly milestone when available.
3. Branch from the latest `main`: `feat/short-description`,
   `fix/short-description`, `docs/short-description`, or `chore/short-description`.
4. Keep the change focused. Open a draft pull request early when feedback helps.
5. Describe the change, link the issue, and record checks or manual evidence.
6. Request review from another team member and resolve review conversations.
7. Squash merge after approval, then remove the completed branch.

Normal changes require one approving review. New commits invalidate old
approvals. The owner retains an administrator bypass while the team is being
assembled; document any exceptional bypass.

## Definition of done

- The issue's acceptance criteria are met and the change is understandable.
- Relevant verification has been performed and its result is recorded.
- Documentation is updated where behavior or setup changed.
- No credentials, confidential data, or unapproved third-party material is included.
- Another team member has reviewed the change, once reviewers are available.

Build, lint, and test commands will be defined after the technology stack is
chosen. Until then, do not claim application or CI verification.

## Weekly rhythm

Agree on outcomes and owners at the start of each week. Hold a weekly demo and
retrospective, and record evidence using the
[weekly update template](docs/weekly-update-template.md).

## Sensitive reports

Do not put secrets or sensitive vulnerability details in a public issue.
Use private vulnerability reporting or contact the owner privately.
