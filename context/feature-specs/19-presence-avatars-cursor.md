Show active room participants inside the editor canvas view, without changing the editor home navbar.

## Implementation

1. Keep the existing navbar behavior as-is.
   - do not change the editor home navbar
   - do not move or redesign the shared navbar component globally
   - if the editor home and editor canvas use the same navbar component, make sure this presence UI only appears in the canvas/editor room view
   - on the workspace/canvas view only, hide the navbar `UserButton` so it is not duplicated
   - on editor home, keep the navbar `UserButton` exactly as it is today
   - keep the existing workspace navbar actions: Templates, Share, and AI

2. Add the participant avatar group inside the editor canvas area.
   - position it in the top-right corner of the editor canvas pane (not over the AI sidebar)
   - keep it visually separate from the main navbar actions
   - get the current user's ID from the active Clerk session
   - read other participants from Liveblocks (`useOthers` / mapped presence), not from the project collaborator list
   - filter out any presence entry whose user ID matches the current Clerk user ID, including extra tabs from the same user
   - render one collaborator avatar per unique other user ID
   - render the current user separately using the existing Clerk `UserButton` – do not render a second avatar for them from the Liveblocks presence list
   - keep collaborator avatars and the Clerk `UserButton` the same size so the group looks visually consistent
   - collaborator avatars are display-only, not interactive: no click, follow, menu, or overflow popover
   - show a divider between the collaborator avatars and the Clerk `UserButton` only when at least one collaborator exists
   - if no collaborators are present, show only the Clerk `UserButton` with no divider
   - use `pointer-events` so the cluster does not pan or select the canvas, except for the Clerk `UserButton`

3. Render collaborator avatars.
   - use Liveblocks `UserMeta.info` already set at auth: `avatar`, `name`, and `color`
   - use profile photos when available
   - fall back to initials when there is no image
   - show up to five collaborator avatars in an overlapping stack
   - show a +N overflow chip when there are more than five; the chip is display-only
   - add a subtle ring so avatars stay readable on the dark canvas
   - do not fetch Clerk or project collaborator APIs to build this list

4. Add live cursors to the canvas.
   - render cursors for other participants only, never the current user, including never the current user's other tabs
   - use the existing Liveblocks presence `cursor` field to broadcast cursor position
   - update cursor position on React Flow's pointer/mouse move
   - convert the pointer location with `screenToFlowPosition` so cursors stay attached to the diagram while the canvas pans and zooms
   - render cursors inside the React Flow surface so they follow the viewport
   - clear cursor to `null` on mouse leave
   - show a small colored pointer with a name badge attached
   - match the pointer and badge color to the participant's `UserMeta.info.color`
   - use `info.name` on the badge; if name is missing, fall back to a short generic label
   - one cursor per other connection, even if the same collaborator has multiple tabs
   - cursors are display-only (`pointer-events-none`) and must not block node, edge, or canvas interaction

5. Keep the existing presence type in `liveblocks.config.ts`.

   Presence already includes, and must stay:
   - `cursor`: `{ x: number; y: number } | null`
   - `isThinking`: boolean

   Do not rename `isThinking` to `thinking`. Do not add new presence fields. Do not change `UserMeta`. Do not render an `isThinking` indicator in this feature.

## Scope Limits

- don't add participant avatars to the shared navbar globally
- don't keep a second `UserButton` in the workspace navbar
- don't remove or restyle existing navbar actions (Templates, Share, AI)
- don't replace Clerk user/profile/logout behavior
- don't make collaborator avatars or the +N overflow chip interactive
- don't change canvas node or edge behavior
- don't change the shape panel, canvas control bar, or keyboard shortcuts
- don't change Liveblocks auth, room tokens, or `UserMeta`
- don't persist presence, cursors, or avatar state
- don't add follow-user, jump-to-cursor, selection presence, or shared viewports
- don't add comments, threads, notifications, or Liveblocks default `AvatarStack` / `Cursors` chrome
- don't add an AI thinking indicator or any other use of `isThinking`

## Check When Done

- Editor home navbar is unchanged and still shows the Clerk `UserButton`.
- Workspace canvas shows collaborator avatars in the canvas top-right, with the Clerk `UserButton` in that group and not in the navbar.
- Other users see live cursors that follow pan/zoom; the current user never sees their own cursor.
- Presence types remain `cursor` and `isThinking`; no auth or node/edge changes.
- Make sure `npm ci`, `npm run lint` and `npm run build` passes
