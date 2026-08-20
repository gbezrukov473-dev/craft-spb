#!/usr/bin/env node
/**
 * scripts/compress-images.mjs
 *
 * Идемпотентная генерация современных форматов для public/assets/images/.
 *
 * Что делает за один запуск:
 *  - Для каждой картинки из PLAN генерирует набор ширин в AVIF и WebP
 *    (плюс PNG для логотипа и фавикона — им нужен fallback с альфой).
 *  - Исходники (.jpg/.png) НЕ трогает: они остаются и архивом, и запасным
 *    вариантом для старых браузеров, которые не знают ни AVIF, ни WebP.
 *  - Ширины подобраны под реальный размер картинки в вёрстке (см. PLAN):
 *    нет смысла отдавать 1600px в плитку галереи шириной 380px.
 *  - Уже собранные файлы пропускает по SHA1 исходника из
 *    scripts/.image-manifest.json.
 *  - Если новый файл не меньше старого хотя бы на SAVINGS_THRESHOLD,
 *    оставляет старый (не ухудшаем уже оптимизированное).
 *
 * Использование:
 *   npm run images                 — собрать всё новое/изменившееся
 *   npm run images -- --dry        — ничего не писать, просто показать план
 *   npm run images -- --force      — пересобрать всё, игнорируя манифест
 *   npm run images -- --prune      — удалить производные, которых нет в плане
 *   npm run images -- --quality-webp=90 --quality-avif=70
 *
 * Параметры качества подобраны так, чтобы тон кожи и фактура волос на фото
 * работ оставались близки к оригиналу. Нужно ещё бережнее — поднимите
 * QUALITY_WEBP до 90, QUALITY_AVIF до 72.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/* ------------------------------- config ------------------------------- */

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry') || args.includes('--dry-run');
const FORCE = args.includes('--force');
const PRUNE = args.includes('--prune');

function argNum(flag, def) {
  const hit = args.find((a) => a.startsWith(`${flag}=`));
  if (!hit) return def;
  const n = Number(hit.split('=')[1]);
  return Number.isFinite(n) ? n : def;
}

const QUALITY_WEBP = argNum('--quality-webp', 72);
const QUALITY_AVIF = argNum('--quality-avif', 52);
const EFFORT = 6;
const CONCURRENCY = 4;
const SAVINGS_THRESHOLD = 0.02;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'images');
const MANIFEST_PATH = path.join(__dirname, '.image-manifest.json');

/**
 * Ширины на картинку. Считаем от места в вёрстке (container 76rem ≈ 1216px):
 *  - hero — во всю ширину экрана, с запасом под 2× на ноутбуке;
 *  - плитка галереи 2/6 колонки ≈ 380 CSS-px: 400 закрывает 1×, 800 — 2×;
 *  - широкая плитка 4/6 ≈ 765 CSS-px: 800 на 1×, 1200 на плотных экранах;
 *  - why-portrait ограничен max-width: 22rem (352px);
 *  - about-портрет ≈ 540px в колонке 0.95fr;
 *  - логотип в шапке — высота 2.5rem, то есть ~41×40 CSS-px.
 * Ширины больше оригинала отбрасываются: апскейл только раздувает вес.
 */
const PLAN = [
  { base: 'hero-main',         ext: '.jpg', widths: [960, 1440, 1920] },
  { base: 'why-portrait',      ext: '.jpg', widths: [400, 720] },
  { base: 'team',              ext: '.jpg', widths: [560, 1080] },
  { base: 'gallery-interior',  ext: '.jpg', widths: [400, 800] },
  { base: 'gallery-workspace', ext: '.jpg', widths: [800, 1200] },
  { base: 'gallery-tools',     ext: '.jpg', widths: [400, 800] },
  { base: 'gallery-cut',       ext: '.jpg', widths: [400, 800] },
  { base: 'gallery-facade',    ext: '.jpg', widths: [800, 1200] },
  { base: 'work-1',            ext: '.jpg', widths: [400, 800, 1300] },
  { base: 'work-2',            ext: '.jpg', widths: [400, 800] },
  { base: 'work-3',            ext: '.jpg', widths: [400, 800] },
  { base: 'work-4',            ext: '.jpg', widths: [400, 800] },
  // Логотип и фавикон — плоская графика с альфой. Здесь PNG с палитрой
  // выигрывает у AVIF/WebP (logo-96.png — 2.1 КБ против 2.4 КБ у AVIF),
  // поэтому обходимся одним форматом: он же и есть fallback.
  { base: 'logo',    ext: '.png', widths: [48, 96, 160], formats: ['png'] },
  { base: 'favicon', ext: '.png', widths: [32, 180, 512], formats: ['png'] },
  // og-image остаётся только JPEG: краулеры превью (Telegram, WhatsApp,
  // Slack) до сих пор надёжно понимают именно его.
];

/* ------------------------------- utils -------------------------------- */

function sha1(buf) {
  return createHash('sha1').update(buf).digest('hex').slice(0, 16);
}

function fmtBytes(n) {
  if (!Number.isFinite(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function loadManifest() {
  try {
    const obj = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

async function saveManifest(m) {
  if (DRY_RUN) return;
  const sorted = Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Пишем во временный файл, затем атомарно переименовываем. На Windows rename
 * иногда падает с EPERM (антивирус, Explorer держит превью) — повторяем
 * несколько раз с backoff.
 */
async function renameWithRetry(from, to, attempts = 5) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      await fs.rename(from, to);
      return;
    } catch (err) {
      lastErr = err;
      if (err.code !== 'EPERM' && err.code !== 'EBUSY' && err.code !== 'EACCES') throw err;
      await sleep(100 * (i + 1));
    }
  }
  throw lastErr;
}

async function statSize(p) {
  try {
    return (await fs.stat(p)).size;
  } catch {
    return 0;
  }
}

async function writeIfSmaller(destPath, newBuf) {
  const origSize = await statSize(destPath);

  if (origSize > 0 && newBuf.length >= origSize * (1 - SAVINGS_THRESHOLD)) {
    return { action: 'kept-original', size: origSize, wrote: false };
  }
  if (DRY_RUN) {
    return {
      action: origSize > 0 ? 'would-replace' : 'would-create',
      size: newBuf.length,
      wrote: false,
    };
  }

  const tmp = destPath + '.tmp';
  await fs.writeFile(tmp, newBuf);
  await renameWithRetry(tmp, destPath);
  return { action: origSize > 0 ? 'replaced' : 'created', size: newBuf.length, wrote: true };
}

/* --------------------------- image pipeline --------------------------- */

function encode(pipeline, format) {
  if (format === 'avif') {
    return pipeline.avif({ quality: QUALITY_AVIF, effort: EFFORT }).toBuffer();
  }
  if (format === 'webp') {
    return pipeline.webp({ quality: QUALITY_WEBP, effort: EFFORT, smartSubsample: true }).toBuffer();
  }
  // PNG под логотип и фавикон: палитра даёт кратное уменьшение и визуально
  // неотличима на плоской графике, альфа при этом сохраняется.
  return pipeline.png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
}

async function processOne(item, manifest, stats, expected) {
  const srcPath = path.join(IMG_DIR, item.base + item.ext);

  let srcBuf;
  try {
    srcBuf = await fs.readFile(srcPath);
  } catch (err) {
    console.error(`  x ${item.base}${item.ext}: не удалось прочитать источник — ${err.message}`);
    stats.errors++;
    return;
  }

  const srcHash = sha1(srcBuf);
  const meta = await sharp(srcBuf).metadata();
  const formats = item.formats || (item.alsoPng ? ['avif', 'webp', 'png'] : ['avif', 'webp']);

  // Ширины шире оригинала бессмысленны; если оригинал мельче самой мелкой
  // ступени, отдаём его собственную ширину.
  let widths = item.widths.filter((w) => w <= meta.width);
  if (widths.length === 0) widths = [meta.width];

  for (const width of widths) {
    for (const format of formats) {
      const name = `${item.base}-${width}.${format}`;
      expected.add(name);
      const destPath = path.join(IMG_DIR, name);
      const quality =
        format === 'avif' ? `avif-${QUALITY_AVIF}` : format === 'webp' ? `webp-${QUALITY_WEBP}` : 'png-palette';

      const prev = manifest[name];
      const exists = (await statSize(destPath)) > 0;
      if (!FORCE && exists && prev && prev.srcHash === srcHash && prev.quality === quality) {
        stats.skipped++;
        continue;
      }

      let buf;
      try {
        buf = await encode(
          sharp(srcBuf, { failOn: 'none' }).rotate().resize({ width, withoutEnlargement: true }),
          format
        );
      } catch (err) {
        console.error(`  x ${name}: кодирование не удалось — ${err.message}`);
        stats.errors++;
        continue;
      }

      const res = await writeIfSmaller(destPath, buf);
      stats.bytesAfter += res.size;
      if (res.wrote || res.action.startsWith('would-')) stats.written++;

      console.log(`  + ${name.padEnd(30)} ${fmtBytes(res.size).padStart(9)}`);

      manifest[name] = {
        srcHash,
        width,
        quality,
        size: res.size,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
    }
  }

  stats.sourceBytes += srcBuf.length;
}

/** Удаляет производные, которых больше нет в PLAN (например, после смены ширин). */
async function prune(expected, stats) {
  const entries = await fs.readdir(IMG_DIR);
  for (const name of entries) {
    if (!/-\d+\.(avif|webp|png)$/.test(name)) continue;
    if (expected.has(name)) continue;
    console.log(`  - ${name} (нет в плане)`);
    if (!DRY_RUN) await fs.rm(path.join(IMG_DIR, name));
    stats.pruned++;
  }
}

async function runPool(items, worker, concurrency) {
  const queue = items.slice();
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(workers);
}

async function main() {
  console.log('Сборка AVIF/WebP для public/assets/images/');
  console.log(`   AVIF q=${QUALITY_AVIF}, WebP q=${QUALITY_WEBP}, effort=${EFFORT}`);
  if (DRY_RUN) console.log('   [DRY RUN] ничего не пишем, только показываем.');
  if (FORCE) console.log('   [FORCE]   игнорируем manifest, пересобираем всё.');
  console.log('');

  const manifest = FORCE ? {} : await loadManifest();
  const stats = { skipped: 0, written: 0, errors: 0, pruned: 0, sourceBytes: 0, bytesAfter: 0 };

  const expected = new Set();
  await runPool(PLAN, (item) => processOne(item, manifest, stats, expected), CONCURRENCY);

  if (PRUNE) {
    await prune(expected, stats);
    for (const key of Object.keys(manifest)) {
      if (!expected.has(key)) delete manifest[key];
    }
  }

  await saveManifest(manifest);

  console.log('');
  console.log('-'.repeat(60));
  console.log(`Источников в плане:      ${PLAN.length}`);
  console.log(`Файлов записано:         ${stats.written}`);
  console.log(`Пропущено (не менялось): ${stats.skipped}`);
  if (stats.pruned) console.log(`Удалено лишних:          ${stats.pruned}`);
  if (stats.errors) console.log(`Ошибок:                  ${stats.errors}`);
  if (DRY_RUN) console.log('\n(это был dry-run, на диск ничего не писали)');
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
