/*
 * Genera el tema PrimeNG de PISAC a partir de "lara-light-blue".
 *
 * Los temas de PrimeNG 17 usan colores fijos (no variables CSS), así que la forma limpia de aplicar
 * la paleta institucional del SHN es sustituir la paleta azul de Lara por la de la guía de marca y
 * guardar el resultado como un tema propio. Si se actualiza PrimeNG, basta con volver a ejecutar:
 *
 *   node scripts/build-pisac-theme.js
 *
 * Paleta (manual_marca_web_shn_venezuela.pdf, §05 y §16):
 *   azul marino #002B5C · marino profundo #001D3D · azul claro #4FB9E3 · naranja #F47C20 · tinta #253746
 */
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'node_modules', 'primeng', 'resources', 'themes', 'lara-light-blue', 'theme.css');
const TARGET = path.join(__dirname, '..', 'src', 'styling', 'pisac', 'theme', 'pisac-lara-light.css');

// [valor de Lara, valor PISAC, descripción]
const REPLACEMENTS = [
  ['#3B82F6', '#002B5C', 'primario -> azul marino'],
  ['#2563EB', '#001D3D', 'primario hover -> marino profundo'],
  ['#1D4ED8', '#002B5C', 'texto resaltado / activo -> azul marino'],
  ['#EFF6FF', '#E8F6FC', 'fondo de selección -> azul claro 12 %'],
  ['#BFDBFE', '#A7DCF1', 'anillo de foco -> azul claro 50 %'],
  ['rgba(59, 130, 246,', 'rgba(0, 43, 92,', 'primario translúcido -> marino translúcido'],
  ['#4B5563', '#253746', 'texto principal -> tinta institucional'],
];

const FONT_STACK = '"Source Sans 3", Arial, sans-serif';

let css = fs.readFileSync(SOURCE, 'utf8');
const report = [];

for (const [from, to, label] of REPLACEMENTS) {
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const count = (css.match(regex) || []).length;
  css = css.replace(regex, to);
  report.push(`${String(count).padStart(4)}  ${from} -> ${to}  (${label})`);
}

// Tipografía institucional en lugar de Inter (y sin los @font-face de Inter, que apuntan a ./fonts)
css = css.replace(/@font-face\s*{[^}]*Inter[^}]*}/g, '');
css = css.replace(/"Inter var", sans-serif/g, FONT_STACK);
css = css.replace(/font-feature-settings: "cv02", "cv03", "cv04", "cv11";/g, 'font-feature-settings: normal;');
css = css.replace(/--font-feature-settings: "cv02", "cv03", "cv04", "cv11";/g, '--font-feature-settings: normal;');

const header = `/* ARCHIVO GENERADO por scripts/build-pisac-theme.js a partir de primeng/lara-light-blue. No editar a mano. */\n`;
fs.mkdirSync(path.dirname(TARGET), { recursive: true });
fs.writeFileSync(TARGET, header + css, 'utf8');

console.log(`Tema generado: ${path.relative(process.cwd(), TARGET)}`);
console.log(report.join('\n'));
