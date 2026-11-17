# Sprint and agent readiness

Checked on 17 November 2026. Project topic, scope, stack, and dates remain
undecided. The collaboration framework is ready; application readiness will
be assessed once the first implementation exists.

| Component | State | Evidence / use |
| --- | --- | --- |
| Main repository | Ready | Main internship work, shared planning, course documents |
| Demo-3d | Ready as a placeholder | Independent repository at `demos/Demo-3d` |
| Demo-platform | Ready as a placeholder | Independent repository at `demos/Demo-platform` |
| Reproducible demo versions | Verified | Git submodules record specific reachable commits; main CI checked them out |
| Licence | Set | All rights reserved in all three repositories |
| Main team access | Verified | Four members have Write access |
| Demo team access | Invited | Four Write invitations per demo; some may still need acceptance |
| Shared Sprint board | Verified | Owner plus four members; members have Write access |
| Issue auto-add | Verified | Planning placeholder #1 appeared in Todo without manual addition |
| Sprint milestones | Ready | Sprint 01–10, no assumed dates or scope |
| Task classification | Ready | Three area labels, agent-ready, blocked, priority:high |
| Task / Sprint forms | Ready | Outcome, target repo, scope, acceptance, checks, and handoff |
| Agent instructions | Ready | Concise AGENTS.md in each checkout |
| Agent execution | Manual dispatch | Issue context is given to the chosen agent; labels do not launch jobs |
| PR workflow | Set | One approval, resolved conversations, squash merge, merged-branch cleanup |
| Codex code review | Configured | All PRs, on opening, in all three repositories; no end-to-end PR run yet |
| Baseline CI | Passed | Repository checks succeeded in main and both demos |
| Required status | Set | Repository checks is required; administrator maintenance bypass retained |
| Weekly records | Ready | Ten existing Wiki pages, linked to Sprint work rather than duplicated |
| Local-only review documents | Preserved | Chinese contract and review artifacts were not included in this setup commit |

## Placeholders to fill after the topic is chosen

| Decision | Where to record it |
| --- | --- |
| Problem, users, scope, acceptance criteria | Project brief and planning Issue #1 |
| Goals and dates for each sprint | Main-repository milestones and Sprint issues |
| Roles and implementation owners | Team page and issue assignees |
| Purpose of each demo | Each demo README |
| Framework, dependencies, and lockfile | Each application repository |
| Install / run / build / lint / test commands | README, then CI |
| Agent environment bootstrap | Chosen agent environment, once commands exist |
| Acceptance checks and demo evidence | Task issues, PRs, and weekly statements |
| Preview / deployment | README when a host is chosen |
| Initial version and release cadence | User decision |

No dependency bot configuration, deployment workflow, or framework boilerplate
was added before the stack is known. The baseline CI does not claim to test an
application: it checks whitespace and whether the recorded repositories can be
checked out.

## Verification scope

The repository and branch settings were read back from GitHub. All three
initial Repository checks runs completed successfully. The main run included
recursive submodule checkout. Issue #1 confirmed automatic board intake.
Codex review settings were confirmed in the account interface; an actual
review will be checked on the first representative PR.

The CLI token currently lacks the Projects scope, so the board was configured
through the GitHub interface. Board API automation is optional future work;
the current setup does not include it.

## Entry points

- [Sprint board](https://github.com/users/STERILITZIA02/projects/2)
- [Planning placeholder](https://github.com/STERILITZIA02/Group-Internship/issues/1)
- [Sprint / agent workflow](sprint-workflow.md)
- [Submodule guide](../demos/README.md)
