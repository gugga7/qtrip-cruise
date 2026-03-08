import { activeNiche } from './niche';

const p = activeNiche.theme.primary;   // e.g. 'pink'
const a = activeNiche.theme.accent;    // e.g. 'rose'

/** Theme-aware Tailwind classes derived from the active niche */
export const tc = {
  // ── Backgrounds ──
  bgPrimary:       `bg-${p}-500`,
  bgPrimaryDark:   `bg-${p}-600`,
  bgPrimaryMuted:  `bg-${p}-100`,
  bgPrimaryLight:  `bg-${p}-50`,
  bgPrimarySubtle: `bg-${p}-200`,
  bgAccentMuted:   `bg-${a}-100`,
  bgAccentLight:   `bg-${a}-50`,

  // ── Text ──
  textPrimary:       `text-${p}-600`,
  textPrimaryDark:   `text-${p}-700`,
  textPrimaryDarker: `text-${p}-900`,
  textPrimaryMid:    `text-${p}-500`,
  textPrimaryLight:  `text-${p}-400`,
  textPrimaryPale:   `text-${p}-200`,
  textAccent:        `text-${a}-600`,
  textAccentDark:    `text-${a}-700`,

  // ── Borders ──
  borderPrimary:      `border-${p}-400`,
  borderPrimaryLight: `border-${p}-200`,
  borderPrimaryMuted: `border-${p}-100`,
  borderPrimaryDark:  `border-${p}-600`,
  borderPrimaryMid:   `border-${p}-300`,
  borderAccentMid:    `border-${a}-300`,

  // ── Rings ──
  ringPrimary:      `ring-${p}-200`,
  ringPrimaryLight: `ring-${p}-100`,

  // ── Shadows ──
  shadowPrimary: `shadow-${p}-200`,

  // ── Focus states (compound) ──
  focusInput: `focus:border-${p}-400 focus:ring-2 focus:ring-${p}-100`,

  // ── Hover states ──
  hoverTextPrimary:      `hover:text-${p}-600`,
  hoverTextPrimaryLight: `hover:text-${p}-500`,
  hoverBgPrimaryLight:   `hover:bg-${p}-50`,
  hoverBgPrimarySubtle:  `hover:bg-${p}-100`,
  hoverBgPrimaryMuted:   `hover:bg-${p}-50/50`,

  // ── Hover border ──
  hoverBorderPrimaryLight: `hover:border-${p}-200`,

  // ── Gradients (from niche config) ──
  heroGradient: activeNiche.theme.heroGradient,
  ctaGradient:  activeNiche.theme.ctaGradient,
  ctaHoverGradient: activeNiche.theme.ctaGradient
    .replace(/(\w+)-(\d+)/g, (_, name, shade) => `${name}-${Math.min(Number(shade) + 100, 900)}`),

  // ── Combined patterns (frequently used together) ──
  /** bg-pink-50 text-pink-600 */
  badgeLight: `bg-${p}-50 text-${p}-600`,
  /** bg-pink-100 text-pink-600 */
  badgeMuted: `bg-${p}-100 text-${p}-600`,
  /** bg-pink-50 text-pink-700 */
  tagPrimary: `bg-${p}-50 text-${p}-700`,
  /** border-pink-400 ring-2 ring-pink-200 */
  selectedRing: `border-${p}-400 ring-2 ring-${p}-200`,

  // ── Login page background gradient ──
  loginBg: `from-${p}-50 via-white to-${a}-50`,

  // ── Login/CTA button gradient ──
  btnGradient: `bg-gradient-to-r ${activeNiche.theme.ctaGradient}`,
  btnGradientHover: `hover:from-${p}-600 hover:to-${a}-600`,

  // ── Focus ring for buttons ──
  focusRingPrimary: `focus:ring-${p}-400`,

  // ── Accent badge ──
  badgeAccent: `bg-${a}-100 text-${a}-600`,

  // ── Profile header gradient (reuses hero) ──
  profileHeaderGradient: activeNiche.theme.heroGradient,

  // ── Avatar gradient ──
  avatarGradient: `from-${p}-400 to-${a}-500`,

  // ── Toggle active state ──
  toggleActive: `bg-${p}-500`,

  // ── Thinking card shimmer ──
  shimmer: `via-${p}-50/60`,

  // ── AI reason bubble ──
  reasonBorder: `border-${p}-100`,
  reasonBg:     `from-${p}-50 to-${a}-50`,
  reasonText:   `text-${p}-700/80`,
  reasonBold:   `text-${p}-600`,
  reasonIcon:   `text-${p}-400`,

  // ── Schedule day button active ──
  dayBtnActive:     `bg-gradient-to-br from-${p}-500 to-${a}-500 text-white shadow-md shadow-${p}-200`,
  dayBtnHover:      `hover:bg-${p}-100 hover:text-${p}-600`,

  // ── Schedule preview active day ──
  previewActiveDay: `bg-${p}-50/50 ring-2 ring-${p}-300/50`,
  previewActiveRing: `ring-${p}-200`,

  // ── Schedule header text ──
  scheduleHeaderText: `text-${p}-700`,

  // ── "What happens next" box ──
  nextStepsBg:     `bg-${p}-50`,
  nextStepsBorder: `border-${p}-100`,
  nextStepsTitle:  `text-${p}-900`,
  nextStepsText:   `text-${p}-700`,
  nextStepsBadge:  `bg-${p}-200 text-${p}-700`,

  // ── Destination insights label ──
  insightsLabel: `text-${p}-200`,

  // ── "How it works" icon colors ──
  howItWorksPrimary: `bg-${p}-100 text-${p}-600`,
  howItWorksAccent:  `bg-${a}-100 text-${a}-600`,

  // ── Spinner border accent ──
  spinnerBorder: `border-t-${p}-500`,

  // ── Validation error text ──
  validationError: `text-${a}-500`,
} as const;
