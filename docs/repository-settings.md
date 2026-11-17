# Repository administration

Baseline for the 10-week internship group challenge. GitHub settings are
configured separately; this document records the intended configuration.

## Access and rights

- Owner / administrator: `STERILITZIA02`.
- On 17 November 2026 (Pacific/Auckland), Write invitations were sent to
  `ares608`, `mdayu2011`, `ElvisZong`, and `ShunxinzhuLi`. All four were pending
  acceptance when checked. See GitHub Settings for current access status.
- Future members should receive collaborator access without unnecessary
  administration privileges. Review access again at handover.
- Visibility remains public. All rights are reserved under `LICENSE`;
  visibility and copyright permission are separate concerns.
- Confirm university / employer ownership requirements before implementation.

The four invited members have now accepted access to the main repository.
Write access was also invited for both demos; acceptance is tracked separately
in each repository. The private Sprint project includes the owner and all four
members, with Write access for the members.

## Main branch and merging

- Default branch: `main`.
- One PR approval required; dismiss stale approvals on new commits.
- Resolve review conversations before merging.
- Require linear history; permit squash merging only.
- Disable force pushes and branch deletion on `main`.
- Automatically delete merged task branches.
- Administrator enforcement remains disabled for repository setup and
  maintenance. Ordinary development uses the PR workflow.
- Code ownership initially routes review requests to the repository owner.
  Mandatory code-owner approval is not enabled; distribute ownership later.
- `Repository checks` is required in all three repositories. This checks
  changed-file whitespace and recursive checkout, including demo references.
  Build and application checks remain pending the technology stack.

## Features and security

- Issues, Projects, and Wiki enabled. Wiki editing is restricted to collaborators.
- The Wiki holds course-facing descriptions and weekly work statements;
  repository `docs/` holds engineering and administration guidance.
- GitHub Actions defaults to read-only repository access and cannot approve PRs.
  Workflows should request only the permissions they need.
- Secret scanning and push protection enabled.
- Dependency vulnerability alerts and private vulnerability reporting enabled.
- No application workflow, deployment, hosting, or paid service is configured.

## Sprint and agent setup

- [Shared board](https://github.com/users/STERILITZIA02/projects/2): Todo,
  In Progress, In Review, Done. Open main-repository Issues are auto-added.
- Sprint 01–10 milestones are placeholders without dates or project topics.
- Area, agent-ready, blocked, and high-priority labels support task routing.
- Task and Sprint issue forms, PR templates, and concise AGENTS.md files are in place.
- Codex automatic code review is set for all PRs on opening in the main
  repository and both demos. Runtime review of a representative PR remains
  to be checked when implementation starts.
- Details and remaining placeholders: [readiness review](sprint-readiness.md).

## Still to decide

- Responsibilities for Yingnan Li, Yi Zong, Shunxinzhu Li, and Lingyu Meng;
  Junan Yu is the PM.
- Challenge brief, start date, assessment criteria, and final deliverables.
- Whether visibility should change to private.
- Technology stack, CI checks, and deployment permissions.
- Whether to adopt an open-source license later.
