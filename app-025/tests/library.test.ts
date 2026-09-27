import { describe, it, expect } from 'vitest';
import { plantRows, fishRows, hardscapeRows, substrateRows } from '../src/core/library';
import type { PlantRow, HardscapeRow, SubstrateRow } from '../src/data/db';
import type { Fish } from '../src/core/types';

function plant(p: Partial<PlantRow> & { id: string; name: string }): PlantRow {
  return {
    layer: 'mid',
    lightNeed: 'mid',
    growth: 'mid',
    co2Need: false,
    tempC: [20, 28],
    pricePerPlant: 10,
    note: '',
    ...p,
  };
}

function fish(p: Partial<Fish> & { id: string; name: string }): Fish {
  return {
    adultCm: 5,
    minTankL: 40,
    tempRange: [22, 26],
    ghRange: [2, 15],
    phRange: [6.0, 7.5],
    temperament: 'peaceful',
    plantNip: false,
    schooling: false,
    ...p,
  };
}

function hardscape(p: Partial<HardscapeRow> & { id: string; name: string }): HardscapeRow {
  return { kind: 'hardscape', defaultCm: 15, displacement: 0.5, note: '', shape: 'rock', ...p };
}

function substrate(p: Partial<SubstrateRow> & { label: string }): SubstrateRow {
  return { kind: 'sand', densityKgPerL: 1.5, ...p };
}

describe('素材库行装配 · 水草', () => {
  const plants = [
    plant({ id: 'p1', name: '铁皇冠', note: '阴性草，绑沉木' }),
    plant({ id: 'p2', name: '小水榕', note: '阴性草，绑石头' }),
    plant({ id: 'p3', name: '红蝴蝶', note: '需强光' }),
  ];

  it('空关键词或纯空白返回全部', () => {
    expect(plantRows(plants, '')).toHaveLength(3);
    expect(plantRows(plants, '   ')).toHaveLength(3);
  });

  it('关键词匹配名称或备注，且先 trim', () => {
    expect(plantRows(plants, ' 铁皇冠 ').map((r) => r.main)).toEqual(['铁皇冠']);
    // 仅备注命中（名称不含「沉木」）
    expect(plantRows(plants, '沉木').map((r) => r.main)).toEqual(['铁皇冠']);
    expect(plantRows(plants, '不存在的词')).toEqual([]);
  });

  it('标签拼装：层次/光照/速度/CO₂，备注进 sub 列', () => {
    const row = plantRows(
      [plant({ id: 'p', name: 'x', layer: 'front', lightNeed: 'high', growth: 'fast', co2Need: true, note: '备注A' })],
      '',
    )[0];
    expect(row.tags).toEqual(['前景', '高光', '快生', '需CO₂']);
    expect(row.sub).toBe('备注A');
    const back = plantRows([plant({ id: 'q', name: 'y', layer: 'back', lightNeed: 'low', growth: 'slow' })], '')[0];
    expect(back.tags).toEqual(['后景', '低光', '慢生', '无需CO₂']);
  });
});

describe('素材库行装配 · 鱼种', () => {
  const fishes = [
    fish({ id: 'f1', name: '红绿灯灯鱼', schooling: true }),
    fish({ id: 'f2', name: '宝莲灯灯鱼' }),
    fish({ id: 'f3', name: '斗鱼', temperament: 'aggressive' }),
  ];

  it('空关键词返回全部，关键词仅匹配名称', () => {
    expect(fishRows(fishes, '')).toHaveLength(3);
    expect(fishRows(fishes, '灯鱼').map((r) => r.main)).toEqual(['红绿灯灯鱼', '宝莲灯灯鱼']);
    expect(fishRows(fishes, '群游')).toEqual([]);
  });

  it('标签顺序固定：…性格 → 啃草 → 群游，空项被剔除', () => {
    const nipper = fishRows(
      [
        fish({
          id: 'f',
          name: 'x',
          adultCm: 10,
          minTankL: 100,
          tempRange: [24, 28],
          ghRange: [5, 12],
          phRange: [6.5, 7.5],
          temperament: 'semi',
          plantNip: true,
          schooling: true,
        }),
      ],
      '',
    )[0];
    expect(nipper.tags).toEqual([
      '成体 10cm',
      '≥100L',
      '24~28°C',
      'GH 5~12',
      'pH 6.5~7.5',
      '半凶',
      '啃草',
      '群游',
    ]);
    expect(nipper.sub).toBe('');

    const calm = fishRows([fish({ id: 'g', name: 'y', temperament: 'aggressive' })], '')[0];
    expect(calm.tags.slice(5)).toEqual(['凶']);
  });
});

describe('素材库行装配 · 硬景观', () => {
  const items = [
    hardscape({ id: 'h1', name: '青龙石', shape: 'rock', note: '硬水石' }),
    hardscape({ id: 'h2', name: '曼珠沉木', shape: 'wood', defaultCm: 25, displacement: 0.3, note: '需沉水' }),
  ];

  it('关键词仅匹配名称，不匹配备注', () => {
    expect(hardscapeRows(items, '')).toHaveLength(2);
    expect(hardscapeRows(items, '沉木').map((r) => r.main)).toEqual(['曼珠沉木']);
    expect(hardscapeRows(items, '硬水石')).toEqual([]);
  });

  it('标签拼装：默认尺寸/材质/排水系数，备注进 sub 列', () => {
    const [rock, wood] = hardscapeRows(items, '');
    expect(rock.tags).toEqual(['默认 15cm', '石材', '排水系数 0.5']);
    expect(rock.sub).toBe('硬水石');
    expect(wood.tags).toEqual(['默认 25cm', '沉木', '排水系数 0.3']);
  });
});

describe('素材库行装配 · 底砂', () => {
  const subs = [
    substrate({ label: '河沙(石英砂)', densityKgPerL: 1.6 }),
    substrate({ label: '水草泥(国产)', kind: 'soil', densityKgPerL: 1.05 }),
  ];

  it('关键词匹配 label', () => {
    expect(substrateRows(subs, '')).toHaveLength(2);
    expect(substrateRows(subs, ' 河沙 ').map((r) => r.main)).toEqual(['河沙(石英砂)']);
    expect(substrateRows(subs, '砾石')).toEqual([]);
  });

  it('标签拼装：密度，sub 为空', () => {
    const [sand] = substrateRows(subs, '');
    expect(sand.tags).toEqual(['密度 1.6 kg/L']);
    expect(sand.sub).toBe('');
  });
});
