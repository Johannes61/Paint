/* ====== CONFIG ====== */
const GRID_SIZE = 64;        // bigger board
const PIXEL_SIZE = 12;       // visual size (also set in CSS)
const BOARD_KEY = 'pixelboard-v1'; // namespace in GUN
/* ==================== */

/* Random color every page load (requirement) */
function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.floor(Math.random() * 20);
  const l = 50 + Math.floor(Math.random() * 10);
  return `hsl(${h} ${s}% ${l}%)`;
}
let currentColor = randomColor();
let currentTool = 'pencil'; // 'pencil' | 'eraser'
let isDrawing = false;

/* UI elements */
const boardEl = document.getElementById('board');
const pencilBtn = document.getElementById('tool-pencil');
const eraserBtn = document.getElementById('tool-eraser');
const colorBtn  = document.getElementById('tool-color');
const colorSwatch = document.getElementById('color-swatch');
const colorModal = document.getElementById('color-modal');
const colorPicker = document.getElementById('color-picker');
const randomColorBtn = document.getElementById('random-color');
const currentColorSwatch = document.getElementById('current-color');
const closeModalBtn = document.getElementById('close-modal');

colorSwatch.style.background = currentColor;
currentColorSwatch.style.background = currentColor;
colorPicker.value = '#000000'; // initial; will be replaced when user picks

/* GUN peer-to-peer realtime (no backend needed on GitHub Pages) */
const gun = Gun({
  peers: [
    // public community relays (best-effort); add more for resilience
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gunjs.herokuapp.com/gun'
  ]
});
const board = gun.get(BOARD_KEY);

/* Build grid */
const pixels = new Map(); // key: "x,y" -> DOM element
function makeKey(x, y) { return `${x},${y}`; }

function createGrid() {
  // Sync CSS vars with JS values
  document.documentElement.style.setProperty('--grid-size', GRID_SIZE);
  document.documentElement.style.setProperty('--pixel-size', `${PIXEL_SIZE}px`);

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const div = document.createElement('div');
      div.className = 'pixel';
      div.dataset.x = x;
      div.dataset.y = y;
      boardEl.appendChild(div);
      pixels.set(makeKey(x, y), div);
    }
  }
}
createGrid();

/* Draw helpers */
function setPixel(x, y, colorOrNull) {
  // write to network
  board.get(makeKey(x, y)).put({ c: colorOrNull || null, t: Date.now() });
}

function applyLocal(x, y, colorOrNull) {
  const el = pixels.get(makeKey(x, y));
  if (!el) return;
  el.style.background = colorOrNull || '#ffffff';
}

/* Live subscriptions */
board.map().on((data, key) => {
  if (!key) return;
  const [xStr, yStr] = key.split(',');
  const x = parseInt(xStr, 10), y = parseInt(yStr, 10);
  if (Number.isNaN(x) || Number.isNaN(y)) return;

  const color = data && data.c ? data.c : null;
  applyLocal(x, y, color);
});

/* Interaction state */
function handlePaint(target) {
  const x = parseInt(target.dataset.x, 10);
  const y = parseInt(target.dataset.y, 10);
  if (Number.isNaN(x) || Number.isNaN(y)) return;

  if (currentTool === 'eraser') {
    setPixel(x, y, null); // erase to white
  } else {
    setPixel(x, y, currentColor);
  }
}

boardEl.addEventListener('pointerdown', (e) => {
  const t = e.target;
  if (!t.classList.contains('pixel')) return;
  isDrawing = true;
  t.setPointerCapture(e.pointerId);
  handlePaint(t);
});

boardEl.addEventListener('pointermove', (e) => {
  if (!isDrawing) return;
  const t = document.elementFromPoint(e.clientX, e.clientY);
  if (t && t.classList && t.classList.contains('pixel')) {
    handlePaint(t);
  }
});

['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
  boardEl.addEventListener(ev, () => { isDrawing = false; })
);

/* Tools */
function setActiveTool(tool) {
  currentTool = tool;
  pencilBtn.classList.toggle('active', tool === 'pencil');
  eraserBtn.classList.toggle('active', tool === 'eraser');
}
pencilBtn.addEventListener('click', () => setActiveTool('pencil'));
eraserBtn.addEventListener('click', () => setActiveTool('eraser'));

colorBtn.addEventListener('click', () => {
  colorModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  colorModal.classList.add('hidden');
});

randomColorBtn.addEventListener('click', () => {
  currentColor = randomColor();
  colorSwatch.style.background = currentColor;
  currentColorSwatch.style.background = currentColor;
});

/* When a user picks a specific color via HUD, override session color */
colorPicker.addEventListener('input', (e) => {
  const hex = e.target.value;
  currentColor = hex;
  colorSwatch.style.background = currentColor;
  currentColorSwatch.style.background = currentColor;
});

/* Accessibility: close modal on backdrop click or ESC */
colorModal.addEventListener('click', (e) => {
  if (e.target === colorModal) colorModal.classList.add('hidden');
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') colorModal.classList.add('hidden');
});
