# Live Wires QA Audit Tracker

**Started:** 2025-12-04
**Status:** In Progress
**Approach:** Document issues first, fix with approval

---

## Audit Phases

| Phase | Status | Issues Found | Issues Fixed |
|-------|--------|--------------|--------------|
| 1. Documentation Compliance | ✅ Complete | 18 | 18 |
| 2. Code Quality | ⏳ Pending | 0 | 0 |
| 3. Component Verification | ⏳ Pending | 0 | 0 |
| 4. Guide Site | ⏳ Pending | 0 | 0 |
| 5. Example Site | ⏳ Pending | 0 | 0 |
| 6. Accessibility | ⏳ Pending | 0 | 0 |
| 7. Dev Tools | ⏳ Pending | 0 | 0 |
| 8. Build System | ⏳ Pending | 0 | 0 |
| 9. Cross-Browser | ⏳ Pending | 0 | 0 |
| 10. Reality Check | ⏳ Pending | 0 | 0 |

---

## Issue Log

### Issue Template
```
### ISSUE-XXX: [Title]
- **Phase:** X
- **Severity:** Critical | High | Medium | Low
- **File(s):** path/to/file.ext
- **Description:** What's wrong
- **Expected:** What should be
- **Actual:** What is
- **Status:** 🔴 Open | 🟡 Approved | 🟢 Fixed
- **Fix Applied:** (description of fix, if any)
```

---

## Phase 1: Documentation Compliance Audit

### Findings

---

### ISSUE-001: README.md - Wrong directory name
- **Phase:** 1
- **Severity:** High
- **File(s):** [README.md:79](README.md#L79)
- **Description:** Directory structure shows `1_settings/` but actual directory is `1_tokens/`
- **Expected:** `1_tokens/`
- **Actual:** `1_settings/`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-002: README.md - Non-existent token names
- **Phase:** 1
- **Severity:** Critical
- **File(s):** [README.md:51-54](README.md#L51-L54)
- **Description:** Shows `--space-1`, `--space-2`, `--space-3` tokens but these don't exist. Actual tokens are `--line-*`
- **Expected:** `--line-1`, `--line-2`, `--line-3`, etc.
- **Actual:** `--space-1`, `--space-2`, `--space-3`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-003: README.md - Wrong utility example tokens
- **Phase:** 1
- **Severity:** High
- **File(s):** [README.md:133-137](README.md#L133-L137)
- **Description:** Utility example shows `--space-4`, `--space-2`, `--space-3` in comments but actual CSS uses `--line-*`
- **Expected:** Comments referencing `--line-*` tokens
- **Actual:** Comments show `--space-*` tokens
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-004: README.md - Wrong typography class naming
- **Phase:** 1
- **Severity:** High
- **File(s):** [README.md:140-145](README.md#L140-L145)
- **Description:** Shows `text-4` class but actual classes use Tailwind-style naming (`text-xs` through `text-9xl`)
- **Expected:** `text-lg`, `text-xl`, `text-2xl`, etc.
- **Actual:** `text-4`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-005: README.md - Wrong token directory reference
- **Phase:** 1
- **Severity:** Medium
- **File(s):** [README.md:159](README.md#L159)
- **Description:** Says tokens are in `src/css/1_settings/` but they're in `src/css/1_tokens/`
- **Expected:** `src/css/1_tokens/`
- **Actual:** `src/css/1_settings/`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-006: DEV-TOOLS.md - Wrong token names
- **Phase:** 1
- **Severity:** Medium
- **File(s):** [DEV-TOOLS.md:66](DEV-TOOLS.md#L66)
- **Description:** References `--space-*` tokens but actual tokens are `--line-*`
- **Expected:** `--line-*`
- **Actual:** `--space-*`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-007: SKILL.md - Wrong sidebar variant name
- **Phase:** 1
- **Severity:** High
- **File(s):** [.claude/skills/livewires/SKILL.md:59](.claude/skills/livewires/SKILL.md#L59)
- **Description:** Documents `sidebar-right` but actual class is `sidebar-reverse`
- **Expected:** `sidebar-reverse`
- **Actual:** `sidebar-right`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-008: SKILL.md - Missing stack-half variant
- **Phase:** 1
- **Severity:** Low
- **File(s):** [.claude/skills/livewires/SKILL.md:30-36](.claude/skills/livewires/SKILL.md#L30-L36)
- **Description:** Stack documentation missing `stack-half` variant which exists in actual CSS
- **Expected:** Include `stack-half` (uses `--line-05`)
- **Actual:** Only shows compact, comfortable, spacious
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-009: SKILL.md - Incomplete spacing token list
- **Phase:** 1
- **Severity:** Low
- **File(s):** [.claude/skills/livewires/SKILL.md:17](.claude/skills/livewires/SKILL.md#L17)
- **Description:** Shows `--line-0` through `--line-6` but actual code has `--line-7` and `--line-8`
- **Expected:** Include `--line-7`, `--line-8`
- **Actual:** Stops at `--line-6`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-010: SKILL.md - Wrong cluster variant name
- **Phase:** 1
- **Severity:** High
- **File(s):** [.claude/skills/livewires/SKILL.md:52](.claude/skills/livewires/SKILL.md#L52)
- **Description:** Documents `cluster-space-between` but actual class is `cluster-between`
- **Expected:** `cluster-between`
- **Actual:** `cluster-space-between`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-011: SKILL.md - Missing cover variants
- **Phase:** 1
- **Severity:** High
- **File(s):** [.claude/skills/livewires/SKILL.md:79-81](.claude/skills/livewires/SKILL.md#L79-L81)
- **Description:** Documents `cover-full` variant and `--cover-bg` custom property, but these don't exist in actual CSS
- **Expected:** Remove or implement these features
- **Actual:** Cover layout has no variants, no `--cover-bg` property
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-012: Naming Inconsistency - Box uses double-dash
- **Phase:** 1
- **Severity:** Medium
- **File(s):** [src/css/5_layouts/box.css:12-17](src/css/5_layouts/box.css#L12-L17)
- **Description:** Box uses BEM-style double-dash (`box--tight`, `box--loose`) while all other layouts use single-dash (`stack-compact`, `sidebar-loose`, `center-wide`)
- **Expected:** Consistent naming: either all double-dash (BEM) or all single-dash
- **Actual:** Box is the only layout using double-dash modifiers
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-013: SKILL.md - Missing section variants
- **Phase:** 1
- **Severity:** Medium
- **File(s):** [.claude/skills/livewires/SKILL.md:69-74](.claude/skills/livewires/SKILL.md#L69-L74)
- **Description:** Section documentation missing several variants that exist: `section-spaced`, `section-full-bleed`, `section-wide`, `section-snug`
- **Expected:** Document all variants
- **Actual:** Only shows tight, top-tight, bottom-tight
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-014: SKILL.md - Missing cluster-compact variant
- **Phase:** 1
- **Severity:** Low
- **File(s):** [.claude/skills/livewires/SKILL.md:49-53](.claude/skills/livewires/SKILL.md#L49-L53)
- **Description:** Cluster documentation missing `cluster-compact` variant which exists in actual CSS
- **Expected:** Include `cluster-compact`
- **Actual:** Not documented
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-015: SKILL.md - Missing cluster-end variant
- **Phase:** 1
- **Severity:** Low
- **File(s):** [.claude/skills/livewires/SKILL.md:49-53](.claude/skills/livewires/SKILL.md#L49-L53)
- **Description:** Cluster documentation missing `cluster-end` variant which exists in actual CSS
- **Expected:** Include `cluster-end`
- **Actual:** Not documented
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-016: CLAUDE.md - References non-existent prose.css
- **Phase:** 1
- **Severity:** High
- **File(s):** [CLAUDE.md:104](CLAUDE.md#L104)
- **Description:** CLAUDE.md references `prose.css` component file that doesn't exist in the codebase
- **Expected:** Either create prose.css or remove the reference
- **Actual:** File `src/css/6_components/prose.css` does not exist
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-017: CLAUDE.md - Wrong JS filename
- **Phase:** 1
- **Severity:** Medium
- **File(s):** [CLAUDE.md:41](CLAUDE.md#L41)
- **Description:** Directory structure shows `dev-tools.js` but actual file is `prototyping.js`
- **Expected:** `prototyping.js`
- **Actual:** `dev-tools.js`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

### ISSUE-018: CLAUDE.md - Incomplete spacing token list
- **Phase:** 1
- **Severity:** Low
- **File(s):** [CLAUDE.md:122-136](CLAUDE.md#L122-L136)
- **Description:** Shows `--line-0` through `--line-6` but actual code includes `--line-7`, `--line-8`, and `--line-1px`
- **Expected:** Include all spacing tokens
- **Actual:** Missing `--line-7`, `--line-8`, `--line-1px`
- **Status:** 🔴 Open
- **Fix Applied:** -

---

## Phase 1 Summary

**Total Issues Found:** 18

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 7 |
| Medium | 5 |
| Low | 5 |

**Key Themes:**
1. **Token naming mismatch**: README.md uses outdated `--space-*` naming, actual is `--line-*`
2. **Directory naming mismatch**: README.md uses `1_settings/`, actual is `1_tokens/`
3. **SKILL.md incomplete**: Many layout variants undocumented or incorrectly named
4. **Naming inconsistency**: Box uses BEM double-dash, others use single-dash
5. **Missing/phantom files**: prose.css referenced but doesn't exist

---

## Phase 2: Code Quality Audit

### Findings

(Pending)

---

## Phase 3: Component Verification

### Findings

(Pending)

---

## Phase 4: Guide Site Audit

### Findings

(Pending)

---

## Phase 5: Example Site Audit

### Findings

(Pending)

---

## Phase 6: Accessibility Audit

### Findings

(Pending)

---

## Phase 7: Dev Tools Audit

### Findings

(Pending)

---

## Phase 8: Build System Audit

### Findings

(Pending)

---

## Phase 9: Cross-Browser Testing

### Findings

(Pending)

---

## Phase 10: Reality Check

### Summary

(Pending)

---

## Approved Fixes Queue

| Issue | Description | Status |
|-------|-------------|--------|
| - | - | - |

---

## Completed Fixes

| Issue | Description | Commit |
|-------|-------------|--------|
| - | - | - |
