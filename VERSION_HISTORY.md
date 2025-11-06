# Version History - Tank Tools

## Session Manager v1.0 (November 6, 2025)

### New Features
- ✅ 7-day session expiry system
- ✅ Centralized session management
- ✅ Auto-migration for old sessions
- ✅ Session validation on all pages
- ✅ Settings preservation on logout

### Updated Files
- login.html: v7.0 → v8.0
- dashboard.html: v6.6 → v7.0
- live-tanks.html: v7.7 → v8.0
- tank-management.html: v2.0 → v3.0
- index.html: v5.0 → v6.0
- plcr.html: v3.0 → v4.0
- NMOGASBL.html: v2.0 → v3.0

### New Files
- session-manager.js v1.0

### Bug Fixes
- Fixed tank-management.html logout deleting all localStorage
- Fixed session persistence across browser sessions
- Added Arabic error messages

### Commit
- Hash: 1ef75de
- Date: November 6, 2025
- Branch: main

---

## Previous Versions

### Permissions System v4.0 (November 5, 2025)
- Migrated to pageAccess-based permissions
- Removed old role-based system
- Added permissions.js v4.0

### Live Tanks v7.7 (November 5, 2025)
- Added permission checks in CRUD operations
- Removed hardcoded username checks
- Fixed admin link access

### Dashboard v6.6 (November 4, 2025)
- Fixed getUserPagesAccess() priority
- Added fallback for hasLiveTanksPermission
- Fixed user permissions display

### Tank Management v2.0 (November 5, 2025)
- Migrated to pageAccess-based permissions
- Added localStorage fallback
- Fixed user.uid → username for Firestore

---

**Developer:** Fahad - 17877
