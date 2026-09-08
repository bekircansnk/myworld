## 2024-03-24 - Added ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons (like `Trash2`, `X`, `Send`, `RotateCcw`, `Sun`/`Moon`) lack accessible text for screen readers by default. This makes critical functions like clearing history or changing themes completely opaque to assistive technologies. Furthermore, they lack tooltip hints for mouse users.
**Action:** Always verify that buttons containing only an icon (`<Button><Icon/></Button>`) have both `aria-label` and `title` attributes. Use Turkish language for standard labels given the app's primary language.
