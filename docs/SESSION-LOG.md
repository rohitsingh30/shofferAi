# ShofferAI — Development Session Log

A running log of every Copilot CLI development session. Each entry captures what was done, key decisions, and files changed — so we can review, learn, and course-correct.

> **For the developer**: After each session, add notes on what worked / what didn't under the relevant entry. This feedback loop helps the AI improve across sessions.

---

## 2026-03-21 — Session logging & documentation rules

**Goal**: Set up session logging and enforce documentation updates with every change.

**What was done**:
- Created `docs/SESSION-LOG.md` (this file) for tracking all Copilot CLI sessions
- Updated `.github/copilot-instructions.md` with documentation-update and session-logging rules
- Updated cofounder skill to include documentation requirements in the dev loop

**Files changed**:
- `docs/SESSION-LOG.md` (created)
- `.github/copilot-instructions.md` (updated — added Documentation & Session Logging section)
- `.github/skills/cofounder/SKILL.md` (updated — added step 6.5 for docs/log)

**Key decisions**:
- Session log lives in `docs/SESSION-LOG.md` (committed to repo, reviewable in PRs)
- Each entry: date, goal, what was done, files changed, decisions, feedback section
- Newest sessions at the top for easy scanning

**What worked / what didn't** *(fill in after review)*:
- _TBD_

---

<!-- 
## TEMPLATE — Copy this for new sessions

## YYYY-MM-DD — Short title

**Goal**: What the session set out to accomplish.

**What was done**:
- Bullet list of changes made

**Files changed**:
- `path/to/file` (created/updated/deleted — brief note)

**Key decisions**:
- Any architectural or design choices worth remembering

**What worked / what didn't** *(fill in after review)*:
- 
-->
