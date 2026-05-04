/* ============================================================
   УРОВЕНЬ 2 — Решётка взаимности
   Совместная матрица → H(X), H(Y), H(X,Y), I(X;Y)
   ============================================================ */

const PRESETS = {
  independent: {
    label: 'НЕЗАВИСИМЫЕ (I≈0)',
    note: 'X и Y не связаны — знание X не говорит ничего про Y.',
    rows: ['x₁','x₂'], cols: ['y₁','y₂'],
    M: [[0.25, 0.25],[0.25, 0.25]],
  },
  perfect: {
    label: 'ИДЕАЛЬНАЯ СВЯЗЬ (I = H)',
    note: 'Y = X. Это одна и та же система. Максимальная зависимость.',
    rows: ['x₁','x₂','x₃'], cols: ['y₁','y₂','y₃'],
    M: [[1/3, 0, 0],[0, 1/3, 0],[0, 0, 1/3]],
  },
  weak: {
    label: 'СЛАБАЯ СВЯЗЬ',
    note: 'Утечки немного — X отчасти предсказывает Y.',
    rows: ['x₁','x₂'], cols: ['y₁','y₂'],
    M: [[0.4, 0.1],[0.15, 0.35]],
  },
  surveillance: {
    label: 'СЕТКА KRONOS · 4×4',
    note: 'Сетка камер vs движение горожан. Перевес по диагонали — значит, тебя могут отследить.',
    rows: ['кам_a','кам_b','кам_c','кам_d'], cols: ['зона₁','зона₂','зона₃','зона₄'],
    M: [
      [0.12, 0.04, 0.02, 0.01],
      [0.03, 0.15, 0.03, 0.01],
      [0.02, 0.04, 0.16, 0.03],
      [0.01, 0.02, 0.04, 0.27],
    ],
  },
  noisy: {
    label: 'ШУМНЫЙ КАНАЛ (3×3)',
    note: 'Сигнал, прошедший через шумный провод — сильная, но не идеальная связь.',
    rows: ['s=A','s=B','s=C'], cols: ['r=A','r=B','r=C'],
    M: [
      [0.28, 0.04, 0.02],
      [0.03, 0.27, 0.04],
      [0.02, 0.03, 0.27],
    ],
  },
};

function deepCopy(P) { return P.map(r => r.slice()); }

function VennDiagram({ Hx, Hy, I }) {
  const w = 460, h = 240;
  const cx1 = 170, cx2 = 290, cy = 120;
  const r1 = 90, r2 = 90;
  return (
    <svg className="venn" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <radialGradient id="gA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(5,217,255,0.45)"/>
          <stop offset="100%" stopColor="rgba(5,217,255,0)"/>
        </radialGradient>
        <radialGradient id="gB" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,42,109,0.45)"/>
          <stop offset="100%" stopColor="rgba(255,42,109,0)"/>
        </radialGradient>
      </defs>
      <circle cx={cx1} cy={cy} r={r1} fill="url(#gA)" stroke="var(--neon-cyan)" strokeOpacity="0.7"/>
      <circle cx={cx2} cy={cy} r={r2} fill="url(#gB)" stroke="var(--neon-pink)" strokeOpacity="0.7"/>
      <text x={cx1 - 35} y={cy + 5} fill="var(--neon-cyan)" fontFamily="var(--mono)" fontSize="11" textAnchor="middle">
        H(X|Y) = {(Hx - I).toFixed(2)}
      </text>
      <text x={(cx1 + cx2)/2} y={cy + 5} fill="var(--neon-yellow)" fontFamily="var(--mono)" fontSize="13" textAnchor="middle">
        I = {I.toFixed(3)}
      </text>
      <text x={cx2 + 35} y={cy + 5} fill="var(--neon-pink)" fontFamily="var(--mono)" fontSize="11" textAnchor="middle">
        H(Y|X) = {(Hy - I).toFixed(2)}
      </text>
      <text x={cx1 - 60} y={cy - r1 - 8} fill="var(--neon-cyan)" fontFamily="var(--mono)" fontSize="11" textAnchor="middle">
        H(X) = {Hx.toFixed(2)}
      </text>
      <text x={cx2 + 60} y={cy - r2 - 8} fill="var(--neon-pink)" fontFamily="var(--mono)" fontSize="11" textAnchor="middle">
        H(Y) = {Hy.toFixed(2)}
      </text>
    </svg>
  );
}

function HeatCell({ p, max, onChange }) {
  const t = max > 0 ? p / max : 0;
  const bg = t === 0 ? 'transparent'
    : t < 0.33 ? `rgba(33, 72, 255, ${0.3 + t})`
    : t < 0.66 ? `rgba(211, 0, 197, ${0.4 + t * 0.5})`
    : `rgba(255, 42, 109, ${0.5 + t * 0.5})`;
  return (
    <td className="heat" style={{background: bg}}>
      <input type="number" min="0" step="0.01" value={p} onChange={onChange} />
    </td>
  );
}

function MatrixEditor({ rows, cols, M, setM, setRows, setCols }) {
  const max = Math.max(...M.flat(), 0.0001);
  const total = M.flat().reduce((a, b) => a + b, 0);
  const updateCell = (i, j, v) => {
    const next = deepCopy(M);
    next[i][j] = isNaN(v) ? 0 : Math.max(0, v);
    setM(next);
  };
  const normalize = () => {
    const t = M.flat().reduce((a, b) => a + b, 0);
    if (t <= 0) return;
    setM(M.map(row => row.map(v => v / t)));
  };
  const resize = (nr, nc) => {
    const next = Array.from({length: nr}, (_, i) =>
      Array.from({length: nc}, (_, j) => (M[i] && M[i][j] != null) ? M[i][j] : 0)
    );
    setM(next);
    setRows(Array.from({length: nr}, (_, i) => 'x' + (i+1)));
    setCols(Array.from({length: nc}, (_, j) => 'y' + (j+1)));
  };
  return (
    <div>
      <div className="row mb-3" style={{justifyContent: 'space-between'}}>
        <span className="mono dim" style={{fontSize: 11}}>
          строк · n = {M.length} &nbsp;|&nbsp; столбцов · m = {M[0]?.length || 0} &nbsp;|&nbsp; Σ = {total.toFixed(3)}
        </span>
        <span className="row" style={{gap: 6}}>
          <button className="btn ghost" style={{padding:'4px 10px', fontSize: 11}} onClick={() => resize(M.length+1, M[0].length)}>+ строка</button>
          <button className="btn ghost" style={{padding:'4px 10px', fontSize: 11}} onClick={() => M.length > 2 && resize(M.length-1, M[0].length)}>− строка</button>
          <button className="btn ghost" style={{padding:'4px 10px', fontSize: 11}} onClick={() => resize(M.length, M[0].length+1)}>+ столбец</button>
          <button className="btn ghost" style={{padding:'4px 10px', fontSize: 11}} onClick={() => M[0].length > 2 && resize(M.length, M[0].length-1)}>− столбец</button>
          <button className="btn ghost" style={{padding:'4px 10px', fontSize: 11}} onClick={normalize}>нормализовать</button>
        </span>
      </div>
      <div style={{overflow:'auto'}}>
        <table className="matrix">
          <thead>
            <tr>
              <th></th>
              {cols.map((c, j) => <th key={j}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {M.map((row, i) => (
              <tr key={i}>
                <th>{rows[i]}</th>
                {row.map((p, j) => (
                  <HeatCell key={j} p={p} max={max}
                    onChange={(e) => updateCell(i, j, parseFloat(e.target.value))} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row mt-3" style={{gap: 14}}>
        <span className="legend"><span style={{color:'var(--ink-dim)'}}>p =</span> 0 <span className="swatch"/> высокая</span>
      </div>
    </div>
  );
}

function MarginalsBar({ probs, color }) {
  const c = color === 'pink' ? 'var(--neon-pink)' : 'var(--neon-cyan)';
  return (
    <div className="row" style={{gap: 6, alignItems: 'flex-end', height: 80}}>
      {probs.map((p, i) => (
        <div key={i} style={{flex: 1, textAlign: 'center'}}>
          <div style={{
            width: '100%',
            height: (p * 70) + 'px',
            minHeight: 1,
            background: c,
            opacity: 0.3 + p * 0.7,
            boxShadow: `0 0 8px ${c}`,
            transition: 'height 0.3s'
          }}/>
          <div className="mono" style={{fontSize: 9, color: 'var(--ink-faint)', marginTop: 4}}>
            {p.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Level2({ onComplete }) {
  const [presetId, setPresetId] = useState('weak');
  const preset = PRESETS[presetId];
  const [M, setM] = useState(deepCopy(preset.M));
  const [rows, setRows] = useState(preset.rows.slice());
  const [cols, setCols] = useState(preset.cols.slice());

  const loadPreset = (id) => {
    setPresetId(id);
    const p = PRESETS[id];
    setM(deepCopy(p.M));
    setRows(p.rows.slice());
    setCols(p.cols.slice());
  };

  const stats = useMemo(() => window.InfoTheory.mutualInformation(M), [M]);
  const verdict = (() => {
    if (stats.NMI > 0.7) return { txt: 'СИСТЕМЫ ПЕРЕПЛЕТЕНЫ · X ПРЕДСКАЗЫВАЕТ Y', cls: 'pink' };
    if (stats.NMI > 0.3) return { txt: 'ЗАМЕТНАЯ СВЯЗЬ · ОТСЛЕЖИВАЕМО',           cls: 'warn' };
    if (stats.NMI > 0.05) return { txt: 'СЛАБАЯ ЗАВИСИМОСТЬ',                       cls: '' };
    return { txt: 'ПО СУТИ НЕЗАВИСИМЫ', cls: 'green' };
  })();

  return (
    <div className="fade-in" style={{padding: '32px 64px 64px', maxWidth: 1280, margin: '0 auto'}}>
      <div className="row mb-2" style={{justifyContent:'space-between'}}>
        <div>
          <div className="kicker">ОП-02 · ДАТА-ЭТАЖ</div>
          <h1 className="title-lg" style={{color:'var(--neon-pink)', marginTop: 8}}>РЕШЁТКА ВЗАИМНОСТИ</h1>
        </div>
        <span className="chip pink">ПОЛНАЯ ВЗАИМНАЯ ИНФОРМАЦИЯ</span>
      </div>
      <p className="body dim" style={{maxWidth: 760}}>
        Подай в решётку матрицу совместных вероятностей <span className="mono">P(X, Y)</span>. Она вернёт
        H(X), H(Y), H(X,Y) и I(X;Y) в реальном времени. Чем больше I — тем плотнее связь — тем легче отследить.
      </p>

      <div className="row mt-6" style={{gap: 24, alignItems: 'flex-start'}}>
        <div style={{flex: '1 1 540px', minWidth: 420}}>
          <div className="panel pink">
            <div className="panel-title">// матрица совместных вероятностей p(x, y) <div className="bar"/></div>
            <div className="row mb-3" style={{flexWrap:'wrap', gap: 6}}>
              {Object.entries(PRESETS).map(([id, p]) => (
                <button key={id} className={`btn ghost`} onClick={() => loadPreset(id)}
                  style={{padding:'4px 10px', fontSize: 10, ...(presetId === id ? {background:'var(--neon-pink)', color:'#000', borderColor:'var(--neon-pink)'} : {})}}>
                  {p.label}
                </button>
              ))}
            </div>
            <p className="body dim mb-3" style={{fontSize: 12}}>{preset.note}</p>
            <MatrixEditor rows={rows} cols={cols} M={M} setM={setM} setRows={setRows} setCols={setCols} />

            <div className="row mt-6" style={{gap: 24}}>
              <div style={{flex: 1}}>
                <div className="label">маргинальная p(X)</div>
                <MarginalsBar probs={stats.px} color="cyan" />
              </div>
              <div style={{flex: 1}}>
                <div className="label">маргинальная p(Y)</div>
                <MarginalsBar probs={stats.py} color="pink" />
              </div>
            </div>
          </div>
        </div>

        <div style={{flex: '1 1 480px', minWidth: 380}}>
          <div className="panel">
            <div className="panel-title">// метрики<div className="bar"/></div>
            <div className="row" style={{gap: 12, flexWrap: 'wrap'}}>
              <div className="metric-card grow"><div className="k">H(X)</div><div className="v">{stats.Hx.toFixed(3)}</div></div>
              <div className="metric-card pink grow"><div className="k">H(Y)</div><div className="v">{stats.Hy.toFixed(3)}</div></div>
              <div className="metric-card grow"><div className="k">H(X,Y)</div><div className="v">{stats.Hxy.toFixed(3)}</div></div>
              <div className="metric-card green grow" style={{flex: '1 1 100%'}}>
                <div className="k">I(X ; Y) — полная взаимная информация</div>
                <div className="v" style={{fontSize: 36}}>{stats.I.toFixed(4)} <span style={{fontSize: 14, color:'var(--ink-dim)'}}>бит</span></div>
                <div className="mono dim" style={{fontSize: 10, marginTop: 4}}>= H(X) + H(Y) − H(X,Y)</div>
              </div>
              <div className="metric-card grow"><div className="k">H(X | Y)</div><div className="v">{stats.Hx_y.toFixed(3)}</div></div>
              <div className="metric-card pink grow"><div className="k">H(Y | X)</div><div className="v">{stats.Hy_x.toFixed(3)}</div></div>
              <div className="metric-card grow"><div className="k">НОРМ. MI</div><div className="v">{(stats.NMI * 100).toFixed(1)}%</div></div>
            </div>
            <div className={`chip ${verdict.cls} mt-4`} style={{display:'block', textAlign:'center', padding: '8px 12px'}}>
              ⚠ {verdict.txt}
            </div>
          </div>

          <div className="panel mt-4">
            <div className="panel-title">// диаграмма Венна — бюджет энтропии<div className="bar"/></div>
            <div style={{display:'flex', justifyContent:'center'}}>
              <VennDiagram Hx={stats.Hx} Hy={stats.Hy} I={stats.I} />
            </div>
            <p className="body dim" style={{fontSize: 12, marginTop: 12}}>
              Пересечение — это общие биты X и Y. Когда они независимы, круги едва касаются (I ≈ 0).
              Когда Y — копия X, круги сливаются (I = H).
            </p>
          </div>
        </div>
      </div>

      <div className="panel mt-6">
        <div className="panel-title">// формулы<div className="bar"/></div>
        <div className="row" style={{gap: 24, flexWrap: 'wrap'}}>
          <div className="mono" style={{fontSize: 13, color:'var(--neon-cyan)'}}>H(X) = −Σᵢ p(xᵢ) · log₂ p(xᵢ)</div>
          <div className="mono" style={{fontSize: 13, color:'var(--neon-pink)'}}>H(Y) = −Σⱼ p(yⱼ) · log₂ p(yⱼ)</div>
          <div className="mono" style={{fontSize: 13, color:'var(--ink)'}}>H(X,Y) = −Σᵢⱼ p(xᵢ,yⱼ) · log₂ p(xᵢ,yⱼ)</div>
          <div className="mono" style={{fontSize: 13, color:'var(--neon-green)'}}>I(X;Y) = ΣᵢΣⱼ p(xᵢ,yⱼ) · log₂ ( p(xᵢ,yⱼ) / [p(xᵢ)·p(yⱼ)] )</div>
        </div>
      </div>

      <div className="row mt-6" style={{justifyContent:'space-between', borderTop:'1px solid rgba(5,217,255,0.12)', paddingTop: 24}}>
        <div className="mono dim" style={{fontSize: 11}}>
          живой расчёт · нормализация по запросу · поддержка произвольных матриц
        </div>
        <button className="btn pink" onClick={onComplete}>▸ отметить ОП-02 выполненным</button>
      </div>
    </div>
  );
}

window.Level2 = Level2;
