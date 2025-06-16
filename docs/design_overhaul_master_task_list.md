# Design‑Overhaul · Master Task List  
_Each numbered section is a prompt you will pass to Lovable AI Agent.  
Do **not** merge steps or skip the “ask‑if‑unsure” rule._

---

## TASK 0 — Project Kick‑off & Environment Check

Context
• Repo: https://github.com/jsprice87/fill-the-field.git
• We are embarking on a front‑end‑only design overhaul—goal: a visually stunning, modern UI.
• All serverless functions, Supabase tables, and business logic MUST remain untouched.
• The /free‑trial/ landing page keeps its existing colors, fonts, and images.
• A full PRD and Style Guide already exist in docs/.

Your Objectives
	1.	Create branch feat/ui‑refresh‑phase‑0.
	2.	Run npm i → ensure it installs cleanly; stop and ask if any audit issues > high.
	3.	Output an inventory of current front‑end frameworks in use (React version, Tailwind?, custom CSS, etc.).
	4.	Suggest if any dependencies need upgrading for design cohesion—but do not upgrade yet; just list.
	5.	End with clear open questions or “None—ready to proceed”.

Guard‑rails
	•	No code changes in this task—just analysis.
	•	If any instruction is ambiguous, STOP and ask.
	•	Never guess: unknowns are surfaced as questions.

Deliverable
A markdown summary containing:
• dependency inventory
• potential upgrade list
• open questions

---

## TASK 1 — Dependency Upgrade & Storybook Bootstrapping

Context
• Answers from TASK 0 have been approved.
• We will adopt Tailwind 3, shadcn/ui, Radix‑UI, lucide‑react.

Objectives
	1.	In feat/ui‑refresh‑phase‑0:
a. Upgrade React, Vite, and any dependencies flagged in TASK 0.
b. Install Tailwind 3, shadcn/ui CLI, Radix‑UI, lucide‑react.
	2.	Bootstrap Storybook 8 with Vite builder; add one test story for a Button.
	3.	Docs: create docs/STORYBOOK.md with setup & run instructions.

Guard‑rails
	•	Do not touch /free‑trial/ code or CSS.
	•	If build fails, rollback and report; do not force‑fix by hacking backend.
	•	Ask questions if any TypeScript errors are unclear.

Deliverable
• Git diff summary
• Screenshot of Storybook running the test Button
• List of questions (if any)

---

## TASK 2 — Global Design Tokens

Context
• Tokens defined in docs/Style_Guidelines_Fill‑The‑Field.md.

Objectives
	1.	Extend tailwind.config.js with color palette & typography tokens.
	2.	Add src/styles/tokens.css exporting CSS custom properties for dark/light.
	3.	Apply base styles to <body>:
	•	light: bg-gray-50 text-gray-700
	•	dark : bg-gray-900 text-gray-300
	4.	Create stories/TokenPreview.stories.tsx showing color swatches & text styles.

Guard‑rails
	•	Do NOT import these tokens into /free‑trial/.
	•	Stop if token name clashes with existing classes.
	•	Validate with npm run lint && npm run typecheck.

Deliverable
• Diff summary
• Storybook screenshot
• Open questions

---

## TASK 3 — Core Layout & Sidebar Overhaul

Context
• We need a fixed, elegant sidebar with collapsible behaviour.

Objectives
	1.	Replace AppSidebar.tsx & DashboardLayout.tsx with shadcn Layout primitives.
	2.	Sidebar states:
• Desktop ≥ 1024 px: 240 px wide text+icon list.
• Tablet 768–1023 px: 72 px icon‑only.
• Mobile < 768 px: Radix Drawer.
	3.	Place Dark‑mode toggle in sidebar footer.
	4.	Ensure z‑index (sidebar 50, header 20, content 10).
	5.	Provide keyboard / screen‑reader support (aria‑expanded etc.).

Guard‑rails
	•	All routes & links must still work.
	•	Do not touch Supabase queries.
	•	If any animation causes layout jank, pause and ask.

Deliverable
• Demo GIF (or textual walk‑through)
• Updated snapshots/tests
• Questions

---

## TASK 4 — UI Primitives Migration

Context
• We need consistent Buttons, Cards, Tooltips, Toggles.

Objectives
	1.	Generate shadcn components: Button, Card, Tooltip, Switch.
	2.	Replace legacy versions across the codebase (search & refactor).
	3.	Ensure size variants, colors, and disabled states match Style Guide.
	4.	Add one Storybook story per primitive.

Guard‑rails
	•	Props API must stay backward‑compatible, or else adapt call‑sites.
	•	Keep bundle size ≤ +10%.
	•	Ask before deleting any custom CSS file.

Deliverable
• Diff summary
• Storybook links
• Any blockers

---

## TASK 5 — Status Badge Selector & Row Menu

Context
• Requirements approved earlier: clickable status badge, dropdown menu.

Objectives
	1.	Build StatusBadgeSelector with Radix Dropdown; integrate mutation logic.
	2.	Build TableRowMenu (MoreVertical icon) with Call, View/Edit, Archive, Delete.
	3.	Remove legacy Actions column; keep feature parity.
	4.	Write unit tests for optimistic update path & error toast.

Guard‑rails
	•	Mutation endpoints unchanged.
	•	Badge colors per Style Guide.
	•	Stop if enum mapping is unclear.

Deliverable
• Before/after table screenshot
• Updated tests passing
• Questions

---

## TASK 6 — Sticky Table Headers & Scrolling

Context
• Tables should scroll, headers stay visible.

Objectives
	1.	Wrap metrics cards (header) in sticky top-0 z-40.
	2.	Wrap <table> in overflow-x-auto and vertical max‑height container.
	3.	Confirm horizontal scroll does not overlay sidebar.
	4.	Ensure mobile breakpoints still readable.

Guard‑rails
	•	Do not change data‑fetch logic.
	•	If mobile overflow looks bad, ask for design clarification.

Deliverable
• GIF of scrolling behaviour
• Diff summary
• Questions

---

## TASK 7 — Forms & Dialogs Modernisation

Context
• Some dialogs/forms use ad‑hoc modals.

Objectives
	1.	Convert forms (Location, Class, Lead Edit…) to shadcn Form + Radix Dialog.
	2.	Preserve validation, toast notifications, API calls.
	3.	Match spacing & button hierarchy per Style Guide.

Guard‑rails
	•	Do not drop any existing input or validation rule.
	•	Pause if you find unknown field names.

Deliverable
• List of converted forms
• Manual test results
• Questions

---

## TASK 8 — Dark‑Mode Polish & Motion Rules

Context
• Base dark tokens exist; refine contrast & motion.

Objectives
	1.	Audit every page with axe‑core in dark mode; fix contrast < 4.5.
	2.	Respect prefers-reduced-motion (disable transforms).
	3.	Add 200 ms ease motion to sidebar collapse/expand.

Guard‑rails
	•	No layout shift that breaks tests.
	•	Ask before altering primary‑500 shade.

Deliverable
• Axe report (0 critical issues)
• Diff summary
• Questions

---

## TASK 9 — Final QA & Release

Context
• All feature branches merged into feat/ui‑refresh‑release‑candidate.

Objectives
	1.	Run full Cypress e2e; fix any failures.
	2.	Manual smoke test on Chrome, Safari, Firefox, mobile viewport.
	3.	Deploy preview; share link for stakeholder sign‑off.
	4.	After approval, merge into main, tag release v2-ui-refresh.
	5.	Publish CHANGELOG & announce in Slack.

Guard‑rails
	•	Roll back if any 500 error appears in logs.
	•	No deploy on Friday after 3 pm PT without approval.

Deliverable
• Release URL
• CHANGELOG entry
• Confirmation of green CI

---

### How to Use

1. Save this file as `tasks/design_overhaul_master_task_list.md`.  
2. Open a fresh chat with Lovable AI Agent, paste TASK 0, wait for completion.  
3. Review & merge code, then proceed to TASK 1, and so on.

**Remember:** _Visually stunning, no backend edits, no guesses—always stop and ask when unsure._  


⸻

End of file.
