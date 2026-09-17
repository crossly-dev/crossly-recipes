#!/usr/bin/env node
/**
 * Build the recipe library, and refuse to ship one that would not import.
 *
 *   node integrations/recipes/build.mjs            build + validate
 *   node integrations/recipes/build.mjs --check    validate only
 *
 * ── WHY THIS VALIDATES AGAINST THE REAL CATALOG ──────────────────────
 * A recipe library whose recipes do not import is worse than no library: the
 * first thing a new seller does is try one, and the first thing they learn is
 * that our examples are broken.
 *
 * So validation imports `AUTOMATION_TRIGGERS` / `ACTIONS` / `CONDITIONS` from
 * the API itself rather than duplicating a list here. A copy would be correct
 * on the day it was written and silently wrong the first time somebody renames
 * an action — which is precisely the failure this is supposed to prevent.
 *
 * ── THE PLACEHOLDER RULE ─────────────────────────────────────────────
 * Some recipes cannot be complete: a Slack notification needs YOUR integration
 * id, a canned reply needs YOUR canned id. Those carry a REPLACE_WITH_ token,
 * which is deliberately not a valid id — importing without editing fails
 * loudly instead of sending a blank message to a customer. The build counts
 * them so the README can say how many need a two-second edit.
 */
import { readdirSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const OUT = join(HERE, 'recipes');
const CHECK_ONLY = process.argv.includes('--check');

const SCHEMA_URL = 'https://crossly.net/schemas/automation-recipe-v1.json';

// ── Load the catalog from the API, not from a copy ───────────────────
const catalogPath = join(REPO, 'packages/api/src/lib/automation-catalog.js');
let AUTOMATION_TRIGGERS;
let AUTOMATION_ACTIONS;
let AUTOMATION_CONDITIONS;
try {
  ({ AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS, AUTOMATION_CONDITIONS } = await import(
    `file://${catalogPath.replace(/\\/g, '/')}`
  ));
} catch {
  // The catalog is TypeScript; running this through plain node cannot import
  // it. `pnpm recipes:build` runs it under tsx, which can. Said explicitly
  // because "cannot find module" would send somebody looking for a missing
  // file that is right there.
  console.error(
    'Could not load the automation catalog.\n' +
      'Run this under tsx so the TypeScript catalog can be imported:\n\n' +
      '    npx tsx integrations/recipes/build.mjs\n',
  );
  process.exit(1);
}

const byId = (list) => new Map(list.map((e) => [e.id, e]));
const triggers = byId(AUTOMATION_TRIGGERS);
const actions = byId(AUTOMATION_ACTIONS);
const conditions = byId(AUTOMATION_CONDITIONS);

// ── Collect the recipes ──────────────────────────────────────────────
const modules = readdirSync(join(HERE, 'src')).filter((f) => f.endsWith('.mjs'));
const groups = [];
for (const file of modules) {
  const mod = await import(`file://${join(HERE, 'src', file).replace(/\\/g, '/')}`);
  for (const [name, value] of Object.entries(mod)) {
    if (Array.isArray(value)) groups.push({ category: name, file, recipes: value });
  }
}

// ── Validate ─────────────────────────────────────────────────────────
const problems = [];
let placeholders = 0;
let total = 0;

function checkPart(kind, part, catalog, where) {
  if (!part) return;
  const entry = catalog.get(part.type);
  if (!entry) {
    problems.push(`${where}: unknown ${kind} "${part.type}"`);
    return;
  }
  const config = part.config ?? {};
  for (const [field, spec] of Object.entries(entry.configSchema)) {
    if (spec.required && config[field] === undefined) {
      problems.push(`${where}: ${kind} "${part.type}" is missing required config.${field}`);
    }
  }
  for (const field of Object.keys(config)) {
    if (!(field in entry.configSchema)) {
      // An unknown field is a typo that the server will drop silently, so the
      // recipe would import and then not behave as written.
      problems.push(`${where}: ${kind} "${part.type}" has unknown config.${field}`);
    }
  }
  for (const value of Object.values(config)) {
    if (typeof value === 'string' && value.startsWith('REPLACE_WITH_')) placeholders += 1;
  }
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

const seenSlugs = new Set();

for (const group of groups) {
  for (const recipe of group.recipes) {
    total += 1;
    const where = `${group.category}/${recipe.name}`;

    if (!recipe.name) problems.push(`${group.file}: a recipe has no name`);
    if (!recipe.description) problems.push(`${where}: no description`);
    if (!recipe.trigger) problems.push(`${where}: no trigger`);
    if (!recipe.action) problems.push(`${where}: no action`);

    checkPart('trigger', recipe.trigger, triggers, where);
    checkPart('action', recipe.action, actions, where);
    checkPart('condition', recipe.condition, conditions, where);

    const s = slug(recipe.name);
    if (seenSlugs.has(s)) problems.push(`${where}: duplicate filename slug "${s}"`);
    seenSlugs.add(s);
  }
}

if (problems.length) {
  console.error(`\n  ${problems.length} problem(s) — nothing written:\n`);
  for (const p of problems) console.error(`    ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`\n  ${total} recipes across ${groups.length} categories — all valid against the catalog`);
console.log(`  ${placeholders} field(s) need a REPLACE_WITH_ edit before import\n`);

if (CHECK_ONLY) process.exit(0);

// ── Emit ─────────────────────────────────────────────────────────────
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const all = [];

for (const group of groups) {
  const dir = join(OUT, group.category);
  mkdirSync(dir, { recursive: true });

  for (const recipe of group.recipes) {
    // One file per recipe: the point of the library is that somebody can read
    // one, understand it, and paste it. A single bundle is worse for that even
    // though it is fewer files.
    const doc = {
      $schema: SCHEMA_URL,
      schemaVersion: 1,
      name: recipe.name,
      description: recipe.description,
      trigger: recipe.trigger,
      ...(recipe.condition ? { condition: recipe.condition } : {}),
      action: recipe.action,
      ...(recipe.platforms ? { platforms: recipe.platforms } : {}),
    };
    writeFileSync(join(dir, `${slug(recipe.name)}.json`), JSON.stringify(doc, null, 2) + '\n');
    all.push(doc);
  }
}

// And a bundle, because importing 60 files one at a time is nobody's idea of
// a good time. The import endpoint takes either shape.
writeFileSync(
  join(OUT, 'all.json'),
  JSON.stringify({ $schema: SCHEMA_URL, schemaVersion: 1, recipes: all }, null, 2) + '\n',
);

const index = groups
  .map((g) => {
    const rows = g.recipes
      .map((r) => `| [${r.name}](recipes/${g.category}/${slug(r.name)}.json) | ${r.trigger.type} | ${r.action.type} |`)
      .join('\n');
    return `### ${g.category}\n\n| recipe | trigger | action |\n|---|---|---|\n${rows}\n`;
  })
  .join('\n');

writeFileSync(join(HERE, 'INDEX.md'), `# Recipe index\n\n${total} recipes.\n\n${index}`);

console.log(`  wrote ${total} recipe files + all.json + INDEX.md\n`);
