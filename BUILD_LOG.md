# Recovery MVP: Product Brief, Build Log & System Architecture

## 1. Product Brief Recap
* **One-Line Scope:** A web-based safety net that lets students and creators using AI tools save and restore project checkpoints so they can immediately return to a known working version when an AI edit causes a regression.
* **Problem Addressed:** Users can generate interfaces quickly with AI, but struggle when an edit silently breaks a core function or layout. They waste prompts trying to get the AI to fix itself. This MVP enables one-click recovery to a known-good state.
* **Target Audience:** Students, vibe coders, and early-stage makers pair-programming with LLMs.

---

## 2. Plain Language Explanation of Each File
*(Use this section during course review when asked: "What does this part do?")*

### `index.html`
* **What it does:** The single-page visual layout containing all five wireframe views:
  1. **Top Bar & Badge:** Displays the title, "+ Save Recovery Point" button, and a dynamic count badge of saved checkpoints.
  2. **Screen 1 (Project Workspace):** An interactive demo app (Story-to-Video Generator) representing the user's project. Contains a working generator, a story text area, and an intentional "Simulate AI Regression" button to test what happens when AI edits break code.
  3. **Screen 2 (Recent Checkpoints):** A clean reverse-chronological list of saved points with timestamps and labels.
  4. **Screens 3 & 4 (Review & Confirm Restore):** A comparison card detailing what checkpoint will be restored, what edits will be reverted, and clear "Cancel" vs "Restore Checkpoint" buttons.
  5. **Screen 5 (Verification Checklist):** A 3-step checklist to guide the student through verifying the restored functionality before resuming development.
* **Tech choice:** HTML5 + Tailwind CSS (via CDN) for responsive, clean styling without requiring `node_modules`.

### `app.js`
* **What it does:** The application state machine and storage controller:
  1. **Local Storage Engine:** Reads and writes checkpoint snapshots into the browser's `localStorage` (`recovery_mvp_checkpoints`).
  2. **Seed Data:** Preloads two realistic checkpoints (`Before "Connect Video"` and `Before "update story form"`) matching the paper wireframe sketches.
  3. **Snapshot Creator:** Captures the current timestamp, label, notes, and workspace content into a new checkpoint object and prepends it to the list.
  4. **Restore Engine:** Replaces the active project state with the selected snapshot in one click and transitions directly to Screen 5 (Verification).
  5. **Screen Switcher:** Handles show/hide transitions between Screens 1, 2, 3/4, and 5.

---

## 3. MoSCoW Feature Checklist

| Feature | MoSCoW | Status | Reason / Implementation Details |
|---|---|---|---|
| **Save a recovery point before an AI change** | **Must-have** | **DONE** | Implemented modal + timestamped snapshot stored in `localStorage`. |
| **List recent recovery points with time & label** | **Must-have** | **DONE** | Screen 2 renders chronological cards with time, title, and review action. |
| **Restore selected recovery point in 1 clear action** | **Must-have** | **DONE** | One-click button on Screen 4 reverts project state & opens verification. |
| *Preview what restore replaces* | *Should-have* | **DONE** | Screen 3 displays affected files list (`videoForm.js`, `videoService.js`). |
| *Confirm selected restore point* | *Should-have* | **DONE** | Screen 4 explicit confirmation modal with Cancel / Proceed buttons. |
| *Recheck affected feature after restore* | *Should-have* | **DONE** | Screen 5 interactive 3-step smoke test checklist. |
| *Branching / multiple paths* | *Could-have* | **CUT** | Cut to prevent scope creep; not required to achieve the core recovery loop. |
| *AI Code Generation / Repair* | *Won't-have* | **CUT** | Excluded; this product is a version recovery tool, not a code synthesizer. |
| *User Auth & Remote DB* | *Won't-have* | **CUT** | Excluded; `localStorage` fulfills all MVP criteria with zero latency. |

---

## 4. Build Log (Session History)

### Session 1: Setup, Architecture & Core Engine
* **Prompt:** "make a new folder is /Users/armansharma named my-mvp and build it there"
* **What Worked:**
  - Directory `/Users/armansharma/my-mvp` created cleanly.
  - Built zero-dependency `index.html` and `app.js` matching all five screens from the paper wireframes and interview feedback.
  - Implemented the full interactive recovery cycle: Type text ➔ Generate video (works) ➔ Simulate break (fails) ➔ Open checkpoints ➔ Review ➔ Restore ➔ Verify.
* **What Broke & How it Was Fixed:**
  - *Edge case:* Refreshing the page was resetting custom created checkpoints.
  - *Fix:* Added `localStorage` initialization check (`initStorage()`) and persistence helpers (`saveCheckpoints()`) so checkpoints survive browser reloads.
  - *Edge case:* Navigating backwards from Screen 3 or Screen 5 could leave screens stacked.
  - *Fix:* Centralized screen switching through `showScreen(screenId)` to guarantee all other screens are hidden when switching views.

---

## 5. Hallway Usability Test Script (Ready for Peer Testing)
1. **Prompt for Tester:** "Imagine you were building a website and an AI edit broke the video generation feature. Use this tool to return to a version that worked."
2. **Observe:**
   - Did they click "Recent Checkpoints" or the link below the error?
   - Did they find the "Before Connect Video" checkpoint?
   - Was the single-action restore button clear?
   - Did they complete the 3-step checklist on the verification screen?
3. **Record feedback** directly into this file before submitting.
