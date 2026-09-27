import type { Fish } from './types';
import type { PlantRow, HardscapeRow, SubstrateRow } from '../data/db';

/**
 * 素材库行数据装配（纯函数，页面只负责渲染）：
 * 每类数据一个函数，输入数据与搜索关键词，输出表格三列——
 * 名称 main / 标签 tags / 备注 sub。
 * 关键词先 trim，为空则不过滤；包含判断规则各类不同，与页面原行为一致。
 */

export type LibraryRow = {
  /** 名称列 */
  main: string;
  /** 标签列（顺序即展示顺序） */
  tags: string[];
  /** 备注列 */
  sub: string;
};

/** 水草：关键词匹配名称或备注 */
export function plantRows(plants: PlantRow[], keyword: string): LibraryRow[] {
  const kw = keyword.trim();
  return plants
    .filter((p) => !kw || p.name.includes(kw) || p.note.includes(kw))
    .map((p) => ({
      main: p.name,
      tags: [
        p.layer === 'front' ? '前景' : p.layer === 'mid' ? '中景' : '后景',
        p.lightNeed === 'high' ? '高光' : p.lightNeed === 'mid' ? '中光' : '低光',
        p.growth === 'fast' ? '快生' : p.growth === 'mid' ? '中速' : '慢生',
        p.co2Need ? '需CO₂' : '无需CO₂',
      ],
      sub: p.note,
    }));
}

/** 鱼种：关键词仅匹配名称；标签顺序固定为 …性格 → 啃草 → 群游 */
export function fishRows(fishes: Fish[], keyword: string): LibraryRow[] {
  const kw = keyword.trim();
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

/** 硬景观：关键词仅匹配名称 */
export function hardscapeRows(hardscapes: HardscapeRow[], keyword: string): LibraryRow[] {
  const kw = keyword.trim();
  return hardscapes
    .filter((h) => !kw || h.name.includes(kw))
    .map((h) => ({
      main: h.name,
      tags: [`默认 ${h.defaultCm}cm`, h.shape === 'wood' ? '沉木' : '石材', `排水系数 ${h.displacement}`],
      sub: h.note,
    }));
}

/** 底砂：关键词仅匹配名称（label） */
export function substrateRows(substrates: SubstrateRow[], keyword: string): LibraryRow[] {
  const kw = keyword.trim();
  return substrates
    .filter((s) => !kw || s.label.includes(kw))
    .map((s) => ({
      main: s.label,
      tags: [`密度 ${s.densityKgPerL} kg/L`],
      sub: '',
    }));
}
