/* ============================================================
   Puzzle 2: Entropy Lock
   ============================================================ */

(function () {
  const tasks = [
    {
      id: 'low',
      title: 'Low Entropy Stealth',
      target: 'H(X) <= 0.70 бит',
      pass: (H) => H <= 0.70,
      hint: 'Один исход должен почти всё забрать. Предсказуемый канал легче замаскировать под routine traffic.',
      preset: [0.90, 0.04, 0.03, 0.03],
    },
    {
      id: 'high',
      title: 'High Entropy Masking',
      target: 'H(X) >= 0.90 * Hmax',
      pass: (H, Hmax) => H >= 0.90 * Hmax,
      hint: 'Равномерный хаос лучше прячет отдельный payload в шуме.',
      preset: [0.25, 0.25, 0.25, 0.25],
    },
    {
      id: 'balanced',
      title: 'Balanced Channel',
      target: '1.45 <= H(X) <= 1.60',
      pass: (H) => H >= 1.45 && H <= 1.60,
      hint: 'Не максимум и не heartbeat. Нужен канал с заметным перекосом, но без полного схлопывания.',
      preset: [0.60, 0.20, 0.10, 0.10],
    },
  ];

  function f(n, d) {
    return Number.isFinite(n) ? n.toFixed(d == null ? 3 : d) : '—';
  }

  function EntropyLock({ gameState, gameActions }) {
    const hard = gameState.difficulty === 'hard';
    const limit = hard ? 60 : 90;
    const [stage, setStage] = React.useState(0);
    const [probs, setProbs] = React.useState([0.25, 0.25, 0.25, 0.25]);
    const [time, setTime] = React.useState(limit);
    const [message, setMessage] = React.useState('');
    const done = stage >= tasks.length;
    const task = tasks[Math.min(stage, tasks.length - 1)];
    const H = window.InfoTheory.entropy(probs);
    const Hmax = Math.log2(probs.length);
    const ok = task && task.pass(H, Hmax);

    React.useEffect(() => {
      if (done) return;
      setTime(limit);
      setMessage('');
    }, [stage, limit, done]);

    React.useEffect(() => {
      if (done) return;
      if (time <= 0) {
        gameActions.penalty({ heat: 20, trace: 15, integrity: hard ? 10 : 0, reason: `Entropy Lock timeout :: ${task.title}` });
        setTime(limit);
        return;
      }
      const timer = setTimeout(() => setTime(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }, [time, done, hard, limit, task.title]);

    const setProb = (i, value) => {
      const next = probs.slice();
      next[i] = Math.max(0, Math.min(1, value));
      const others = next.reduce((a, b, idx) => idx === i ? a : a + b, 0);
      const remaining = 1 - next[i];
      for (let j = 0; j < next.length; j++) {
        if (j !== i) next[j] = others > 0 ? (next[j] / others) * remaining : remaining / (next.length - 1);
      }
      setProbs(next);
    };

    const check = () => {
      if (ok) {
        if (stage + 1 >= tasks.length) {
          gameActions.awardFragment('ENTROPY', 'entropy lock opened');
          setStage(tasks.length);
        } else {
          gameActions.addLog(`✓ entropy gate passed :: ${task.title}`, 'success');
          setStage(s => s + 1);
          setProbs([0.25, 0.25, 0.25, 0.25]);
        }
      } else {
        setMessage('Lock не открылся: распределение не попало в target condition.');
        gameActions.penalty({ heat: 20, trace: 15, integrity: hard ? 10 : 0, reason: `Entropy Lock mismatch :: ${task.title}` });
      }
    };

    if (done) {
      return (
        <div className="panel greenish">
          <div className="panel-title">// Entropy Lock opened <div className="bar" /></div>
          <p className="body">
            Access Fragment <span className="mono" style={{ color: 'var(--neon-green)' }}>ENTROPY</span> cached.
            Ты показал обе стороны энтропии: предсказуемость полезна для stealth-канала, максимум хаоса — для маскировки payload.
          </p>
        </div>
      );
    }

    return (
      <div className="puzzle-block">
        <StoryPanel cue="entropy" />
        <div className="panel pink">
          <div className="panel-title">// Entropy Lock · {stage + 1}/3 <div className="bar" /></div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 className="title-md" style={{ color: 'var(--neon-pink)', margin: 0 }}>{task.title}</h3>
              <div className="mono dim mt-2">target :: {task.target}</div>
            </div>
            <span className={`chip ${time < 15 ? 'pink' : 'warn'}`}>timer {time}s</span>
          </div>
          {!hard && <p className="body dim">{task.hint}</p>}

          <div className="row mt-4" style={{ alignItems: 'flex-start' }}>
            <div className="panel" style={{ flex: '1 1 360px' }}>
              <div className="panel-title">// probability sliders <div className="bar" /></div>
              {probs.map((p, i) => (
                <div key={i} className="slider-line">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="mono dim">x{i + 1}</span>
                    <span className="mono" style={{ color: 'var(--neon-cyan)' }}>{(p * 100).toFixed(1)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={p} onChange={e => setProb(i, parseFloat(e.target.value))} />
                </div>
              ))}
              <div className="row mt-4">
                {!hard && <button className="btn ghost micro" onClick={() => setProbs(task.preset)}>load hint profile</button>}
                <button className="btn ghost micro" onClick={() => setProbs([0.25, 0.25, 0.25, 0.25])}>uniform</button>
                <button className="btn pink micro" onClick={check}>check lock</button>
              </div>
              {message && <div className="chip pink mt-3">{message}</div>}
            </div>
            <div className="panel" style={{ flex: '1 1 420px' }}>
              <div className="panel-title">// live entropy <div className="bar" /></div>
              <div className="row" style={{ gap: 12 }}>
                <div className="metric-card grow"><div className="k">H(X)</div><div className="v">{f(H)}</div></div>
                <div className="metric-card pink grow"><div className="k">Hmax</div><div className="v">{f(Hmax)}</div></div>
                <div className="metric-card green grow"><div className="k">H/Hmax</div><div className="v">{(H / Hmax * 100).toFixed(0)}%</div></div>
              </div>
              <div className={`condition-row mt-4 ${ok ? 'pass' : 'fail'}`}>
                <span>{ok ? 'PASS' : 'FAIL'}</span>
                <b>{task.target}</b>
              </div>
              <p className="body dim mt-4">
                Равномерное распределение даёт максимум энтропии: ни один исход не предсказуем лучше другого.
                Перекос снижает неопределённость, поэтому такие потоки легче сжимать и проще прогнозировать.
                В передаче данных, защите и анализе это один и тот же нерв: сколько неизвестности осталось в канале.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { EntropyLock });
})();
