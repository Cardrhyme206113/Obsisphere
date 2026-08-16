# Obsisphere — Detailed Feature Reference

> Source-based inventory of the current Obsisphere / MCWebPanel codebase. This describes implemented behavior rather than the older phase roadmap.

## 1. Core plugin and web panel

- Runs as a Bukkit/Paper-compatible Minecraft plugin with an embedded HTTP server and embedded frontend assets.
- Serves the control panel UI and JSON APIs from the same plugin process.
- Uses bounded HTTP/background executors and dispatches Bukkit-mutating work back to the Minecraft server thread where required.
- Provides authenticated and development build security modes:
  - `AUTH_REQUIRED`
  - `DEV_NO_AUTH`
  - `DEV_NO_AUTH_LAN`
- Includes `/mcwebpanel` with `/mwpanel` and `/mwp` aliases for administrative recovery commands such as failed-auth IP pardoning.
- Fine-grained server-side permission checks back up the frontend page/feature gating.

## 2. Dashboard and server control

- Live dashboard cards and graphs for:
  - JVM memory usage
  - CPU usage
  - online player count
  - TPS
  - MSPT
  - loaded chunks
  - loaded entities
  - uptime
- Server information cards for:
  - server IP/port
  - Minecraft version
  - server software
  - MOTD
- Historical graph sampling with hover inspection and expanded graph views.
- Separate permissions for individual dashboard widgets.
- Server stop and restart controls with separate permissions and audit logging.

## 3. File manager

- Directory browsing with breadcrumbs and file/folder metadata.
- Multi-selection and bulk actions.
- Read/download permissions independent from write permissions.
- In-browser text editing for common text/code formats.
- Image and video preview inside the panel.
- File upload with progress indicators.
- Folder upload support while retaining nested paths.
- Create new files and directories.
- Rename files and folders.
- Move and copy selections between directories.
- Delete files and directories.
- Download selected content as a generated ZIP archive.
- Archive selected server files into a ZIP stored on the server.
- Extract ZIP archives from the panel.
- Hardened path resolution and traversal/symlink checks around managed paths.
- Separate permissions for browsing, reading, saving, uploading, creating, renaming, moving, copying, deleting, archiving, extracting, and downloads.

## 4. Authentication and first-run setup

- One-time first-run bootstrap flow for creation of the master panel account.
- Expiring bootstrap/setup sessions.
- TOTP-based two-factor authentication.
- QR-code/OTP-auth setup support.
- Newly created panel users are forced through onboarding before normal panel access:
  - temporary credentials
  - mandatory password change
  - mandatory TOTP setup
- Password policy validation.
- PBKDF2-based salted password hashing in the current implementation.
- Sliding authenticated sessions with configurable TTL.
- Per-session CSRF tokens for state-changing requests.
- Logout and active-session invalidation support.
- Account username changes without losing roles/permissions.
- Password changes while preserving account ownership and permissions.

## 5. Panel users, roles, and permissions

- Master account support.
- Create, edit, and delete non-master panel users.
- Temporary onboarding credentials for newly created users.
- Create, edit, and delete roles.
- Assign multiple roles to users.
- Direct per-user permissions in addition to inherited role permissions.
- Dependency-aware permission editor so child permissions follow required parent capabilities.
- Permission groups cover the dashboard, files, users/roles, players, chat, bans, statistics, plugins, worlds, backup policies, world settings, map, inventory, whitelist, operators, scheduler, X-Ray, logs, audit, failed auths, console, background, and server control.
- Session-aware presence information in user management:
  - panel online/offline state
  - current page
  - session age
  - last-seen time
- Per-user and per-role console command policies:
  - no restriction
  - whitelist mode
  - blacklist mode
  - exact-command rules
  - regex rules
  - contains-word rules
- Effective console policies merge user and role rules, with whitelist restrictions taking precedence over blacklist rules.

## 6. Player management

- Dedicated Players page separate from panel-user administration.
- Online player roster with:
  - name/UUID
  - current world and coordinates
  - health/max-health
  - hunger
  - playtime
  - recent/current activity summary
- Offline player roster with cached logout world/coordinates, playtime, and last-played information.
- Search/filterable player rosters.
- Player skin/head presentation.
- Moderation actions:
  - kick
  - temporary ban
  - permanent ban
- Configurable action reasons and temporary-ban durations.
- Separate permissions for roster visibility, locations, kick, temp-ban, and permanent ban.

## 7. Public server chat

- Dedicated live Server Chat page.
- Captures public player-visible chat including:
  - normal player chat
  - server broadcasts
  - `/say`
  - `/me`
  - joins
  - quits
  - deaths
- Bounded in-memory recent chat history.
- Sends messages from authenticated panel administrators into the Minecraft server chat.
- Panel-originated messages are identified with the panel administrator username.
- Minecraft legacy/hex color-code handling for panel-sent chat.
- Send cooldown/rate guard for panel messages.
- Player-head integration in the chat UI.
- Independent `chat.view` and `chat.send` permissions.

## 8. Bans, whitelist, and operators

### Banned players
- View current player-ban entries.
- Pardon bans from the panel.
- UUID/name-safe handling for entries.

### Whitelist
- View current whitelist state and entries.
- Enable or disable whitelist enforcement.
- Add whitelist entries.
- Remove whitelist entries.
- Separate permissions for toggling whitelist vs editing entries, with add/remove sub-permissions.

### Operators
- View server operators.
- Grant operator status.
- Revoke operator status.
- Separate grant and revoke permissions.

## 9. Player statistics

- Player-stat roster based on available Minecraft stat files.
- Player search.
- Player head/avatar display.
- Statistics metadata endpoint and category catalog.
- Categories include:
  - custom statistics
  - mined blocks
  - broken items
  - crafted items
  - used items/blocks
  - picked-up items
  - dropped items
  - entities killed
  - killed-by entities
- Search within statistics.
- Category filtering.
- Optional zero-value hiding.
- Paginated statistic table.
- Formatted statistic values and item/entity icons.
- TXT export of player statistics.
- Export respects the zero-value visibility option, so hidden zeroes are not exported.
- Split permissions for roster, metadata, and individual player stat-file access.

## 10. Plugin manager

- Lists currently loaded plugins and on-disk plugin JARs.
- Displays plugin name, version, runtime state, source filename, API version, and compatibility information where available.
- Inspects plugin archives for `plugin.yml` metadata.
- Caches archive inspection results to avoid continuously re-inspecting unchanged JARs.
- Handles enabled `.jar` and disabled `.jardisabled` files explicitly.
- Enable/disable operations rename the exact selected plugin file and take effect on the next restart rather than attempting unsafe hot loading/unloading.
- Manual enable confirmation for plugins whose compatibility cannot be confirmed.
- Delete exact plugin files from the manager.
- Remote Spigot/Spiget resource search.
- Remote version lookup.
- Remote plugin installation/download flow.
- Separate permissions for viewing, search resources, version lookup, install, enable, disable, and delete.

## 11. Worlds and backups

- Lists active Minecraft worlds.
- Lists world backups separately from active worlds.
- Download active worlds as ZIP archives.
- Download backup archives.
- Create manual world backups.
- Restore worlds from backups.
- Delete active worlds.
- Delete backups.
- Backup metadata tracks managed/manual backup state and retention information.
- Fine-grained active-world vs backup view/download/delete permissions.

## 12. Automated backup policies

- Dedicated Backup Policies page.
- Create, edit, enable/disable, and delete automated policies.
- Per-policy configuration for:
  - world
  - scheduled time
  - retention age in days
  - number of latest backups to retain
- Managed backups carry retention metadata.
- Automatic pruning based on policy retention age/count.
- Manual backups coexist with policy-managed backups.
- Separate view/save/delete permissions.

## 13. World settings

- View per-world environment and operational data.
- Inspect:
  - time
  - weather
  - difficulty
  - player count
  - entity count
  - world folder size
  - supported gamerules
- Change world time.
- Change weather.
- Change difficulty.
- Change supported gamerules including:
  - Keep Inventory
  - Daylight Cycle
  - Random Tick Speed
- Separate permissions for environment, population, gamerules, folder size, and each mutable setting family.

## 14. Live 3D map

- WebGL-based live 3D Minecraft world renderer rather than a static pre-rendered tile map.
- Multi-world support.
- Server-generated block/chunk payloads with resource-pack-derived textures/models.
- Texture-atlas and model/blockstate asset generation/caching.
- Chunk/section rendering with visibility culling and multiple detail levels.
- Client-side persistent IndexedDB chunk cache.
- Persistent cache invalidation based on map revisions/block changes.
- Bounded browser working-set memory and bounded server-side hot chunk cache.
- Resource-pack assets use fingerprinted browser-cacheable URLs.
- Server-sent map-change stream for near-realtime block invalidation/update handling.
- Player tracking with:
  - skins
  - interpolated/smoothed movement
  - body/head orientation
  - armor
  - held items
  - names
  - activity/focus details
- Follow-camera mode.
- Interior/cave-aware follow behavior and visibility handling.
- Entity rendering for a range of Minecraft mobs/items, including custom lightweight model generation and textures.
- Day/night visual handling including sky tint, sun/moon presentation, fog, and rain effects.
- FXAA/bloom rendering stages.
- Click/probe support for map blocks.
- Container inspection for supported container blocks.
- Map diagnostics/progress UI.
- Map rendering, SSE, polling, and queued chunk work pause when the map page/browser tab is inactive, then resume without discarding the working state.
- Spatial entity queries avoid scanning the entire world's entity collection for each map request.
- Permission separation for map tiles, player tracking, player locations, world time, and player activity details.

## 15. Inventory management

- Inventory player roster and player search.
- Inspect inventory contents for supported online/offline player data paths.
- Minecraft inventory slot layout and item icon rendering.
- 3D player/skin preview.
- Creative item catalog.
- Creative catalog search and category filtering.
- Quantity selection for inserted items.
- Drag/drop style inventory interactions.
- Move items between slots.
- Add creative items to player inventories.
- Remove items, including a trash/drop target in the UI.
- Web inventory modifications feed into player activity logging.
- Inventory rendering/API/item-render queues pause when Inventory is not the active page or the tab is hidden, then resume when reopened.
- Granular permissions for player roster, contents, item catalog, move, add, and remove operations.

## 16. Command scheduler

- Create named command schedules.
- Edit existing schedules.
- Delete schedules.
- Multi-step task lists within a schedule.
- Scheduler clock/time display.
- Backend scheduler checks schedules approximately once per second.
- Separate view-list, view-time, save/update, and delete permissions.

## 17. X-Ray Watch

- Dedicated suspicious-mining/X-Ray monitoring page.
- Per-player suspicion/counter data collected by the plugin's X-Ray watcher.
- Database/YAML-backed state retained across sessions where configured by the watcher.
- Permission-gated viewing.

## 18. Live console

- Incremental live console output capture.
- Command execution from the web panel.
- Docked/half-height console mode.
- Fullscreen/maximized console mode.
- Command history/input behavior in the frontend.
- Permission-based read vs execute access.
- User/role console command policies can further limit execution even when `console.execute` is granted.

## 19. Player activity logs

- SQLite-backed activity logging with up to 100,000 retained records.
- 100 entries per UI/database page.
- Player/action filtering.
- Activity aggregation/count handling for repeated events.
- Logged player activity includes:
  - block breaks
  - block placements
  - item pickup
  - item drop
  - entity kills
  - throttled movement snapshots
  - block/item interactions
  - entity interaction
  - entity damage
  - item consumption
  - Elytra start/stop
  - inventory interaction
  - player-issued commands
  - web inventory modifications
- Recent activity snapshots are reused by the Players page and Live Map focus UI.

## 20. Panel audit logs and realtime notifications

- SQLite-backed panel audit log with up to 100,000 retained records.
- 100 entries per page.
- Records authenticated panel actions with user, method/endpoint, action description, and sanitized request context.
- Sensitive audit values are sanitized/redacted.
- Rich frontend descriptions for known panel actions instead of only generic endpoint messages.
- Fallback endpoint/method details for unknown future actions.
- Optional live panel-action toast notifications.
- Optional "show self" mode to include the current administrator's own actions.
- Optional realtime player-activity toast feed sourced from Activity Logs.
- Toast manager limits visible notifications to three at once and rate-limits visual insertion to avoid screen-filling bursts.
- Toast clicking dismisses the current stack and temporarily pauses further popups, with a short visible pause notice.
- Toasts follow the user's selected panel font behavior.

## 21. Failed-authentication security and review

- Tracks failed login attempts and accumulated failure state.
- Login lockout/brute-force protection.
- Permanent IP-ban action from the panel.
- In-game/console recovery command to pardon failed-auth IP state.
- Failed Authentications page can expose, permission permitting:
  - source IP
  - approximate location
  - detected OS
  - detected browser
  - attempts remaining
  - total failure count
  - lock expiry/permanent-ban state
- Privacy settings for masking IP information and controlling personal-information visibility.
- Sensitive failed-auth fields use AES-GCM-backed encryption helpers.
- Separate permissions for each sensitive failed-auth data field.

## 22. Appearance, themes, and fonts

- Current default PlayHosting-style theme.
- Preserved Bedrock, Basic/Legacy, Ferrum, and Stellar theme sources marked as work in progress in the current selector.
- Custom accent color presets and HSL/hex controls.
- Background pattern controls:
  - solid
  - grid
  - dots
  - lines
- Optional Minecraft font across the panel.
- Standalone theme editor.
- Import custom CSS from the settings UI.
- Appearance reset controls.

## 23. Global login/panel background system

- Server-global background configuration shared by all browsers/clients rather than per-browser local state.
- Background can target:
  - login only
  - panel only
  - both
- Modes:
  - equirectangular 360° sphere background
  - flat image background
- Embedded default 2:1 equirectangular background asset.
- Adjustable:
  - rotation speed
  - blur
  - darkness
  - vignette strength
  - foreground/container opacity
- Upload custom JPG, PNG, or WebP backgrounds with size/type/signature validation.
- Custom images are stored server-side.
- Reset restores the embedded default background and default tuning.
- Cross-client refresh/revision handling allows clients to adopt changed global background settings without each maintaining a separate preference.
- Background rendering avoids continuously rotating while the browser tab is hidden.

## 24. Internationalization and responsive UI

- Runtime internationalization layer.
- English and Turkish translation files.
- Live language switching from panel settings.
- Responsive desktop/mobile layouts.
- Mobile bottom navigation with a full-page More menu for secondary pages.
- Mobile-aware Inventory and Live Map layouts.
- Shared themed modal/dialog system instead of native browser confirmation/prompt popups for panel workflows.
- Toast notification system with translated labels and controls.
- Responsive Users/Roles, Player Management, logs, statistics, and management pages.

## 25. Request, filesystem, and data safety

- CSRF verification for authenticated state-changing operations.
- Session cookies use HTTP-only/session controls and same-site behavior in the current server implementation.
- Strict/bounded JSON request parsing helpers.
- Request/file/upload size limits in sensitive handlers.
- Central filesystem path-safety helper.
- ZIP extraction path validation against traversal/Zip-Slip-style destinations.
- Audit sanitization for credentials/tokens and sensitive request values.
- Local/private-network reasoning helper used by LAN-only mode.
- Bounded executors for HTTP/background work.

## 26. Persistence

- SQLite panel user/role/account database.
- SQLite player Activity Logs database.
- SQLite panel Audit Logs database.
- JSON persistence for command schedules.
- JSON persistence for backup policies and backup metadata.
- YAML persistence for cached logout locations and X-Ray watcher state.
- Plugin configuration for network/security/background settings and other panel configuration.
- Migration paths for older activity/audit log formats.

## 27. Developer/build behavior

- `AUTH_REQUIRED` production-style build.
- `DEV_NO_AUTH` development build with synthetic wildcard-permission development session and loopback binding.
- `DEV_NO_AUTH_LAN` development build for LAN testing without normal auth.
- Build security mode and artifact name embedded into build-security properties and exposed to the frontend/session bootstrap.

---

This list intentionally describes features present in the inspected current source. Historical roadmap items that are not implemented are kept separate from this feature reference.
