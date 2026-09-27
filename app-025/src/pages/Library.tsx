import { useMemo, useState } from 'react';
import { PLANTS, FISHES, HARDSCAPES, SUBSTRATES } from '../data/db';
import { fishRows, hardscapeRows, plantRows, substrateRows, type LibraryRow } from '../core/library';

type Tab = 'plant' | 'fish' | 'hardscape' | 'substrate';

export default function Library() {
  const [tab, setTab] = useState<Tab>('plant');
  const [q, setQ] = useState('');

  // 页面只负责选页签与收搜索词；过滤与标签拼装见 src/core/library.ts 纯函数
  const rows: LibraryRow[] = useMemo(() => {
    if (tab === 'plant') return plantRows(PLANTS, q);
    if (tab === 'fish') return fishRows(FISHES, q);
    if (tab === 'hardscape') return hardscapeRows(HARDSCAPES, q);
    return substrateRows(SUBSTRATES, q);
  }, [tab, q]);

  return (
    <div className="page" data-testid="library">
      <h1>素材库（水草 / 鱼种 / 硬景观 / 底砂）</h1>
      <div className="row" style={{ marginBottom: 12 }}>
        {(
          [
            ['plant', '水草'],
            ['fish', '鱼种'],
            ['hardscape', '硬景观'],
            ['substrate', '底砂'],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            className={`btn ${tab === k ? 'primary' : ''}`}
            data-testid={`tab-${k}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
        <input
          data-testid="library-search"
          placeholder="搜索…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <table className="table" data-testid="library-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>参数</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.main}</td>
              <td>
                {r.tags.map((t, j) => (
                  <span className="tag" key={j}>
                    {t}
                  </span>
                ))}
              </td>
              <td className="muted">{r.sub}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">共 {rows.length} 条记录。数据库随包发布（src/data/*.json）。</p>
    </div>
  );
}
