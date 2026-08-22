---
name: Technical Precision
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#474651'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#777682'
  outline-variant: '#c8c5d3'
  surface-tint: '#5654a8'
  primary: '#1a146b'
  on-primary: '#ffffff'
  primary-container: '#312e81'
  on-primary-container: '#9c9af4'
  inverse-primary: '#c3c0ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#202528'
  on-tertiary: '#ffffff'
  tertiary-container: '#353a3d'
  on-tertiary-container: '#9fa4a8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100563'
  on-primary-fixed-variant: '#3e3c8f'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  bg-page: '#FAFAFA'
  bg-surface: '#FFFFFF'
  border-subtle: '#E2E8F0'
  status-success: '#10B981'
  status-warning: '#F59E0B'
  status-error: '#EF4444'
  blue-team: '#3B82F6'
  red-team: '#DC2626'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
  panel-split: 50%
---

## Brand & Style

This design system embodies the "Professional Accelerator" persona, blending the focused utility of a high-end IDE with the organized clarity of a premium productivity tool. It is engineered for serious learners and developers, prioritizing information density and cognitive ease over decorative trends.

The aesthetic follows a **Modern Corporate** approach with a **Minimalist** foundation. It avoids common EdTech tropes like playful illustrations or neon gradients in favor of "Evidence-Based UI." The interface should feel like a sophisticated instrument—reliable, technical, and calm—evoking a sense of structured progress and professional readiness.

**Key Principles:**
- **Utility First:** Design decisions prioritize data clarity and task efficiency.
- **Calm Authority:** A "light-first" palette reduces visual fatigue during long sessions.
- **Structural Integrity:** Using borders and subtle tonal shifts rather than heavy shadows to define space.

## Colors

The color strategy is "light-first" and restrained, using a warm off-white (`#FAFAFA`) for the primary canvas to differentiate from the sterile coldness of standard white. Pure white (`#FFFFFF`) is reserved for elevated surfaces like cards and panels to create a subtle layered effect.

Typography is anchored in a near-black indigo-tinted neutral (`#1A1A1A`) for high legibility without the harshness of pure black. The brand accent is a professional Indigo, used sparingly for primary actions and progress indicators. Semantic colors are utilized for technical feedback:
- **Indigo/Slate:** Primary navigation and structural accents.
- **Blue Team vs. Red Team:** A functional distinction where Blue represents coaching/support and Red represents high-pressure assessment or adversarial testing.
- **Success/Warning/Error:** Used strictly for mastery levels and compiler feedback.

## Typography

The typographic system is optimized for high-density information and technical content. 

- **Headlines:** Uses **Hanken Grotesk** for a sharp, contemporary, and engineered feel. It provides excellent hierarchy for dashboards and "Mission" titles.
- **Body:** **Inter** is the workhorse for all instructional content and transcripts, chosen for its exceptional legibility at small sizes and neutral tone.
- **Technical/Code:** **JetBrains Mono** is used for all monospaced requirements, including the IDE workspace, compiler logs, and metadata labels. 

Large display sizes for "Readiness Scores" should use tighter letter spacing to maintain a "data-viz" aesthetic.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model inspired by professional IDEs. 

- **Main Dashboard:** Utilizes a 12-column grid for standard content pages, with a preference for center-aligned content at 1200px max-width to maintain focus.
- **The Workspace:** Uses a split-screen fluid layout (Problem/Editor/Console) that allows users to resize panels. 
- **Skill Graph:** A full-canvas interactive view that supports panning and zooming, relying on dynamic margins rather than a strict grid.

**Breakpoints:**
- **Mobile (<768px):** Single column. Sidebars collapse into bottom sheets or hamburger menus. 
- **Tablet (768px - 1024px):** Sidebars become icons-only; content margins reduce to 24px.
- **Desktop (>1024px):** Fixed sidebar (260px) and multi-panel workspace view.

## Elevation & Depth

Hierarchy is established primarily through **Tonal Layers** and **Low-Contrast Outlines** rather than dramatic shadows.

- **Level 0 (Base):** `#FAFAFA` (Page Background).
- **Level 1 (Surface):** `#FFFFFF` (Cards, Panels) with a 1px solid border of `#E2E8F0`.
- **Level 2 (Popovers):** Subtle ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) used only for dropdowns, tooltips, and command palettes.

This system avoids glassmorphism. Depth is signaled by stacking: a panel appearing on the right side of the Skill Graph should have a vertical border and a slightly higher z-index, but remain flat against the surface.

## Shapes

The shape language is "Moderate." It avoids the playfulness of hyper-rounded corners while softening the technical harshness of sharp edges.

- **Primary UI Elements:** (Buttons, Inputs, Cards) use a **0.5rem (8px)** radius.
- **Skill Graph Nodes:** Circular or highly rounded icons to differentiate them from the structural rectangular UI.
- **Progress Bars:** Use a pill-shape for the outer container but flat-edge indicators for a "gauge" feel.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Indigo background, white text, 8px radius.
- **Secondary Action:** White background, 1px `#E2E8F0` border, `#1A1A1A` text.
- **Inputs:** White background, 1px border. On focus, use a 2px Indigo ring with 0px offset.

### The Skill Graph (DAG)
- **Nodes:** Visual representation of mastery. Mastered nodes use a subtle green halo; "At Risk" nodes use a soft orange border.
- **Edges:** Thin, neutral gray lines (0.5px) connecting nodes, with directional arrows.

### Cards & Panels
- **Standard Card:** No shadow, 1px border, white background.
- **IDE Panels:** Darker header backgrounds (`#F1F5F9`) to distinguish from the code editing area.

### Indicators
- **Mastery Sliders:** A horizontal bar using a monochromatic scale (Grey to Indigo) to show 0.00–1.00 mastery.
- **PTG Charts:** Dual-bar charts comparing "Practice" (Indigo) vs. "Interview" (Slate) to highlight performance gaps.
- **Voice UI:** A minimalist waveform displayed in the bottom corner during interview simulations, using the "Red Team" red when in pressure mode.