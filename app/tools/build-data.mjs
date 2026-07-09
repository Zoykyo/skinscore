// build-data.mjs — regenerate the app's data file from the research Markdown.
// Run after the weekly deepening task updates the research:
//   node app/tools/build-data.mjs
// Parses the Cycle-09 leaderboard (all 90 interventions) + the Charter changelog
// into app/data/skinscore-data.json, which the app fetches on load (falling back
// to its embedded copy when the file isn't reachable, e.g. offline or the artifact).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const RESEARCH = resolve(here, '..', '..');            // …/Skincare-Research
const DATA_DIR = resolve(here, '..', 'data');          // …/app/data

const leaderboard = readFileSync(resolve(RESEARCH, 'Cycle-09_Synthesis-and-Leaderboard.md'), 'utf8');
const charter = readFileSync(resolve(RESEARCH, '00_Charter.md'), 'utf8');

// --- 90-item leaderboard: rows look like  | 7 | Tretinoin / prescription retinoid | C2·C6 | 84 |
const board = [];
const rowRe = /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|/gm;
let m;
while ((m = rowRe.exec(leaderboard)) !== null) {
  board.push([Number(m[1]), m[2].trim(), m[3].trim(), Number(m[4])]);
}
board.sort((a, b) => a[0] - b[0]);

// --- changelog: bullets like  - **v1.1 (2026-07-09):** First pass … (may wrap across lines)
const changelog = [];
const clRe = /\*\*(v[\d.]+)\s*\(([^)]+)\):\*\*\s*([\s\S]*?)(?=(?:\n\s*-\s*\*\*v)|\n\s*\n|$)/g;
while ((m = clRe.exec(charter)) !== null) {
  changelog.push({ v: m[1], date: m[2].trim(), note: m[3].replace(/\s+/g, ' ').trim() });
}
changelog.reverse(); // newest first for display

if (board.length !== 90) {
  console.warn(`⚠ Expected 90 interventions, parsed ${board.length}. Check the Cycle-09 tables.`);
}

const out = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  source: 'Cycle-09 leaderboard + Charter changelog',
  counts: {
    core: board.filter((r) => r[3] >= 75).length,
    promising: board.filter((r) => r[3] >= 55 && r[3] < 75).length,
    experimental: board.filter((r) => r[3] >= 35 && r[3] < 55).length,
    skip: board.filter((r) => r[3] < 35).length,
  },
  board,
  changelog,
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(resolve(DATA_DIR, 'skinscore-data.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`✓ ${board.length} interventions · ${changelog.length} changelog entries · updated ${out.updated}`);
console.log(`  tiers: ${out.counts.core} Core · ${out.counts.promising} Promising · ${out.counts.experimental} Experimental · ${out.counts.skip} Skip`);
