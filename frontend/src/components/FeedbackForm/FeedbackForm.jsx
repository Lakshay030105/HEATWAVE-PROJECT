// ============================================================================
// FeedbackForm.jsx — Citizen Heat-Illness Report Form
// Owner: Member 4 (Frontend/UX Developer)
// When to build: Day 3 (UI), Day 4 (wire to API)
// ============================================================================
//
// PURPOSE:
//   Allow citizens to report heat-related illness or issues.
//   This creates a "feedback loop" — citizen reports can nudge a ward's
//   vulnerability score, which is a differentiating feature.
//
// WHAT TO BUILD:
//
//   1. FORM FIELDS:
//      - Ward selection (dropdown, from ward list)
//      - Report type (radio buttons):
//        ○ Heat illness (sunstroke, dehydration, etc.)
//        ○ Infrastructure issue (broken water supply, closed cooling center)
//        ○ General feedback
//      - Severity (radio buttons):
//        ○ Mild
//        ○ Moderate
//        ○ Severe
//      - Description (textarea, optional)
//      - Contact phone (input, optional)
//
//   2. SUBMIT BEHAVIOR:
//      - Call POST /api/feedback with the form data
//      - Show success toast: "Thank you! Your report helps protect your community."
//      - Clear the form after submission
//      - Show a small counter: "X reports submitted today" (from a GET endpoint)
//
//   3. VALIDATION:
//      - Ward and report type are required
//      - Description max 500 characters
//      - Phone format validation (optional field)
//
// WHY THIS MATTERS FOR JUDGES:
//   The feedback loop shows the system isn't just top-down (authorities → citizens)
//   but also bottom-up (citizens → system → authorities). This is a strong
//   differentiator. In your pitch, say: "Citizen reports feed back into the
//   vulnerability score, creating a self-improving system."
//
// DEPENDENCIES:
//   - api.js (POST /api/feedback)
//   - AppContext (ward list for dropdown)
//
// ============================================================================
