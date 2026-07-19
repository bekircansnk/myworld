## 2024-05-19 - React.memo on Kanban Task Cards
**Learning:** In a drag-and-drop Kanban interface, parent components like `KanbanBoard` re-render constantly to update drag positions and state, which by default causes all child `TaskCard` components to re-render, creating noticeable lag on busy boards.
**Action:** Always wrap list item components (like task cards) in `React.memo` when they are part of a dynamic, re-rendering list like a Kanban board to ensure only the dragged or modified card re-renders.
