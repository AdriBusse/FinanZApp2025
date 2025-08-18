Awesome—here’s a tight, hand-off-ready spec you can drop to your coding agent. I’ve split it into a user-facing spec and a developer spec, plus a triage plan for the broken implementation.

⸻

User-facing Product Description

What this feature does
• Your dashboard shows cards (“modules”) in a 2-column grid.
• Tap the Lock icon to toggle:
• Locked: modules are fixed; taps open the module as usual.
• Unlocked: you can drag & drop modules to change their order anywhere in the grid.
• As you move modules, the layout updates live.
• When you exit Unlocked mode (lock closes), your new layout is saved using the app’s existing save mechanism and will be restored on next app open / device.

Controls
• Lock button in the dashboard header:
• Closed lock = edit OFF (no reordering)
• Open lock = edit ON (drag to reorder)
• Drag handle: whole card is draggable (or just the header—final UX decision below).

Feedback & states
• While dragging: card “lifts” slightly (shadow/scale) and other cards reflow.
• If an action isn’t allowed (in Locked mode), a subtle hint appears: “Unlock to rearrange.”
• On save success: silent.
• On save failure: toast “Couldn’t save layout. Your previous order is kept.”

Persistence
• Layout order is saved automatically on every change (or when exiting edit mode—choose one below). It uses the current dashboard storage you already have (no new backend).

⸻

Developer-facing Technical Spec

Scope / Goals
• Provide reorderable 2-column grid for dashboard modules using react-native-draggable-flatlist (RNDL) that’s already in the repo.
• Preserve existing module rendering and save pipeline. Only replace the reorder interaction and state.
• Fix the current broken implementation (see triage).

Non-Goals
• No new module types, no cross-dashboard sync changes, no backend schema changes.

⸻

Architecture & Data

Item shape

type DashboardItem = {
id: string; // stable key
type: 'savings' | 'expenses' | 'chart' | 'custom' | string;
props?: Record<string, any>;
// optional layout metadata if you have it already:
// span?: 1 | 2; // (for future; today we use 2-columns, span=1)
};

Layout state (client)
• A flat ordered array of item IDs. The 2-column grid is derived from index position.

type DashboardLayout = string[]; // e.g., ['a1','b7','c3', ...]

With react-native-draggable-flatlist numColumns={2} we can keep a flat array. The library handles column placement; we just persist the new order from onDragEnd.

Persistence contract (reuse existing)

Implement with your current mechanism—just ensure this function exists:

// Saves for the active user and active dashboard
async function saveDashboardLayout(layout: DashboardLayout): Promise<void>

// Loads on mount
async function loadDashboardLayout(): Promise<DashboardLayout>

    •	Use optimistic update: update UI immediately; on save error, revert and show toast.
    •	If you already save on every change, debounce to ~300–500ms to avoid spam.

⸻

UI/Interaction Details

Lock / Unlock
• Local state: isEditMode (boolean).
• Locked:
• activationDistance large (or dragEnabled=false) so no drag starts.
• Card taps work normally.
• Unlocked:
• dragEnabled=true; cards draggable.
• Optional: only start drag on longPress (600ms) to avoid accidental drags.

Drag behavior (RNDL)
• Use react-native-draggable-flatlist with:
• numColumns={2}
• keyExtractor={(it) => it.id}
• onDragEnd={({ data }) => setLayout(data.map(x => x.id)); saveDashboardLayoutDebounced(...)}
• Visual feedback: renderItem adds scale/shadow while isActive is true.

Accessibility
• Provide an alternate reorder mode using up/down controls when VoiceOver/TalkBack is on (stretch goal), or at least ensure the lock toggle is accessible with labels:
• Lock button accessibilityLabel="Toggle edit mode"
• Cards have accessibilityLabel including their title.

Performance
• Ensure card components are pure (memoized) and keep virtualization on.
• Avoid heavy re-renders in renderItem. Pass minimal props.
• Test with 100+ modules to ensure smooth drag.

⸻

Implementation Steps (happy path) 1. Audit the library setup
• Confirm react-native-draggable-flatlist version supports numColumns. (v3+)
• Ensure react-native-gesture-handler & react-native-reanimated (v2) are properly installed and configured (Babel plugin, Reanimated’s react-native-reanimated/plugin last in the list).
• Ensure no parent ScrollView wraps the draggable list (use the list’s own scroll). 2. Create DashboardGrid component
• Props: items: DashboardItem[], layout: DashboardLayout, isEditMode: boolean, onLayoutChange(next: DashboardLayout)
• Internally, map layout → data: DashboardItem[] then render DraggableFlatList.
• onDragEnd → compute new layout and call onLayoutChange.
• When isEditMode=false, disable drag via dragHitSlop, activationDistance, or use the lib’s dragEnabled prop if available. 3. Wire Lock/Unlock in screen
• Add lock button to header; toggles isEditMode.
• When toggling to Locked, either:
• Save immediately (single save), or
• Do nothing if you already saved on each drag. 4. Persist
• On every onLayoutChange: optimistic update, debounce save to 300–500ms.
• On save failure: revert layout to last committed and toast. 5. Edge cases
• Empty dashboard: show placeholder text with hint “Unlock to add & rearrange”.
• Very tall cards: test autoscroll while dragging.
• Orientation change: recompute layout; RNDL reflows columns automatically.

⸻

API/Storage Integration
• No schema change needed if you already store an ordered list.
• If current storage uses objects keyed by slot indices, adapt:
• Convert ordered list ↔ map of index → itemId on save/load.
• Ensure user scoping (per user) and board scoping (if multiple dashboards).

⸻

Analytics (optional)

Track:
• dashboard_reordered (count, item count)
• dashboard_edit_mode_toggled (on/off)
• dashboard_save_failed (error code)

⸻

Testing Checklist

Unit
• Reorder reducer: given list [a,b,c,d], drag d before b → [a,d,b,c].
• Debounce: multiple drag events → single save call.

Integration (Detox)
• Toggle lock → elements draggable.
• Drag across columns (row wrap) → order saved and persisted after reload.
• Save failure → UI restored to previous state; error toast visible.

Manual
• iOS & Android gesture responsiveness
• Long lists (≥100 items)
• Variable card heights

⸻

Rollout & Migration
• Behind a feature flag dashboard_reorder_v2.
• Keep old layout storage format backward-compatible (convert on load, save in new format).
• Roll out to a small beta cohort, then 100%.

⸻

Known Pitfalls & Triage for “broken” current impl

Use this checklist before rewriting: 1. Dependencies
• react-native-draggable-flatlist version supports numColumns.
• react-native-gesture-handler initialized at app root (GestureHandlerRootView).
• react-native-reanimated v2 properly configured (Babel plugin + Reanimated at the top of the entry file if required). 2. Gesture conflicts
• No parent ScrollView around the draggable list.
• No pan handlers on parent containers stealing touches. 3. Keys & identity
• keyExtractor returns the stable id.
• extraData set when needed. 4. State shape
• Don’t mutate the data array in place; create a new array on onDragEnd.
• Ensure onDragEnd uses result.data from the lib. 5. Persistence race
• Debounce saves; cancel on unmount to avoid “setState on unmounted”.

If 1–5 check out and it’s still flaky, implement the new DashboardGrid described above (usually <200 LOC).

⸻

Minimal code sketch (for the agent)

// DashboardGrid.tsx
import React, { useMemo, useCallback } from 'react';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { View } from 'react-native';

type Item = { id: string; type: string; props?: any };
type Props = {
items: Item[];
layout: string[]; // ordered IDs
isEditMode: boolean;
onLayoutChange: (next: string[]) => void;
};

export const DashboardGrid: React.FC<Props> = ({ items, layout, isEditMode, onLayoutChange }) => {
const data = useMemo(
() => layout.map(id => items.find(i => i.id === id)!).filter(Boolean),
[layout, items]
);

const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Item>) => (
<View
// Optionally: pressable header only starts drag
onLongPress={isEditMode ? drag : undefined}
style={{ opacity: isActive ? 0.9 : 1 }} >
{/_ render your card by type _/}
</View>
), [isEditMode]);

return (
<DraggableFlatList
data={data}
keyExtractor={(it) => it.id}
numColumns={2}
activationDistance={isEditMode ? 8 : 9999} // effectively disables drag when locked
onDragEnd={({ data: newOrder }) => onLayoutChange(newOrder.map(x => x.id))}
renderItem={renderItem}
containerStyle={{ padding: 8 }}
contentContainerStyle={{ paddingBottom: 48 }}
// autoscroll/scrollPercent if needed
/>
);
};

Hook it up in your screen:

// DashboardScreen.tsx
const [isEdit, setIsEdit] = useState(false);
const [layout, setLayout] = useState<DashboardLayout>([]);

useEffect(() => { loadDashboardLayout().then(setLayout); }, []);

const onLayoutChange = useCallback((next: DashboardLayout) => {
setLayout(next);
saveDashboardLayoutDebounced(next); // debounce 300–500ms
}, []);

<Header rightIcon={isEdit ? 'lock-open' : 'lock-closed'} onPress={() => setIsEdit(v => !v)} />

<DashboardGrid
  items={items}
  layout={layout}
  isEditMode={isEdit}
  onLayoutChange={onLayoutChange}
/>

⸻

If you want, tell me how you’re currently saving the dashboard (function name + shape), and I’ll wire the exact save/load calls and the debounce you use across the app to match your conventions.
