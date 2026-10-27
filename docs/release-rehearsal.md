# Rolling release and rollback rehearsal

Date: 2026-10-27. Project: `russell-goldenbroits-projects/grantdesk`. Vercel CLI 65.2.0.

Rolling-release config at the start: automatic advancement, 10% for 5 min → 50% for 10 min → 100%.

| Name  | Deployment | Commit |
| ----- | ---------- | ------ |
| OLD   | https://grantdesk-6vf6maz6b-russell-goldenbroits-projects.vercel.app (`dpl_4fQWmmJhfBW9uTZnMXAQGtJ1LXHJ`) | `461d164` |
| NEW   | https://grantdesk-agrycgzz2-russell-goldenbroits-projects.vercel.app (`dpl_6gciw35cm4ADNrNVRQktjpWofrqD`) | `63a6065` |
| FINAL | https://grantdesk-1n7f4l1dx-russell-goldenbroits-projects.vercel.app (`dpl_6byFkuSNAfdyBCTV2AXC2gpoMSs6`) | `420de84` |

## Steps

All times EDT.

| Step | Command | Time | Key output |
| ---- | ------- | ---- | ---------- |
| 0 | `vercel ls --prod` | 19:45:55 | Newest Ready production row: `grantdesk-6vf6maz6b…` → OLD |
| 1 | `git commit -m "chore: v2 label to rehearse a rolling release"` then `git push origin main` | 19:47:30 | `461d164..63a6065  main -> main` |
| 2 | `vercel ls --prod -m githubCommitSha=63a6065…`, every 30 s | 19:47:58 | `grantdesk-agrycgzz2… ● Building Production` |
| 2 | (same poll) | 19:48:28 | `grantdesk-agrycgzz2… ● Ready Production` → NEW (Vercel reports Ready at 19:48:07) |
| 3 | `vercel rr start --dpl=https://grantdesk-qd6q2bsel-russell-goldenbroits-projects.vercel.app --yes` | 19:48:09 | **Failed:** `Can't find the deployment "grantdesk-qd6q2bsel-…"`. Agent error: this URL was invented, not taken from the poll. Nothing changed. |
| 3 | `vercel rr inspect` | 19:48:10 | `"state": "ACTIVE"`, canary `grantdesk-agrycgzz2…`, `"currentCanaryPercentage": 10`. The git push had already started the rolling release at 19:48:07. |
| 3 | `vercel rr start --dpl=https://grantdesk-agrycgzz2-russell-goldenbroits-projects.vercel.app --yes` | 19:50:28 | `Requested rolling release start for dpl_6gciw35cm4ADNrNVRQktjpWofrqD` |
| 3 | `vercel rr inspect` | 19:50:34 | `"state": "ACTIVE"`, `"currentCanaryPercentage": 10`, active stage index 0 → **10% stage confirmed** |
| 4 | `vercel rr complete --dpl=https://grantdesk-agrycgzz2-russell-goldenbroits-projects.vercel.app` | 19:50:43 | `Requested rolling release completion for dpl_6gciw35cm4ADNrNVRQktjpWofrqD` |
| 4 | `vercel rr inspect` | 19:50:44 | Still `"state": "ACTIVE"`, `"currentCanaryPercentage": 10` (completion not applied yet) |
| 4 | `vercel rr inspect` | 19:50:50 | `"state": "COMPLETE"`, `"currentCanaryPercentage": 100` |
| 5 | `vercel rollback https://grantdesk-6vf6maz6b-russell-goldenbroits-projects.vercel.app` | 19:51:02 | `Success! grantdesk was rolled back to grantdesk-6vf6maz6b-… (dpl_4fQWmmJhfBW9uTZnMXAQGtJ1LXHJ) [3s]` |
| 5 | `vercel rollback status` | 19:51:06 | `Success! grantdesk was rolled back to grantdesk-6vf6maz6b-…` |
| 6 | `git revert --no-edit HEAD` then `git push origin main` | 19:51:14 | `63a6065..420de84  main -> main` |
| 6 | `vercel ls --prod -m githubCommitSha=420de84…`, every 30 s | 19:51:52 | `grantdesk-1n7f4l1dx… ● Ready Production 28s` → FINAL |
| 6 | `vercel promote https://grantdesk-1n7f4l1dx-russell-goldenbroits-projects.vercel.app` | 19:52:05 | `Rolling Release serving traffic at initial percentage 10` |
| 6 | `vercel rr inspect` | 19:52:07 | `"state": "ACTIVE"`, canary `grantdesk-1n7f4l1dx…`, `"currentCanaryPercentage": 10` |
| 6 | `vercel rr complete --dpl=https://grantdesk-1n7f4l1dx-russell-goldenbroits-projects.vercel.app` | 19:52:18 | `Requested rolling release completion for dpl_6byFkuSNAfdyBCTV2AXC2gpoMSs6` |
| 6 | `vercel rr inspect`, repeated until done | 19:52:21 | `"state": "COMPLETE"`, `"currentCanaryPercentage": 100` |
| 7 | `git commit -m "docs: rolling release and rollback rehearsal"` then `git push origin main` | see git log | This file |

## What we learned

- With rolling releases on, a push to `main` starts the rolling release by itself. The NEW release began at 19:48:07, the moment the build was Ready. Running `vercel rr start` afterward did not error.
- `vercel rr complete` returns right away, but the release takes a few seconds to switch. The first `inspect` still showed 10%; the next one showed 100%.
- After `vercel rollback`, the FINAL build did not start serving or start a rolling release on its own. Right after `vercel promote`, `inspect` still listed OLD as the current deployment. With rolling releases on, `promote` restarts at 10%.
- CLI 65.2.0 prints deprecation warnings: use `vercel rolling-release` instead of `vercel rr`, `--deployment` instead of `--dpl`, and `--environment production` instead of `--prod`.
