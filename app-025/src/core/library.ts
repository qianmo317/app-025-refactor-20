import type { Fish } from './types';
import type { HardscapeRow, PlantRow, SubstrateRow } from '../data/db';

/**
 * 素材库页行数据拼装（纯函数，不依赖 React，可单测）。
 * 输入：某类数据 + 搜索关键词；输出：表格三列 名称 main / 标签 tags / 备注 sub。
 * 关键词先 trim，空串不过滤；包含判断沿用页面原逻辑：
 * 水草查名称+备注，鱼种/硬景观只查名称，底砂只查 label。
 */
export type LibraryRow = {
  main: string;
  tags: string[];
  sub: string;
};

/** 水草行：按名称或备注包含关键词过滤；标签为 层次/光照/生长/CO₂ */
export function plantRows(plants: PlantRow[], q: string): LibraryRow[] {
  const kw = q.trim();
  return plants
    .filter((p) => !kw || p.name.includes(kw) || p.note.includes(kw))
    .map((p) => ({
      main: p.name,
      tags: [
        p.layer === 'front' ? '前景' : p.layer === 'mid' ? '中景' : '后景',
        `${p.lightNeed === 'high' ? '高光' : p.lightNeed === 'mid' ? '中光' : '低光'}`,
        `${p.growth === 'fast' ? '快生' : p.growth === 'mid' ? '中速' : '慢生'}`,
        p.co2Need ? '需CO₂' : '无需CO₂',
      ],
      sub: p.note,
    }));
}

/** 鱼种行：按名称包含关键词过滤；标签末段固定为 性格→啃草→群游（后两项为 true 才出现） */
export function fishRows(fishes: Fish[], q: string): LibraryRow[] {
  const kw = q.trim();
  return fishes
    .filter((f) => !kw || f.name.includes(kw))
    .map((f) => ({
      main: f.name,
      tags: [
        `成体 ${f.adultCm}cm`,
        `≥${f.minTankL}L`,
        `${f.tempRange.join('~')}°C`,
        `GH ${f.ghRange.join('~')}`,
        `pH ${f.phRange.join('~')}`,
        f.temperament === 'aggressive' ? '凶' : f.temperament === 'semi' ? '半凶' : '温和',
        f.plantNip ? '啃草' : null,
        f.schooling ? '群游' : null,
      ].filter(Boolean) as string[],
      sub: '',
    }));
}

/** 硬景观行：按名称包含关键词过滤；标签为 默认尺寸/形状/排水系数 */
export function hardscapeRows(hardscapes: HardscapeRow[], q: string): LibraryRow[] {
  const kw = q.trim();
  return hardscapes
    .filter((h) => !kw || h.name.includes(kw))
    .map((h) => ({
      main: h.name,
      tags: [`默认 ${h.defaultCm}cm`, h.shape === 'wood' ? '沉木' : '石材', `排水系数 ${h.displacement}`],
      sub: h.note,
    }));
}

/** 底砂行：按 label 包含关键词过滤；标签仅密度 */
export function substrateRows(substrates: SubstrateRow[], q: string): LibraryRow[] {
  const kw = q.trim();
  return substrates
    .filter((s) => !kw || s.label.includes(kw))
    .map((s) => ({
      main: s.label,
      tags: [`密度 ${s.densityKgPerL} kg/L`],
      sub: '',
    }));
}
