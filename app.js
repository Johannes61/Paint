const COLS = 200;
const ROWS = 200;
const PIXEL_EMPTY = '#ffffff';
const ROOM_KEY = 'lb_pixelboard_room_v2';

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.floor(Math.random() * 20);
  const l = 50 + Math.floor(Math.random() * 10);
  return `hsl(${h} ${s}% ${l}%)`;
}
let currentColor = randomColor();
let currentTool = 'pencil';
let isDrawing = false;

const boardEl = document.getElementById('board');
const pencilBtn = document.getElementById('tool-pencil');
const eraserBtn = document.getElementById('tool-eraser');
const colorBtn  = document.getElementById('tool-color');
const colorModal = document.getElementById('color-modal');
const colorPicker = document.getElementById('color-picker');
const randomColorBtn = document.getElementById('random-color');
const currentColorSwatch = document.getElementById('current-color');
const closeModalBtn = document.getElementById('close-modal');

currentColorSwatch.style.background = currentColor;

document.documentElement.style.setProperty('--cols', COLS);
document.documentElement.style.setProperty('--rows', ROWS);

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gunjs.herokuapp.com/gun'
  ]
});
const room = gun.get(ROOM_KEY);

const pixels = new Map();
function keyOf(x, y) { return `${x},${y}`; }

(function createGrid(){
  const frag = document.createDocumentFragment();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.createElement('div');
      cell.className = 'pixel';
      cell.dataset.x = x;
      cell.dataset.y = y;
      frag.appendChild(cell);
      pixels.set(keyOf(x,y), cell);
    }
  }
  boardEl.appendChild(frag);
})();

room.map().on((data, key) => {
  if (!key) return;
  const [xStr, yStr] = key.split(',');
  const x = parseInt(xStr, 10), y = parseInt(yStr, 10);
  if (Number.isNaN(x) || Number.isNaN(y)) return;

  const color = data && data.c ? data.c : null;
  const el = pixels.get(keyOf(x,y));
  if (!el) return;
  el.style.background = color || PIXEL_EMPTY;
});

function putPixel(x, y, colorOrNull) {
  room.get(keyOf(x,y)).put({ c: colorOrNull || null, t: Date.now() });
}

function handlePaint(target) {
  const x = parseInt(target.dataset.x, 10);
  const y = parseInt(target.dataset.y, 10);
  if (Number.isNaN(x) || Number.isNaN(y)) return;

  if (currentTool === 'eraser') {
    putPixel(x, y, null);
  } else {
    putPixel(x, y, currentColor);
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

['pointerup','pointercancel','pointerleave'].forEach(ev =>
  boardEl.addEventListener(ev, () => { isDrawing = false; })
);

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
  currentColorSwatch.style.background = currentColor;
});
colorPicker.addEventListener('input', (e) => {
  const hex = e.target.value;
  currentColor = hex;
  currentColorSwatch.style.background = currentColor;
});
colorModal.addEventListener('click', (e) => {
  if (e.target === colorModal) colorModal.classList.add('hidden');
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') colorModal.classList.add('hidden');
});
