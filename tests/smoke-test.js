const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { window: {} };
vm.createContext(browser);

for (const locale of ["ru", "uk", "en"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "locales", `${locale}.js`), "utf8"), browser);
}
vm.runInContext(fs.readFileSync(path.join(root, "levels.js"), "utf8"), browser);

const locales = browser.window.LAST_CELL_LOCALES;
const levels = browser.window.LAST_CELL_LEVELS;
const localeKeys = Object.keys(locales.ru).sort().join("|");

for (const code of ["uk", "en"]) {
  if (Object.keys(locales[code]).sort().join("|") !== localeKeys) {
    throw new Error(`Locale keys do not match: ${code}`);
  }
}


const blockedObjects = new Set(["window", "fireplace", "candlestick", "table", "long_table", "plant", "bookcase", "wardrobe"]);
function clueMatchesSolution(level, clue) {
  const position = String(level.solution?.[clue.character] || "").split(",").map(Number);
  if (position.length !== 2 || position.some(Number.isNaN)) return false;
  const [row, col] = position;
  const cells = new Map(level.cells.map(cell => [`${cell.r},${cell.c}`, cell]));
  const cell = cells.get(`${row},${col}`);
  if (!cell || blockedObjects.has(cell.object)) return false;
  if (clue.row != null && row !== clue.row) return false;
  if (clue.col != null && col !== clue.col) return false;
  if (clue.notRow != null && row === clue.notRow) return false;
  if (clue.notCol != null && col === clue.notCol) return false;
  if (clue.room && cell.roomId !== clue.room) return false;

  if (clue.targetCharacter) {
    const target = String(level.solution?.[clue.targetCharacter] || "").split(",").map(Number);
    if (target.length !== 2 || target.some(Number.isNaN)) return false;
    const [targetRow, targetCol] = target;
    const distance = Math.abs(row - targetRow) + Math.abs(col - targetCol);
    if (clue.relation === "aboveCharacter" && !(row < targetRow)) return false;
    if (clue.relation === "belowCharacter" && !(row > targetRow)) return false;
    if (clue.relation === "leftOfCharacter" && !(col < targetCol)) return false;
    if (clue.relation === "rightOfCharacter" && !(col > targetCol)) return false;
    if (clue.relation === "adjacentCharacter" && distance !== 1) return false;
    if (clue.relation === "notAdjacentCharacter" && distance === 1) return false;
  }

  const relation = clue.relation || (clue.on ? "on" : clue.adj ? "adjacent" : clue.not_adj ? "notAdjacent" : null);
  const objectType = clue.objectType || clue.on || clue.adj || clue.not_adj;
  const object = clue.objectId ? level.cells.find(item => item.objectId === clue.objectId) : null;
  const neighbours = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
    .map(([r, c]) => cells.get(`${r},${c}`)).filter(Boolean);
  const sameObject = item => clue.objectId ? item.objectId === clue.objectId : item.object === objectType;
  if (relation === "on") return clue.objectId ? cell.objectId === clue.objectId : cell.object === objectType;
  if (relation === "adjacent") return neighbours.some(sameObject);
  if (relation === "notAdjacent") return !neighbours.some(sameObject);
  return true;
}

const ids = new Set();
let campaignCount = 0;
for (const level of levels) {
  if (ids.has(level.id)) throw new Error(`Duplicate level id: ${level.id}`);
  ids.add(level.id);
  if (level.isDaily) continue;
  campaignCount += 1;

  if (!Number.isInteger(level.rows) || !Number.isInteger(level.cols) || !Array.isArray(level.cells)) {
    throw new Error(`Invalid board dimensions: ${level.id}`);
  }

  const cells = new Map(level.cells.map(cell => [`${cell.r},${cell.c}`, cell]));
  for (const character of level.activeCharacters) {
    const position = level.solution?.[character];
    if (!position || !cells.has(position)) throw new Error(`Missing solution position: ${level.id}/${character}`);
    if (cells.get(position).r >= level.rows || cells.get(position).c >= level.cols) {
      throw new Error(`Solution is outside the board: ${level.id}/${character}`);
    }
  }
  for (const clue of level.clues || []) {
    if (!level.activeCharacters.includes(clue.character)) {
      throw new Error(`Clue references an inactive character: ${level.id}/${clue.character}`);
    }
    if (!clueMatchesSolution(level, clue)) {
      throw new Error(`Clue contradicts the solution: ${level.id}/${clue.character}`);
    }
  }
}

if (campaignCount !== 442) throw new Error(`Expected 442 campaign levels, found ${campaignCount}`);

const generatorContext = { window: {}, console, Date, Math, Map, Set, JSON, Object, Array, String, Number, RegExp, Error, Boolean };
vm.createContext(generatorContext);
vm.runInContext(fs.readFileSync(path.join(root, "daily_generator.js"), "utf8"), generatorContext);
const dailyA = generatorContext.window.LastCellGenerator.generateDaily("2026-10-18");
const dailyB = generatorContext.window.LastCellGenerator.generateDaily("2026-10-18");
if (JSON.stringify(dailyA) !== JSON.stringify(dailyB)) throw new Error("Daily case is not deterministic");
if (!dailyA.cells.length || !dailyA.clues.length) throw new Error("Daily case is incomplete");
for (const clue of dailyA.clues) {
  if (!clueMatchesSolution(dailyA, clue)) throw new Error(`Daily clue contradicts the solution: ${clue.character}`);
}

console.log(`Smoke tests passed: ${campaignCount} campaign levels, 3 locales, clue/solution consistency, deterministic daily case.`);
