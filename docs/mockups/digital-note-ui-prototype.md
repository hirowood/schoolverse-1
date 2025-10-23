# Digital Note Canvas UI Mock

This document captures a lightweight mock and interaction outline for the Phase 1.5 digital note canvas. It pairs with the requirements in `docs/REQUIREMENTS.md` (Section F050).

## 1. Screen Layout (Desktop breakpoints ≥ 1280px)

```
┌───────────────────────────── App Header (48px) ─────────────────────────────┐
│ Notebook title ▾      Page selector ▾        Autosave ● Saved  |  User menu │
├─┬────────────── Tools (72px) ───────────────┬─────────────────── Canvas ────┬─┬───┐
│E│ ▢ Select                                  │                           ▲   │P│FON│
│r│ ✎ Pen                                     │     Drawing viewport       │r│T  │
│g│ 🖍 Marker                                  │  (fabric.Canvas wrapper)   │o│SZ │
│o│ ▭ Shape ▸                                 │                           ▼│p│LN │
│n│ ✐ Text                                    ├─────────────────────────────┤e│SP │
│o│ 🗒 Sticky                                  │ Context Bar (40px)         │r│AL │
│m│ 📷 Image                                   │ Undo | Redo | Duplicate    │t│  │
│y│ ⊗ Eraser                                  │ Delete | Layer ↑↓ | Zoom   │y│  │
│ │ 🔴 Laser                                   │ Fit | Snap | Page nav      │ │  │
├─┴───────────────────────────────────────────┴─────────────────────────────┘ │  │
│ Status: Tool tip / Shortcut / Error banner                                  │  │
└─────────────────────────────────────────────────────────────────────────────┴──┴──┘

Legend:
- Left dock (72px wide) houses vertical tool palette.
- Right dock (320px wide) is the property inspector.
- Canvas area is centered, supports pan/zoom and page tabs at bottom edge.
```

### Responsive adaptations

| Breakpoint | Adjustments |
|------------|-------------|
| ≥ 1024px | Layout above (two docks + canvas). |
| 768–1023px | Right property panel collapses into bottom drawer (`⋮ Properties`). |
| < 768px | Toolbar turns into top horizontal scroll list; property panel uses modal sheets. |

## 2. Tool Palette States

```
[Active] highlighted with 4px accent bar on left and filled background.
Icons: monochrome line icons (24px) + label 12px.
Shortcuts shown in tooltip: "Pen (P)" etc.
```

| Tool | Icon suggestion | Notes |
|------|-----------------|-------|
| Select / Move | ▢ | Primary cursor; toggles canvas.selection. |
| Pen | ✎ | Uses PencilBrush; color swatch displayed when active. |
| Marker | 🖍 | Semi-transparent overlay, shares color palette. |
| Shape | ▭ | Opens flyout: Rectangle, Ellipse, Triangle, Line, Arrow. |
| Text | ✐ | Drops `IText` with inline editing start. |
| Sticky | 🗒 | Opens quick color chips; default yellow note. |
| Image | 📷 | Launches file picker; verifies max size 2000px. |
| Eraser | ⊗ | Switches to EraserBrush, width slider shows. |
| Laser | 🔴 | Momentary tool; pointer fades out. |

## 3. Context Bar Controls

| Group | Controls | Behaviour |
|-------|----------|-----------|
| History | Undo, Redo | Disabled state when stack empty. |
| Transform | Duplicate, Delete, Bring Forward, Send Back | Visible when selection present. |
| View | Zoom -, Zoom %, Zoom +, Fit | Zoom % opens dropdown (25/50/75/100/200/300). |
| Alignment | Snap Toggle, Align Left/Center/Right, Distribute | Applies to multi-selection. |
| Page | ◀ Prev, Page X/Y, ▶ Next | Disabled for ends; Page menu opens page manager. |

## 4. Property Inspector

Sections use accordion panels to avoid overload.

1. **Appearance**
   - Color picker (palette + custom), Opacity slider, Stroke width slider.
   - Fill / Stroke swatches when applicable.
2. **Typography** (Visible for text or sticky note)
   - Font family select (system stack + Noto Sans/Serif).
   - Size, Weight, Line height, Bullet toggle, Alignment buttons.
3. **Object**
   - Position X/Y, Size W/H (with lock ratio), Rotation, Flip H/V.
   - Layer lock toggle, Visibility toggle.
4. **Metadata**
   - Author, Created at, Updated at (read-only).
   - Link to version history modal.

## 5. Interaction Flows

### 5.1 Pen drawing

1. User hits `P` or clicks Pen tool.
2. Toolbar highlights Pen; property inspector opens "Appearance".
3. Drawing on canvas creates PencilBrush strokes.
4. `object:added` event pushes to history; autosave timer starts (3s).
5. Toast `Saved` appears after successful PUT.

### 5.2 Sticky note creation

1. Click Sticky tool → color chooser popover (Yellow/Blue/Pink).
2. Canvas click places grouped rect + `IText`.
3. Immediately focus text editor; property panel shows Typography.
4. Dragging note updates X/Y; snapping lines appear at 8px intervals.

### 5.3 Image import

1. Image tool triggers file input (PNG, JPG, HEIC).
2. Preview modal with scale slider and crop.
3. On confirm, image inserted center; if > canvas, auto fit to width.
4. Metadata panel shows file name and size.

### 5.4 Autosave and Conflict

1. Autosave triggers PUT with ETag.
2. If 412 conflict, modal prompts to resolve: "Reload remote" vs "Keep local (creates duplicate page)".
3. Save banner color codes state: grey = saved, amber = syncing, red = error.

## 6. Prototype References

- Low-fidelity wireframe (Figma frame id placeholder): `FIGMA: Digital Note v1`
- Icon set: Phosphor Icons (regular, 24px).
- Color tokens:
  - Accent primary: `#4F46E5`
  - Accent warning: `#F97316`
  - Accent success: `#22C55E`
  - Toolbar background: `#F3F4F6`

## 7. Collaboration Notes

- Review checklist before handoff:
  - [ ] Toolbar tool order confirmed with design.
  - [ ] Property panel sections validated with dev leads.
  - [ ] Autosave banner copy approved by product.
  - [ ] Keyboard shortcuts documented in in-app help.
- Next workshop agenda:
  1. Walkthrough of canvas layout (10 min).
  2. Interaction demo (recorded Loom or live Storybook prototype).
  3. Open Q&A focusing on fabric.js integration boundaries.
  4. Align on v2 backlog (OCR, AI integration).

## 8. Next Steps

1. Build interactive prototype (Storybook or Next.js preview) using static JSON data.
2. Collect feedback from educators on usability (focus on sticky note + pen).
3. Iterate layout for tablet breakpoints based on QA findings.

