---
name: Companion
colors:
  surface: '#f9f9f8'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#3e4946'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f0f1ef'
  outline: '#6e7a76'
  outline-variant: '#bdc9c5'
  surface-tint: '#006b5e'
  primary: '#005e53'
  on-primary: '#ffffff'
  primary-container: '#00796b'
  on-primary-container: '#a1feec'
  inverse-primary: '#7ad7c6'
  secondary: '#875200'
  on-secondary: '#ffffff'
  secondary-container: '#f89c00'
  on-secondary-container: '#623a00'
  tertiary: '#54534e'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c6b66'
  on-tertiary-container: '#efede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f3e2'
  primary-fixed-dim: '#7ad7c6'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffddba'
  secondary-fixed-dim: '#ffb865'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#663d00'
  tertiary-fixed: '#e5e2db'
  tertiary-fixed-dim: '#c9c6c0'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474742'
  background: '#f9f9f8'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.5px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.5px
  button-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  touch-target-min: 48dp
  margin-mobile: 24px
  gutter: 24px
  stack-spacing: 16px
  section-spacing: 32px
---

## Brand & Style
The design system is centered on the "Friendly Companion" ethos, prioritizing warmth, legibility, and cognitive ease for elderly users. The style evolves from **Modern Material 3** but removes clinical coldness through soft, organic shapes and a "Physical Print" inspired layout. 

The aesthetic is **Tactile & Soft**, utilizing generous whitespace and high-contrast elements that feel substantial and easy to tap. The interface should evoke a sense of calm reliability, using high-contrast visual cues to guide users without causing anxiety or sensory overload.

## Colors
The palette uses high-contrast, nature-inspired tones to ensure accessibility while maintaining a warm atmosphere.

- **Primary (Teal):** Used for main actions and brand presence. It provides a stable, trustworthy anchor.
- **Secondary (Amber):** Reserved for "care" moments, reminders, and gentle highlights.
- **Background (Cream):** A soft off-white to eliminate screen glare, which can be irritating for aging eyes.
- **Surface (White):** Used for cards and interactive containers to create a clear "layering" effect against the cream background.
- **Error (Coral):** A softer take on red that communicates "needs attention" without appearing alarming or clinical.

**Contrast Requirement:** All text on background/surface combinations must maintain a minimum contrast ratio of 4.5:1, with 7:1 preferred for primary body text.

## Typography
The typography system uses **Plus Jakarta Sans** for headings to provide a friendly, rounded personality, and **Atkinson Hyperlegible Next** for all body text to maximize readability for users with low vision.

- **Size Scaling:** Standard body text starts at 18px-20px to accommodate common age-related vision changes. 
- **Readability:** Line heights are intentionally generous (1.5x) to prevent lines of text from blurring together.
- **Weight:** Avoid light weights; use Regular (400) for body and Bold (700) for headlines and labels to ensure every character is distinct.

## Layout & Spacing
The layout follows a **Fluid Grid** with significantly larger margins than standard Android apps to reduce visual noise near the screen edges.

- **Padding:** A minimum of 24px padding is required on the horizontal edges of the screen.
- **Interactive Spacing:** All tappable elements must have at least 24px of separation to prevent accidental "fat-finger" taps.
- **Vertical Rhythm:** Content should be stacked using a consistent 16px (small) or 32px (large) gap. 
- **Touch Targets:** While the minimum is 48dp, this system aims for 64dp height for primary interactive surfaces.

## Elevation & Depth
To aid cognitive processing, this system uses **Tonal Layers** combined with **Ambient Shadows**.

- **Depth Levels:** Use 2-3 distinct levels. The background is the lowest level (Cream). Cards sit on level 1 (White + soft shadow). Buttons sit on level 2.
- **Shadow Character:** Shadows are extra-diffused with a low opacity (10-15%) and a slight Teal tint (`#00796B`) to blend harmoniously with the palette.
- **Visual Clues:** Elevation is used strictly to indicate "this can be pressed." Non-interactive content should remain flat on the surface.

## Shapes
The shape language is **Pill-shaped and Ultra-rounded**. 

- **Cards:** Use a 24px to 32px corner radius to evoke a soft, non-threatening feel.
- **Buttons:** Fully rounded (pill) buttons are preferred for primary actions to maximize the "friendly" aesthetic.
- **Inputs:** Search bars and text fields should use at least a 16px radius.
- **Icons:** Use thick strokes (2.5px - 3px) with rounded caps and joins. Avoid thin, spindly iconography that is hard to see.

## Components
Consistent styling across components ensures the user feels safe and familiar with the interface.

- **Primary Buttons:** Minimum height of 64px. Background is Primary Teal with White text. Use a bold, 20px font.
- **Action Cards:** Large White containers with 32px radius. Must include a clear icon (Secondary Amber) and a Headline-sm title.
- **Lists:** Each list item should have a minimum height of 80px, with a 24px divider or clear vertical spacing between items.
- **Input Fields:** Large text (Body-lg), with a thick 2px border when focused. Placeholder text must be high-contrast (at least 4.5:1).
- **Chips:** Used for simple toggles or filters. Must be at least 48px tall to ensure easy interaction.
- **Feedback Alerts:** Use the Coral color for errors and Amber for warnings. Alerts should include both an icon and text to ensure the message is clear without relying on color alone.