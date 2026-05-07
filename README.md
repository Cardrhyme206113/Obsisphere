# [Obsisphere](https://cardrhyme206113.github.io/Obsisphere/) - Advanced server management web UI

*A Minecraft plugin with an embedded web control panel for Paper/Spigot servers on 1.21.4+.*

Current status: the core panel, permissions, authentication flow, audit tooling, and major admin pages are already in place. Development Phase 3 is focused on transport hardening, integrations, compatibility expansion, and long-tail polish.

## Preview Images
![Preview 1](1.png)
![Preview 2](2.png)
![Preview 3](3.png)
![Preview 4](4.png)
![Preview 5](5.png)

## Development Phase 1 - Core panel

### Dashboard and monitoring
- [x] Real-time dashboard graphs for memory, CPU, players, TPS, MSPT, loaded chunks, and entity count.
- [x] Server information widgets for IP, version, software, MOTD, and uptime.
- [x] Server control shortcut for stopping the server from the panel.

### File manager
- [x] Directory browser with breadcrumbs and selection tools.
- [x] Create files and folders.
- [x] Upload files and folders.
- [x] Edit text files in-browser.
- [x] Preview media files such as images and videos.
- [x] Download individual files.
- [x] Rename, move, copy, and delete files or folders.
- [x] Bulk ZIP download.
- [x] Archive selected files into ZIP files on the server.
- [x] Extract ZIP archives from the panel.

### Player and server administration
- [x] Online player list with moderation actions.
- [x] Kick, permanent ban, and temporary ban actions.
- [x] Whitelist management page.
- [x] Operator management page.
- [x] Plugin manager with installed plugin control and remote Spigot search/install flow.
- [x] World manager with active worlds, backup creation, restore, delete, and download.
- [x] World settings page for time, weather, difficulty, and supported gamerules.

### Live tools
- [x] Live block map with zoom, pan, multi-world support, and player tracking.
- [x] Inventory inspection and editing for online and offline players.
- [x] Scheduler for timed multi-step console commands.
- [x] X-Ray watch page for suspicious mining patterns.
- [x] Real-time console with docked and fullscreen modes.

### Logging and appearance
- [x] Activity log viewer.
- [x] Audit log viewer.
- [x] Theme system with bundled themes, saved appearance preferences, accent color, and background patterns.
- [x] Theme editor page.
- [x] Responsive sidebar, modals, toasts, and mobile-aware layout handling.

## Development Phase 2 - Implemented expansion

### Authentication and account system
- [x] First-run bootstrap flow for creating the master account from a one-time expiring setup link.
- [x] TOTP-based 2FA with QR setup support.
- [x] Forced onboarding flow for newly created users that must change password and register 2FA before doing anything.
- [x] Password policy enforcement for account creation and password changes.
- [x] Account settings for changing username and password.
- [x] Panel logout flow and real settings page replacing the old theme-only page.

### Users, roles, and permission system
- [x] Full panel user management with master account support.
- [x] Role creation, editing, deletion, and assignment.
- [x] Direct user permissions plus inherited role permissions.
- [x] Detailed server-side permission enforcement for pages and sub-features.
- [x] Dependency-aware permission UI.
- [x] Console execution policy per user and role:
  - [x] No limitation mode
  - [x] Whitelist mode
  - [x] Blacklist mode
  - [x] Exact command rules
  - [x] Regex rules
  - [x] Contains-word rules
- [x] Session-aware user presence indicators in user management:
  - [x] Online/offline panel state
  - [x] Current page
  - [x] Session duration
  - [x] Last seen time

### New management pages and deeper admin tooling
- [x] Separate Players page distinct from panel Users.
- [x] Banned Players page with pardon actions.
- [x] Failed Authentications page with review and response controls.
- [x] Restored and expanded player statistics page.
- [x] Improved live-map player detail view for smaller screens.

### Logging and auditing upgrades
- [x] Activity and audit logs moved to database-backed storage.
- [x] Legacy YAML log migration to database-backed logging.
- [x] Richer activity logging for:
  - [x] Movement
  - [x] Block place and break
  - [x] Inventory interaction
  - [x] Item pickup and drop
  - [x] Elytra usage
  - [x] Entity interaction, damage, and kills
  - [x] Player-issued commands
  - [x] Web inventory edits
- [x] Recent player activity snapshots exposed to Players and Live Map views.
- [x] Cleaner audit log presentation in the UI.
- [x] Optional real-time panel activity notifications for other panel users.

### Security and hardening
- [x] Role-based access control with per-feature permissions.
- [x] 2FA onboarding support for panel accounts.
- [x] CSRF protection for state-changing requests.
- [x] Brute-force login protection and failed-auth review tooling.
- [x] Audit logging for sensitive panel actions.
- [x] Hardened file-manager path handling.
- [x] LAN-only mode and transport-security warnings.
- [x] Session handling and account-security controls for active panel users.
- [x] In-game and console recovery command for failed-auth IP lockouts.

### World, console, and operator polish
- [x] Incremental console updates instead of re-sending the entire history every refresh.
- [x] More granular world permissions:
  - [x] Separate active-world and backup viewing
  - [x] Separate active-world and backup download permissions
  - [x] Separate active-world and backup delete permissions
  - [x] Separate world-setting permissions for time, weather, difficulty, and supported gamerules
- [x] Split whitelist permissions for toggle vs. entry editing.
- [x] Split operator permissions for add vs. remove.
- [x] Split scheduler permissions for save/update vs. delete.

### Internationalization and UI work
- [x] Thin i18n layer with separate translation files.
- [x] English and Turkish language support.
- [x] Live settings-based language switching.
- [x] PlayHosting theme modernization and extensive layout polish.
- [x] Updated inventory UI and player viewer for PlayHosting.
- [x] Improved graph scaling and graph labeling behavior.

## Development Phase 3 - To do

### Transport and security finish-up
- [ ] Migrate password hashing to Argon2id or bcrypt.
- [ ] Add broader API rate limiting beyond login protection, including IP and session scoped request throttling.
- [ ] Add a configurable root jail for file-manager scope.
- [ ] Add HTTPS-first deployment mode and/or a strong insecure-transport warning banner.
- [ ] Add `Secure` cookies automatically when deployed behind HTTPS.

### Infrastructure and compatibility
- [ ] SSH support.
- [ ] SFTP support.
- [ ] Research and validate whether HTTP/HTTPS/SSH/SFTP multiplexing on one port is practical and maintainable.
- [ ] Extend backwards compatibility toward older server versions, with 1.16.5 as the current target floor.
- [ ] Expand theme coverage and finish consistency polish across all bundled themes.

### Product expansion
- [ ] Public control-panel API for third-party custom frontends.
- [ ] Additional live-map tooling such as sidebar actions and click-to-teleport workflows.
- [ ] WorldGuard integration:
  - [ ] show claims on the map
  - [ ] manage protected areas from the panel
- [ ] LuckPerms integration:
  - [ ] faster web shortcut flow for LuckPerms editing
  - [ ] integration-aware UX when the plugin is absent
- [ ] A broader supported-integrations system for other server plugins.

### Ongoing polish
- [ ] Continued UI and CSS refinement, especially long-tail edge cases in advanced themes.
- [ ] More bundled themes and broader theme-variable coverage.
- [ ] More QA passes for rare edge cases, unusual screen sizes, and high-load server scenarios.
