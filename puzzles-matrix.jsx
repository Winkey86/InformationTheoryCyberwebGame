/* ============================================================
   Puzzle 3: Matrix Breach
   ============================================================ */

(function () {
  function clone(P) {
    return P.map(r => r.slice());
  }

  function f(n, d) {
    return Number.isFinite(n) ? n.toFixed(d == null ? 3 : d) : '—';
  }

  const solution4 = Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => i === j ? 0.215 : 0.011667)
  );

  const stages = [
    {
      title: 'Этап 1 / сигнальный шлюз',
      size: 2,
      matrix: [[0.25, 0.25], [0.25, 0.25]],
      solution: [[0.40, 0.10], [0.10, 0.40]],
      conditions: [
        {
          label: 'sum(P) = 1',
          explain: 'Матрица должна быть распределением вероятностей: сумма всех ячеек P(x,y) равна 1.',
          test: (P, s) => Math.abs(P.flat().reduce((a, b) => a + b, 0) - 1) < 0.01,
        },
        {
          label: '0.15 <= I(X;Y) <= 0.35',
          explain: 'I = H(X)+H(Y)-H(X,Y). Нужна умеренная связь: диагональ сильнее фона, но не идеальная копия.',
          test: (P, s) => s.I >= 0.15 && s.I <= 0.35,
        },
        {
          label: 'H(X) >= 0.8',
          explain: 'H(X) считается по суммам строк. X не должен схлопнуться в один почти неизбежный сигнал.',
          test: (P, s) => s.Hx >= 0.8,
        },
        {
          label: 'H(Y) >= 0.8',
          explain: 'H(Y) считается по суммам столбцов. Реакции Y должны оставаться достаточно разнообразными.',
          test: (P, s) => s.Hy >= 0.8,
        },
      ],
    },
    {
      title: 'Этап 2 / решётка отклика',
      size: 3,
      matrix: [[0.20, 0.08, 0.04], [0.08, 0.20, 0.04], [0.04, 0.04, 0.32]],
      solution: [[0.24, 0.04, 0.04], [0.04, 0.24, 0.04], [0.04, 0.04, 0.28]],
      conditions: [
        {
          label: 'sum(P) = 1',
          explain: 'Все совместные вероятности должны складываться в 1. Если сумма ушла, нажми normalize.',
          test: (P) => Math.abs(P.flat().reduce((a, b) => a + b, 0) - 1) < 0.01,
        },
        {
          label: '0.35 <= I(X;Y) <= 0.65',
          explain: 'Связь должна быть заметной: знание X уже помогает предсказать Y, но зависимость ещё не абсолютная.',
          test: (P, s) => s.I >= 0.35 && s.I <= 0.65,
        },
        {
          label: 'H(X) >= 1.2',
          explain: 'Для трёх строк максимум log₂3≈1.585. Нужно сохранить несколько вероятных состояний X.',
          test: (P, s) => s.Hx >= 1.2,
        },
        {
          label: 'H(Y) >= 1.2',
          explain: 'Для трёх столбцов максимум log₂3≈1.585. Y тоже не должен стать почти постоянным.',
          test: (P, s) => s.Hy >= 1.2,
        },
        {
          label: 'max cell <= 0.35',
          explain: 'Ни одна ячейка не должна забрать слишком много массы, иначе связь выглядит как грубый след.',
          test: (P) => Math.max(...P.flat()) <= 0.35,
        },
      ],
    },
    {
      title: 'Этап 3 / повреждённая карта Core',
      size: 4,
      matrix: [[0.215, 0.011667, 0.02, 0.02], [0.011667, 0.215, 0.02, 0.02], [0.02, 0.02, 0.215, 0.011667], [0.02, 0.02, 0.011667, 0.215]],
      solution: solution4,
      locked: [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]],
      conditions: [
        {
          label: 'sum(P) = 1',
          explain: 'Даже с заблокированными ячейками матрица остаётся одним распределением вероятностей.',
          test: (P) => Math.abs(P.flat().reduce((a, b) => a + b, 0) - 1) < 0.01,
        },
        {
          label: '0.45 <= NMI <= 0.75',
          explain: 'NMI = 2I/(H(X)+H(Y)). Это доля общей информации: связь нужна сильная, но не стопроцентная.',
          test: (P, s) => s.NMI >= 0.45 && s.NMI <= 0.75,
        },
        {
          label: 'H(X|Y) <= 0.9',
          explain: 'H(X|Y)=H(X,Y)-H(Y). После знания Y неопределённость по X должна заметно уменьшиться.',
          test: (P, s) => s.Hx_y <= 0.9,
        },
        {
          label: 'H(Y|X) <= 0.9',
          explain: 'H(Y|X)=H(X,Y)-H(X). После знания X реакция Y должна быть достаточно предсказуемой.',
          test: (P, s) => s.Hy_x <= 0.9,
        },
      ],
    },
  ];

  function MatrixGrid({ stage, M, setM }) {
    const max = Math.max(...M.flat(), 0.001);
    const locked = stage.locked || [];
    const update = (i, j, value) => {
      if (locked[i] && locked[i][j]) return;
      const next = clone(M);
      next[i][j] = Math.max(0, Number.isFinite(value) ? value : 0);
      setM(next);
    };
    return (
      <table className="matrix breach-matrix">
        <thead>
          <tr>
            <th></th>
            {M[0].map((_, j) => <th key={j}>y{j + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {M.map((row, i) => (
            <tr key={i}>
              <th>x{i + 1}</th>
              {row.map((p, j) => {
                const t = p / max;
                const lock = locked[i] && locked[i][j];
                return (
                  <td key={j} className={`heat ${lock ? 'locked' : ''}`} style={{ background: `rgba(5,217,255,${0.06 + t * 0.25})` }}>
                    <input type="number" min="0" step="0.001" value={f(p)} disabled={!!lock} onChange={e => update(i, j, parseFloat(e.target.value))} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function MatrixBreachPuzzle({ gameState, gameActions }) {
    const hard = gameState.difficulty === 'hard';
    const [idx, setIdx] = React.useState(0);
    const [M, setM] = React.useState(clone(stages[0].matrix));
    const [note, setNote] = React.useState('');
    const done = idx >= stages.length;
    const stage = stages[Math.min(idx, stages.length - 1)];
    const stats = React.useMemo(() => window.InfoTheory.mutualInformation(M), [M]);
    const checks = stage.conditions.map(c => ({ ...c, pass: c.test(M, stats) }));
    const allPass = checks.every(c => c.pass);
    const total = M.flat().reduce((a, b) => a + b, 0);

    const normalize = () => {
      const t = total;
      if (t <= 0) return;
      setM(M.map(row => row.map(v => v / t)));
      gameActions.normalizeNoise('> matrix normalized');
    };

    const verify = () => {
      if (Math.abs(total - 1) > 0.05) {
        setNote('Матрица отклонена: сумма вероятностей слишком далеко от 1.');
        gameActions.penalty({ heat: 15, trace: 0, integrity: 0, reason: 'invalid matrix submitted' });
        return;
      }
      if (!allPass) {
        setNote('Взлом не проходит: не все условия выполнены.');
        gameActions.penalty({ heat: 10, trace: 0, integrity: 0, reason: `Matrix Breach check failed :: ${stage.title}` });
        return;
      }
      if (idx + 1 >= stages.length) {
        gameActions.awardFragment('MUTUAL', 'matrix breach solved');
        setIdx(stages.length);
      } else {
        gameActions.addLog(`✓ matrix condition passed :: ${stage.title}`, 'success');
        const nextIdx = idx + 1;
        setIdx(nextIdx);
        setM(clone(stages[nextIdx].matrix));
        setNote('');
      }
    };

    if (done) {
      return (
        <div className="panel pink">
          <div className="panel-title">// Matrix Breach complete <div className="bar" /></div>
          <p className="body">
            Access Fragment <span className="mono" style={{ color: 'var(--neon-pink)' }}>MUTUAL</span> cached.
            Теперь Core видит не отдельные события, а связь между сигналом X и реакцией Y.
          </p>
        </div>
      );
    }

    return (
      <div className="puzzle-block">
        <StoryPanel cue="l2" />
        <div className="panel pink">
          <div className="panel-title">// Matrix Breach <div className="bar" /></div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 className="title-md" style={{ color: 'var(--neon-pink)', margin: 0 }}>{stage.title}</h3>
              <p className="body dim" style={{ marginBottom: 0 }}>
                X — наблюдаемый сигнал. Y — реакция защитного контура. Нужна сильная связь, но без сигнала тревоги в SOC.
              </p>
            </div>
            <span className="chip">stage {idx + 1}/3</span>
          </div>
          <div className="row mt-4" style={{ alignItems: 'flex-start' }}>
            <div className="panel" style={{ flex: '1 1 520px', overflow: 'auto' }}>
              <div className="panel-title">// editable P(X,Y) <div className="bar" /></div>
              <MatrixGrid stage={stage} M={M} setM={setM} />
              <div className="row mt-4">
                <button className="btn ghost micro" onClick={normalize}>normalize</button>
                {!hard && <button className="btn ghost micro" onClick={() => setM(clone(stage.solution))}>load ghost trace</button>}
                <button className="btn pink micro" onClick={verify}>verify breach</button>
              </div>
              {note && <div className="chip pink mt-3">{note}</div>}
            </div>
            <div className="panel" style={{ flex: '1 1 440px' }}>
              <div className="panel-title">// live calculation <div className="bar" /></div>
              <div className="row" style={{ gap: 12 }}>
                <div className="metric-card grow"><div className="k">sum(P)</div><div className="v">{f(total)}</div></div>
                <div className="metric-card pink grow"><div className="k">I(X;Y)</div><div className="v">{f(stats.I)}</div></div>
                <div className="metric-card grow"><div className="k">NMI</div><div className="v">{(stats.NMI * 100).toFixed(1)}%</div></div>
                <div className="metric-card grow"><div className="k">H(X|Y)</div><div className="v">{f(stats.Hx_y)}</div></div>
                <div className="metric-card pink grow"><div className="k">H(Y|X)</div><div className="v">{f(stats.Hy_x)}</div></div>
              </div>
              <div className="condition-list mt-4">
                {checks.map(c => (
                  <div key={c.label} className={`condition-row ${c.pass ? 'pass' : 'fail'}`}>
                    <span>{c.pass ? 'PASS' : 'FAIL'}</span>
                    <div>
                      <b>{c.label}</b>
                      <small>{c.explain}</small>
                    </div>
                  </div>
                ))}
              </div>
              <p className="body dim mt-4">
                Как решать: усиливай диагональ, чтобы X чаще совпадал с Y, — так растёт I(X;Y).
                Если энтропии H(X) или H(Y) падают, распредели массу по строкам и столбцам ровнее.
                Если связь слишком сильная или одна ячейка слишком большая, верни часть массы в соседние ячейки.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { MatrixBreachPuzzle });
})();
