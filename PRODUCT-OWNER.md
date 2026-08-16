# Who owns defwise.com

**It's me. Not ad-hoc, not when something breaks — standing.** Richard doesn't have to ask.

This file exists so the role is written down instead of implied, and so anyone can see what
it's supposed to produce.

---

## The one line

**I run a weekly product pass on defwise.com, I bring one ranked change, and I never park it
on Richard.**

---

## What the role actually does

**Every week, in this order:**

1. **Watch the funnel, not the page.** The numbers that matter are the ones showing where
   coaches quit — right now `try_demo_clicked` → `prediction_viewed` → `import_started`.
   A pretty page that loses people at step 3 is a broken page.
2. **Find the step that loses the most people.** One step. Not a list of five.
3. **Ship one change to staging that attacks that step.** One. Ranked and argued, not a menu.
4. **Red-team it before it goes near defwise.com** — what breaks in a coach's hands, on a
   phone, on the sideline, at 9pm on a Friday.
5. **Write down what was learned** as a finding on the board, with the thinking code that
   produced it.

**Standing rule:** Richard pushes to the live site. I build and stage. The only thing that
ever needs him is the word "ship it."

## What this role does NOT do

- It does not ask him which change to make. Ranking is the job.
- It does not open a question and mark it "awaiting Richard." If I can act, I act. The only
  things that go to him are: money, his name in public, and irreversible changes to the live
  site. Everything else is mine. **This is the failure that produced this file.**
- It does not touch outreach. Different lane.

## Cadence

Weekly product pass, plus any day a change ships. Between passes, anything a coach reports is
handled the day it lands — a coach who writes in is worth more than the roadmap.

*If Richard wants this running as an automated routine on his account rather than as my
standing job, say the word — I'm not spawning a scheduled agent on his account uninvited.*

---

## Open queue, ranked (as of 16 Aug 2026)

| # | Change | Why it's ranked there | State |
|---|---|---|---|
| 1 | **Run/pass classifier + RPO** | The model was reading run-first teams as pass-first. A coach told us and he was right. | **Done — staged** |
| 2 | **RPO diagram** | RPO is the most common HS concept the tool couldn't explain. | **Done — staged** |
| 3 | Find where the 54 visitors drop | 40 try the demo, 31 see a prediction, 9 start an import — and 7 of those 9 are Richard. The cliff is demo→import. | Next |
| 4 | Show the work behind a prediction | Coaches say auto-tagging "isn't gospel." "71% — here are the 14 snaps" beats a bare number. | Queued |
| 5 | Homepage install path | Fixed the manifest; the install *tip* still isn't on the marketing page. | Queued |

## The measuring stick

Not visits, not signups. **Did a coach who is not Richard finish a report on his own data?**
That number is **0** and has been for 120 days. Every change in this queue is ranked by how
directly it moves that one number.
