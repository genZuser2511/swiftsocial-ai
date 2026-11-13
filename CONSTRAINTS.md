# Project Constraints & Rules

This file serves as a strict guideline for AI operations and development workflows within this repository.

## Database & Schema Management
- **[PERMANENT] NEVER modify `seed.sql`**: This file contains the foundational seed data and must remain untouched to preserve the initial state fallback.
- **[PERMANENT] NEVER modify `schema_original.sql`**: This file is a backup of the original schema structure and must not be altered under any circumstances.
- **[PERMANENT] ALL schema changes MUST go in `schema.sql`**: Any new tables, columns, RLS policies, or database modifications must be written exclusively in `schema.sql`. This ensures the file is always up-to-date and ready to be directly copied and pasted into the Supabase SQL Editor.

## UI & Design
- **[PERMANENT] Color Scheme**: The color scheme for any new UI additions MUST match the current project color scheme, which is strictly **black and gold**. Do not introduce unapproved color palettes.
- **[PERMANENT] Functional UI Elements**: Each button and any new UI feature added must work and perform its necessary function. After adding any new UI element, verify that it fulfills its intended purpose (e.g., adding a delete button must delete the item from both the page and the database).
- **[PERMANENT] Automatic Mock Pages**: If a button or link leads to a page (e.g., a "Billing" page) that does not exist, and no specific page creation was detailed in the implementation plan or by the user, you MUST by default create a fully working or mock page for it to ensure a complete, unbroken user experience.
- **[PERMANENT] Future Upgrades Tracking**: Any feature, page, or API integration that is created as a "mock" or simulated experience MUST be documented in `FUTURE_UPGRADES.md`. Use a `[NO]` tag if it is still a mock, and update it to a `[YES]` tag when it is replaced with a fully working version.

## Planning & Documentation Structure
- **[PERMANENT] Three-Document Planning System**: All development must follow the centralized 3-doc structure to ensure long-term consistency:
    1. **MASTER_PLAN.md (1st Doc)**: Contains the entire project roadmap and all planned features. This is updated whenever a new major requirement is introduced.
    2. **implementation_plan.md (2nd Doc)**: The active execution plan for the current task. This is the "artifact" I submit for user approval. It is rewritten or updated for every new sprint based on the Master Plan.
    3. **IMPLEMENTED_HISTORY.md (3rd Doc)**: A log of all successfully implemented features, including summaries and key technical points. This is updated as soon as a part of the plan is completed.
- **[PERMANENT] Context Preservation**: Before starting any new sprint, I MUST review the `MASTER_PLAN.md` and `IMPLEMENTED_HISTORY.md` to ensure the new work aligns with the project's total progress.

## Deployment & Version Control
- **[PERMANENT] Vercel Deployments**: All code changes MUST be explicitly confirmed and approved by the user BEFORE they are pushed or deployed to Vercel. Do not automatically deploy without user consent.
