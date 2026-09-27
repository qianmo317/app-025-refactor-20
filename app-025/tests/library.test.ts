import { describe, it, expect } from 'vitest';
import { fishRows, hardscapeRows, plantRows, substrateRows } from '../src/core/library';
import { FISHES, HARDSCAPES, PLANTS, SUBSTRATES } from '../src/data/db';

/**
 * 素材库行数据纯函数单测（不渲染页面）。
 * 期望值按数据文件手工核算，独立于被测实现。
 */

describe('plantRows（水草：名称或备注包含关键词）', () => {
  it('空关键词（含纯空格）返回全部水草', () => {
    expect(plantRows(PLANTS, '')).toHaveLength(PLANTS.length);
    expect(plantRows(PLANTS, '   ')).toHaveLength(PLANTS.length);
  });

  it('按名称过滤并拼出 层次/光照/生长/CO₂ 四标签与备注', () => {
    const rows = plantRows(PLANTS, '红宫廷');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      main: '红宫廷',
      tags: ['后景', '高光', '快生', '需CO₂'],
      sub: '强光+CO2才发色，需常修剪',
    });
  });

  it('名称不含但备注含有的关键词也能命中（阴性草）', () => {
    const rows = plantRows(PLANTS, '阴性草');
    expect(rows.map((r) => r.main)).toEqual(['铁皇冠', '小水榕']);
  });

  it('关键词先 trim 再匹配', () => {
    expect(plantRows(PLANTS, '  红宫廷  ')).toHaveLength(1);
  });

  it('无命中返回空数组', () => {
    expect(plantRows(PLANTS, '不存在的水草')).toEqual([]);
  });
});

describe('fishRows（鱼种：仅名称包含关键词）', () => {
  it('空关键词返回全部鱼种', () => {
    expect(fishRows(FISHES, '')).toHaveLength(FISHES.length);
  });

  it('按名称过滤「灯鱼」', () => {
    const rows = fishRows(FISHES, '灯鱼');
    expect(rows.map((r) => r.main)).toEqual(['红绿灯灯鱼', '宝莲灯灯鱼', '艾斯佩灯鱼(小三角灯)']);
  });

  it('标签末段固定为 性格→啃草→群游 顺序（虎皮鱼：半凶/啃草/群游）', () => {
    const rows = fishRows(FISHES, '虎皮鱼');
    expect(rows).toHaveLength(1);
    expect(rows[0].tags).toEqual(['成体 6cm', '≥80L', '22~27°C', 'GH 4~18', 'pH 6~8', '半凶', '啃草', '群游']);
    expect(rows[0].sub).toBe('');
  });

  it('温和且不啃草不群游时不出现 啃草/群游 标签（孔雀鱼）', () => {
    const rows = fishRows(FISHES, '孔雀鱼');
    expect(rows[0].tags).toEqual(['成体 4.5cm', '≥20L', '20~28°C', 'GH 8~25', 'pH 6.8~8.5', '温和']);
  });

  it('只查名称：标签文案「群游」不作为关键词命中', () => {
    expect(fishRows(FISHES, '群游')).toEqual([]);
  });
});

describe('hardscapeRows（硬景观：仅名称包含关键词）', () => {
  it('空关键词返回全部硬景观', () => {
    expect(hardscapeRows(HARDSCAPES, '')).toHaveLength(HARDSCAPES.length);
  });

  it('按名称过滤「沉木」并拼 默认尺寸/形状/排水系数 标签', () => {
    const rows = hardscapeRows(HARDSCAPES, '沉木');
    expect(rows.map((r) => r.main)).toEqual(['曼珠沉木', '榕树根沉木']);
    expect(rows[0]).toEqual({
      main: '曼珠沉木',
      tags: ['默认 25cm', '沉木', '排水系数 0.3'],
      sub: '需沉水处理，绑莫斯效果好',
    });
  });

  it('石材形状标签为「石材」（青龙石）', () => {
    const rows = hardscapeRows(HARDSCAPES, '青龙石');
    expect(rows[0].tags).toEqual(['默认 15cm', '石材', '排水系数 0.55']);
  });

  it('只查名称：备注里的「硬水」不命中', () => {
    expect(hardscapeRows(HARDSCAPES, '硬水')).toEqual([]);
  });
});

describe('substrateRows（底砂：仅 label 包含关键词）', () => {
  it('空关键词返回全部底砂', () => {
    expect(substrateRows(SUBSTRATES, '')).toHaveLength(SUBSTRATES.length);
  });

  it('按 label 过滤并拼密度标签', () => {
    const rows = substrateRows(SUBSTRATES, 'ADA');
    expect(rows).toEqual([{ main: 'ADA 泥(亚马逊)', tags: ['密度 1.15 kg/L'], sub: '' }]);
  });

  it('只查 label：标签文案「密度」不作为关键词命中', () => {
    expect(substrateRows(SUBSTRATES, '密度')).toEqual([]);
  });
});
