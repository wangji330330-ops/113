/*
 * Soft hand-drawn icon set.
 * 24 × 24 viewBox, outline art drawn with currentColor.
 *
 * Each icon is a list of SVG fragments. The wrapper svg supplies
 * fill="none", stroke="currentColor", stroke-width="1.8" and round caps/joins.
 * The inline style keeps legacy `.px-icon { fill: currentColor; }` CSS
 * from flooding the outlines while still allowing tiny fill="currentColor"
 * accents (eyes, bubbles, holes).
 */
export const ICONS = {
  lantern: [
    '<path d="M9.4 4.8a2.6 2.6 0 0 1 5.2 0"/>',
    '<path d="M8.5 4.8h7"/>',
    '<path d="M8.5 4.8c.2 1.5.9 2.4 2.1 2.4M15.5 4.8c-.2 1.5-.9 2.4-2.1 2.4"/>',
    '<path d="M9.2 7.2h5.6c1 0 1.8.8 1.8 1.8v6.4c0 1-.8 1.8-1.8 1.8H9.2c-1 0-1.8-.8-1.8-1.8V9c0-1 .8-1.8 1.8-1.8z"/>',
    '<path d="M12 10.1c.9.9 1.4 1.7 1.4 2.6a1.4 1.4 0 0 1-2.8 0c0-.9.5-1.7 1.4-2.6z"/>',
    '<path d="M7.7 18h8.6M9.2 18v1.5M14.8 18v1.5"/>'
  ],
  list: [
    '<circle cx="5.4" cy="6.9" r="1.05" fill="currentColor" stroke="none"/>',
    '<circle cx="5.4" cy="12" r="1.05" fill="currentColor" stroke="none"/>',
    '<circle cx="5.4" cy="17.1" r="1.05" fill="currentColor" stroke="none"/>',
    '<path d="M9.2 7c3.2-.4 6.2-.4 9.3-.1"/>',
    '<path d="M9.2 12c3.2-.3 6.2-.3 9.3 0"/>',
    '<path d="M9.2 17c2.4-.3 4.7-.3 7-.1"/>'
  ],
  gift: [
    '<path d="M12 7.7C9.9 7.7 8.3 6.8 8.3 5.4c0-.9.7-1.6 1.6-1.6 1.8 0 2.1 2 2.1 3.9 0-1.9.3-3.9 2.1-3.9.9 0 1.6.7 1.6 1.6 0 1.4-1.6 2.3-3.7 2.3z"/>',
    '<rect x="3.9" y="7.3" width="16.2" height="3.1" rx="1.2"/>',
    '<path d="M5.2 10.4h13.6v8.1c0 1.2-1 2.2-2.2 2.2H7.4c-1.2 0-2.2-1-2.2-2.2z"/>',
    '<path d="M12 10.4v10.3"/>'
  ],
  user: [
    '<circle cx="12" cy="7.7" r="3.5"/>',
    '<path d="M4.9 20c.7-3.7 3.4-5.9 7.1-5.9s6.4 2.2 7.1 5.9"/>'
  ],
  water: [
    '<path d="M12 3.2c2.9 3.5 5.2 6.2 5.2 8.8a5.2 5.2 0 0 1-10.4 0c0-2.6 2.3-5.3 5.2-8.8z"/>',
    '<path d="M9.5 12.1c-.1 1.1.4 2.1 1.4 2.7"/>'
  ],
  walk: [
    '<circle cx="13.6" cy="4.9" r="2.15"/>',
    '<path d="M12.4 7.5c-.4 1.7-.9 3.2-1.4 4.8"/>',
    '<path d="M11.7 9.2c1 .7 2 1.3 3.1 1.7"/>',
    '<path d="M11.3 9.3c-1 .5-1.9 1.1-2.7 1.9"/>',
    '<path d="M11 12.4c-.5 1.9-1.2 3.6-2.1 5.2"/>',
    '<path d="M11 12.4c1.2 1.3 2.2 2.7 3 4.2l.6 1.1"/>'
  ],
  book: [
    '<path d="M12 6.3C10.1 4.7 7.5 4.1 4.7 3.9v13.4c2.8.2 5.4.8 7.3 2.4 1.9-1.6 4.5-2.2 7.3-2.4V3.9c-2.8.2-5.4.8-7.3 2.4z"/>',
    '<path d="M12 6.3v13.4"/>'
  ],
  moon: [
    '<path d="M20 14.1A8.4 8.4 0 0 1 9.9 4a8.4 8.4 0 1 0 10.1 10.1z"/>',
    '<path d="M17.2 3.6v2.4M16 4.8h2.4"/>'
  ],
  bowl: [
    '<path d="M3.7 11.2h16.6"/>',
    '<path d="M4.8 11.2c.4 4.1 3.3 7.1 7.2 7.1s6.8-3 7.2-7.1"/>',
    '<path d="M9.1 19.2h5.8"/>',
    '<path d="M9.5 8.4c-1.2-1.1-.8-2.3.2-3.2M14.5 8.4c-1.2-1.1-.8-2.3.2-3.2"/>'
  ],
  leaf: [
    '<path d="M19.8 4.2C12.6 4.4 6.2 7.8 6.2 13.3c0 2.8 2.1 4.9 4.9 4.9 5.5 0 8.9-6.4 8.7-14z"/>',
    '<path d="M6 18.2C8.4 14.1 12 10.3 16.6 7.5"/>'
  ],
  music: [
    '<circle cx="7.4" cy="17.2" r="2.1"/>',
    '<circle cx="17.8" cy="15.2" r="2.1"/>',
    '<path d="M9.5 17.1V6.3M19.9 15.1V4.3"/>',
    '<path d="M9.5 6.3l10.4-2"/>'
  ],
  heart: [
    '<path d="M12 20.1c-2.1-1.9-8-5.9-8-10.3 0-2.7 2-4.7 4.6-4.7 1.4 0 2.7.7 3.4 1.9.7-1.2 2-1.9 3.4-1.9 2.6 0 4.6 2 4.6 4.7 0 4.4-5.9 8.4-8 10.3z"/>'
  ],
  pill: [
    '<g transform="rotate(-12 12 12)">',
    '<rect x="3.8" y="8.3" width="16.4" height="7.4" rx="3.7"/>',
    '<path d="M12 8.3v7.4"/>',
    '</g>'
  ],
  pen: [
    '<path d="M16.8 3.4a2.8 2.8 0 0 1 4 4L7.3 20.2 3 21.4l1.2-4.3L16.8 3.4z"/>',
    '<path d="M14.6 5.6l3.9 3.9"/>'
  ],
  sun: [
    '<circle cx="12" cy="12" r="4.5"/>',
    '<path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4"/>',
    '<path d="M5.3 5.3l1.7 1.7M18.7 5.3l-1.7 1.7M5.3 18.7l1.7-1.7M18.7 18.7l-1.7-1.7"/>'
  ],
  spark: [
    '<path d="M12 3.4Q12.8 11.2 20.6 12 12.8 12.8 12 20.6 11.2 12.8 3.4 12 11.2 11.2 12 3.4Z"/>',
    '<circle cx="19.2" cy="5.1" r="1" fill="currentColor" stroke="none"/>'
  ],
  star: [
    '<path d="M12 3.6l2.5 5.3 5.8.8-4.2 4.1 1 5.8-5.1-2.8-5.1 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.6z"/>'
  ],
  drink: [
    '<path d="M6.4 8.6h11.2l-1.1 11.1c-.1 1-1 1.7-2 1.7H9.5c-1 0-1.9-.7-2-1.7L6.4 8.6z"/>',
    '<path d="M5.5 8.6h13"/>',
    '<path d="M13.8 8.4l2-5.1"/>',
    '<circle cx="9.6" cy="16.5" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="12.4" cy="18.1" r=".9" fill="currentColor" stroke="none"/>',
    '<circle cx="14.9" cy="16" r=".7" fill="currentColor" stroke="none"/>'
  ],
  sweet: [
    '<circle cx="10.6" cy="9.8" r="6.8"/>',
    '<path d="M10.6 9.8a1.7 1.7 0 0 0 3.4 0 3.4 3.4 0 0 0-6.8 0 5.1 5.1 0 0 0 10.2 0"/>',
    '<path d="M15.4 14.6l5 5.4"/>'
  ],
  game: [
    '<path d="M7.5 8.3h9c3.2 0 5.5 2.7 5.5 6.1 0 2.1-1.2 3.6-3 3.6-1.4 0-2.4-1-3.1-2.2H8.1c-.7 1.2-1.7 2.2-3.1 2.2-1.8 0-3-1.5-3-3.6 0-3.4 2.3-6.1 5.5-6.1z"/>',
    '<path d="M7.4 11.4v3.4M5.7 13.1h3.4"/>',
    '<circle cx="16.5" cy="12.5" r=".9" fill="currentColor" stroke="none"/>',
    '<circle cx="18.2" cy="14.2" r=".9" fill="currentColor" stroke="none"/>'
  ],
  flower: [
    '<path d="M7.4 8.1c0-2.4 1.6-4.3 3.5-4.3.9 0 1.4.5 1.7 1.2.3-.7.8-1.2 1.7-1.2 1.9 0 3.5 1.9 3.5 4.3 0 3.1-2.2 5.5-5.2 5.5S7.4 11.2 7.4 8.1z"/>',
    '<path d="M12.4 13.6c-.2 2.4-.2 4.4 0 7"/>',
    '<path d="M12.2 17.2C9.4 17.4 7 16 6 13.2c3.1-.5 5.4.8 6.2 4z"/>',
    '<path d="M12.6 15.4c.6-2.8 2.7-4.2 6-3.8-.8 2.6-3 4.1-6 3.8z"/>'
  ],
  battery: [
    '<rect x="3.4" y="7.6" width="15.4" height="8.8" rx="2.4"/>',
    '<path d="M20.4 10.4v3.2"/>',
    '<path d="M8.2 10.6v2.8M12.6 10.6v2.8"/>'
  ],
  cloud: [
    '<path d="M7.4 18.4c-2.5 0-4.4-1.8-4.4-4.1 0-2.1 1.6-3.9 3.7-4.1.5-2.8 2.9-4.9 5.9-4.9 3.3 0 5.9 2.6 6 5.8 1.2.4 2 1.5 2 2.8 0 1.6-1.3 2.9-2.9 2.9H7.4z"/>'
  ],
  check: [
    '<path d="M4.6 12.4c1.7 1.4 3.2 3 4.7 4.7 3-4.2 6.3-7.5 10.2-10.3"/>'
  ],
  plus: [
    '<path d="M12 4.4v15.2M4.4 12h15.2"/>'
  ],
  close: [
    '<path d="M6.2 6.1c3.7 4 7.6 7.9 11.6 11.8M17.8 6.1c-3.9 3.9-7.9 7.9-11.6 11.8"/>'
  ],
  left: [
    '<path d="M15.2 5.2c-2.4 2.2-4.7 4.5-7 6.8 2.3 2.2 4.6 4.4 7 6.5"/>'
  ],
  right: [
    '<path d="M8.8 5.2c2.4 2.2 4.7 4.5 7 6.8-2.3 2.2-4.6 4.4-7 6.5"/>'
  ],
  sound: [
    '<path d="M4.4 9.5h2.9c.3 0 .5-.1.7-.3l3.3-2.6c.5-.4 1.2-.1 1.2.6v9.6c0 .7-.7 1-1.2.6l-3.3-2.6c-.2-.2-.4-.3-.7-.3H4.4c-.6 0-1.1-.5-1.1-1.1v-2.8c0-.6.5-1.1 1.1-1.1z"/>',
    '<path d="M14.7 9.3c1.7 1.5 1.7 3.9 0 5.4M17.4 6.9c3.1 2.8 3.1 7.4 0 10.2"/>'
  ],
  mute: [
    '<path d="M4.4 9.5h2.9c.3 0 .5-.1.7-.3l3.3-2.6c.5-.4 1.2-.1 1.2.6v9.6c0 .7-.7 1-1.2.6l-3.3-2.6c-.2-.2-.4-.3-.7-.3H4.4c-.6 0-1.1-.5-1.1-1.1v-2.8c0-.6.5-1.1 1.1-1.1z"/>',
    '<path d="M14.8 9.4l5 5.2M19.8 9.4l-5 5.2"/>'
  ],
  trash: [
    '<path d="M4.8 7.4h14.4"/>',
    '<path d="M9.4 7.4V5.8c0-.8.6-1.4 1.4-1.4h2.4c.8 0 1.4.6 1.4 1.4v1.6"/>',
    '<path d="M6.6 7.4l.5 12.1c0 1 .9 1.8 1.9 1.8h6c1 0 1.8-.8 1.9-1.8l.5-12.1"/>',
    '<path d="M10.3 11.2v5.8M13.7 11.2v5.8"/>'
  ],
  lock: [
    '<rect x="4.8" y="10.2" width="14.4" height="10" rx="3"/>',
    '<path d="M8.2 10V7.8a3.8 3.8 0 0 1 7.6 0V10"/>',
    '<circle cx="12" cy="14.4" r="1.1" fill="currentColor" stroke="none"/>',
    '<path d="M12 15.5v2"/>'
  ],
  gear: [
    '<path d="M10.08 3.67L13.92 3.67L14.63 7.45L18.25 6.17L20.18 9.5L17.25 12L20.18 14.5L18.25 17.83L14.63 16.55L13.92 20.33L10.08 20.33L9.38 16.55L5.75 17.83L3.82 14.5L6.75 12L3.82 9.5L5.75 6.17L9.37 7.45Z"/>',
    '<circle cx="12" cy="12" r="3"/>'
  ],
  download: [
    '<path d="M12 3.8v10.7"/>',
    '<path d="M7.7 10.3c1.4 1.5 2.9 3 4.3 4.6 1.5-1.6 2.9-3.1 4.3-4.6"/>',
    '<path d="M4.6 15.8v2.6c0 1 .8 1.8 1.8 1.8h11.2c1 0 1.8-.8 1.8-1.8v-2.6"/>'
  ],
  upload: [
    '<path d="M12 14.9V4.2"/>',
    '<path d="M7.7 8.8c1.4-1.5 2.9-3 4.3-4.6 1.5 1.6 2.9 3.1 4.3 4.6"/>',
    '<path d="M4.6 15.8v2.6c0 1 .8 1.8 1.8 1.8h11.2c1 0 1.8-.8 1.8-1.8v-2.6"/>'
  ],
  cat: [
    '<path d="M5.9 9.8L5.3 4.5c-.1-.8.8-1.3 1.5-.8l4.4 3.4"/>',
    '<path d="M18.1 9.8l.6-5.3c.1-.8-.8-1.3-1.5-.8l-4.4 3.4"/>',
    '<circle cx="12" cy="13.1" r="7.1"/>',
    '<circle cx="9.5" cy="12.7" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="14.5" cy="12.7" r=".8" fill="currentColor" stroke="none"/>',
    '<path d="M10.8 15.2c.4.5.8.7 1.2.7s.8-.2 1.2-.7"/>',
    '<path d="M3.2 13.8h2.6M3.6 16.3h2.3M20.8 13.8h-2.6M20.4 16.3h-2.3"/>'
  ],
  flame: [
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'
  ],
  seed: [
    '<path d="M12 20.4c-.1-2.6-.1-5.1 0-7.6"/>',
    '<path d="M12 15.8C9.1 16 6.7 14.5 5.8 11.6c2.9-.4 5.2.9 6.2 4.2z"/>',
    '<path d="M12.1 12.8c.2-3 2.2-4.8 5.4-4.5-.5 3-2.5 4.7-5.4 4.5z"/>',
    '<path d="M7 20.6c1.6-.8 3.3-1.2 5-1.2s3.4.4 5 1.2"/>'
  ],
  sofa: [
    '<path d="M5.4 11.6V8.8c0-1.6 1.3-2.9 2.9-2.9h7.4c1.6 0 2.9 1.3 2.9 2.9v2.8"/>',
    '<path d="M5.4 11.6c-1.4 0-2.5 1.1-2.5 2.5v3.1c0 1 .8 1.8 1.8 1.8h14.6c1 0 1.8-.8 1.8-1.8v-3.1c0-1.4-1.1-2.5-2.5-2.5"/>',
    '<path d="M5.4 13.4h13.2"/>',
    '<path d="M6.6 19v1.4M17.4 19v1.4"/>'
  ],
  bed: [
    '<path d="M4.2 18.6V8.4c0-1.1.9-2 2-2h.6"/>',
    '<path d="M4.2 13.2h15.6c.9 0 1.6.7 1.6 1.6v3.8H4.2z"/>',
    '<path d="M6 18.6v1.6M18.8 18.6v1.6"/>',
    '<path d="M7.4 13.2v-1.8c0-.7.6-1.3 1.3-1.3h3.2c.7 0 1.3.6 1.3 1.3v1.8"/>',
    '<path d="M13 13.2v-1.2c0-.7.6-1.3 1.3-1.3h3.4c1 0 1.9.8 1.9 1.9v.6"/>'
  ],
  pot: [
    '<path d="M12 3.8v1.6"/>',
    '<path d="M6 8.6c.4-2.3 2.9-4 6-4s5.6 1.7 6 4"/>',
    '<path d="M3.8 8.6h16.4"/>',
    '<path d="M5.8 8.6v6.6c0 2.3 1.8 4.1 4.1 4.1h4.2c2.3 0 4.1-1.8 4.1-4.1V8.6"/>',
    '<path d="M3.2 11.2h2.6v3.6H3.2M20.8 11.2h-2.6v3.6h2.6"/>'
  ],
  bath: [
    '<path d="M4 10.4h16v4.9c0 2.2-1.8 3.9-4 3.9H8c-2.2 0-4-1.7-4-3.9v-4.9z"/>',
    '<path d="M3.2 10.4h17.6"/>',
    '<path d="M7.2 19.2v1.2M16.8 19.2v1.2"/>',
    '<circle cx="8" cy="6.6" r="1.5"/>',
    '<circle cx="11.6" cy="4.7" r="1.9"/>',
    '<circle cx="15.4" cy="6.9" r="1.2"/>'
  ],
  school: [
    '<path d="M3.4 11.4L12 4.4l8.6 7"/>',
    '<path d="M5.4 10.4v9.2h13.2v-9.2"/>',
    '<path d="M10.2 19.6v-4.4c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v4.4"/>',
    '<circle cx="8.6" cy="13" r="1"/>',
    '<circle cx="15.4" cy="13" r="1"/>',
    '<path d="M12 4.4V2.4h3.4l-1 1.1 1 1.1H12"/>'
  ],
  film: [
    '<rect x="3.6" y="5.4" width="16.8" height="13.2" rx="2.6"/>',
    '<circle cx="6.1" cy="8.6" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="6.1" cy="12" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="6.1" cy="15.4" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="17.9" cy="8.6" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="17.9" cy="12" r=".8" fill="currentColor" stroke="none"/>',
    '<circle cx="17.9" cy="15.4" r=".8" fill="currentColor" stroke="none"/>',
    '<path d="M10.4 8.8l4.8 3.2-4.8 3.2z"/>'
  ],
  cart: [
    '<path d="M3.2 5.4h2.2c.6 0 1.1.4 1.2 1l1.3 7.2c.2 1.2 1.2 2 2.4 2h7c1.1 0 2-.8 2.2-1.8l1.2-5.3H6.4"/>',
    '<circle cx="9.2" cy="19.2" r="1.5"/>',
    '<circle cx="17.2" cy="19.2" r="1.5"/>'
  ],
  ball: [
    '<circle cx="12" cy="12" r="8.2"/>',
    '<path d="M12 3.8v16.4"/>',
    '<path d="M4.4 9.4c4.4.5 8 2.4 10.4 6.4"/>',
    '<path d="M19.6 9.4c-4.4.5-8 2.4-10.4 6.4"/>'
  ],
  mountain: [
    '<path d="M2.8 19.2l5.9-10.4 4.1 7.2 2.5-3.8 6 7H2.8z"/>',
    '<path d="M6.4 13.1l2.3 1.1 2.3-1.6"/>'
  ],
  car: [
    '<path d="M4 17v-3.2c0-.7.6-1.3 1.3-1.3h1.8l2.3-3.1c.4-.5 1-.8 1.6-.8h3.6c.6 0 1.2.3 1.6.8l2.3 3.1h1.8c.7 0 1.3.6 1.3 1.3V17"/>',
    '<path d="M4 17h1.9M9.7 17h4.6M18.1 17h1.9"/>',
    '<path d="M6.9 12.6h10.2M12 10.1v2.5"/>',
    '<circle cx="7.8" cy="17" r="1.9"/>',
    '<circle cx="16.2" cy="17" r="1.9"/>'
  ],
  map: [
    '<path d="M3.4 6.4l5.4-1.9 6.4 1.8 5.4-1.9v14.9l-5.4 1.9-6.4-1.8-5.4 1.9V6.4z"/>',
    '<path d="M8.8 4.5v14.9M15.2 6.3v14.9"/>'
  ],
  door: [
    '<path d="M5.4 20.2V6.6C5.4 5.2 6.6 4 8 4h8c1.4 0 2.6 1.2 2.6 2.6v13.6"/>',
    '<path d="M3.6 20.2h16.8"/>',
    '<circle cx="15.4" cy="13" r=".9" fill="currentColor" stroke="none"/>'
  ],
  refresh: [
    '<path d="M3.4 12a8.6 8.6 0 0 1 8.6-8.6c2.5 0 4.8.9 6.5 2.6l2.2 2.2"/>',
    '<path d="M20.7 3.6v4.8h-4.8"/>',
    '<path d="M20.6 12a8.6 8.6 0 0 1-8.6 8.6c-2.5 0-4.8-.9-6.5-2.6l-2.2-2.2"/>',
    '<path d="M3.3 20.4v-4.8h4.8"/>'
  ]
};

function shapesFor(name) {
  const shapes = Object.hasOwn(ICONS, name) ? ICONS[name] : ICONS.spark;
  return shapes.join("");
}

/**
 * Render a soft hand-drawn icon as inline SVG.
 * Size is controlled by CSS (the svg is 1em by default); the icon
 * inherits `currentColor` from the surrounding text.
 */
export function icon(name, className = "") {
  const extraClass = className ? ` ${className}` : "";
  return `<svg class="px-icon${extraClass}" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="fill:none" aria-hidden="true" focusable="false">${shapesFor(name)}</svg>`;
}

export function iconTile(name, extra = "") {
  return `<span class="icon-tile ${extra}">${icon(name)}</span>`;
}