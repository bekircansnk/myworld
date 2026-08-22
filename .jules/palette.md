## 2025-02-18 - Added Accessibility attributes to modals and bottom sheets
**Learning:** Icon-only close buttons in modals/bottom sheets in the app lack `aria-label`s and `focus-visible` styles, rendering them opaque to screen readers and difficult to find during keyboard navigation.
**Action:** When adding modals or popover components, ensure the 'X' button explicitly includes `aria-label="Kapat"` and `focus-visible:ring-2 focus-visible:ring-indigo-500` styles.
