
## 2024-08-11 - Custom MutationObserver in List Components
**Learning:** Creating a custom DOM `MutationObserver` inside list components (like `TaskCard`) to track dark mode class changes causes severe performance bottlenecks due to excessive observer instantiations and DOM evaluations.
**Action:** Always use the `useTheme` hook provided by `next-themes` and check `resolvedTheme === 'dark'` to read theme context securely without attaching independent observers.
