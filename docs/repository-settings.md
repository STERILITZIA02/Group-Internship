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

## Main branch and merging

- Default branch: `main`.
- One PR approval required; dismiss stale approvals on new commits.
- Resolve review conversations before merging.
- Require linear history; permit squash merging only.
- Disable force pushes and branch deletion on `main`.
- Automatically delete merged task branches.
- Administrator enforcement is initially disabled so the sole owner can
  maintain the repository before other reviewers join. Revisit once the team
  is added. Administrator bypass is an exception to the review workflow.
- Code ownership initially routes review requests to the repository owner.
  Mandatory code-owner approval is not enabled; distribute ownership later.
- Required CI checks will be added once a real application and CI exist.

## Features and security

- Issues, Projects, and Wiki enabled. Wiki editing is restricted to collaborators.
- The Wiki holds course-facing descriptions and weekly work statements;
  repository `docs/` holds engineering and administration guidance.
- GitHub Actions defaults to read-only repository access and cannot approve PRs.
  Workflows should request only the permissions they need.
- Secret scanning and push protection enabled.
- Dependency vulnerability alerts and private vulnerability reporting enabled.
- No application workflow, deployment, hosting, or paid service is configured.

## Still to decide

- Team usernames and responsibilities.
- Challenge brief, start date, assessment criteria, and final deliverables.
- Whether visibility should change to private.
- Technology stack, CI checks, and deployment permissions.
- Whether to adopt an open-source license later.
