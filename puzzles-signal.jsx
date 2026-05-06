/* ============================================================
   Puzzle 1: Signal Value
   ============================================================ */

(function () {
  function f(n, d) {
    return Number.isFinite(n) ? n.toFixed(d == null ? 2 : d) : '—';
  }

  const signals = [
    { id: 'routine', name: 'Routine ping', p: 0.85, interceptCost: 0.05, iceRisk: 0.05, note: 'Дешёвый heartbeat, но он почти не меняет модель.' },
    { id: 'admin', name: 'Rare admin token leak', p: 0.04, interceptCost: 0.80, iceRisk: 0.55, best: true, note: 'Редкий, сильный и ещё не самоубийственный. Лучший сигнал для взлома.' },
    { id: 'sensor', name: 'Noisy sensor burst', p: 0.12, interceptCost: 1.20, iceRisk: 1.10, note: 'Информации много, но шумный перехват дорогой и заметный.' },
    { id: 'status', name: 'Predictable status packet', p: 0.92, interceptCost: 0.03, iceRisk: 0.03, note: 'Слишком предсказуемо. Почти мёртвый сигнал.' },
    { id: 'burnice', name: 'BurnICE anomaly', p: 0.01, interceptCost: 1.40, iceRisk: 6.00, note: 'Очень редкий, но это наживка. Риск ICE съедает всю ценность.' },
    { id: 'login', name: 'User login pattern', p: 0.18, interceptCost: 0.35, iceRisk: 0.50, note: 'Неплохой рабочий след, но admin leak даёт больше полезности.' },
  ].map(s => ({ ...s, information: -Math.log2(s.p), utility: -Math.log2(s.p) - s.interceptCost - s.iceRisk }));

  function SignalValuePuzzle({ gameState, gameActions }) {
    const [picked, setPicked] = React.useState(null);
    const [resolved, setResolved] = React.useState(false);
    const hard = gameState.difficulty === 'hard';
    const pick = (signal) => {
      if (resolved) return;
      setPicked(signal);
      setResolved(true);
      if (signal.best) {
        gameActions.awardFragment('BIT', 'signal value cracked');
      } else {
        gameActions.penalty({
          heat: 15,
          trace: 10,
          integrity: hard ? 10 : 0,
          reason: `wrong signal selected :: ${signal.name}`,
        });
      }
    };
    return (
      <div className="puzzle-block">
        <StoryPanel cue="signal" />
        <div className="panel">
          <div className="panel-title">// Signal Value Puzzle <div className="bar" /></div>
          <p className="body dim">
            Выбери сигнал для netrun-операции. Сразу видны вероятность, стоимость перехвата и риск ICE.
            Итоговая полезность откроется после выбора: <span className="mono">utility = -log₂(p) - cost - risk</span>.
          </p>
          <div className="cards-row mt-4">
            {signals.map(s => {
              const cls = `signal-card ${resolved && s.best ? 'correct' : ''} ${resolved && picked && picked.id === s.id && !s.best ? 'wrong' : ''}`;
              return (
                <button key={s.id} className={cls} onClick={() => pick(s)}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="kicker">signal</span>
                    <span className="chip">p={f(s.p, 2)}</span>
                  </div>
                  <div className="title-md mt-2" style={{ color: 'var(--neon-cyan)' }}>{s.name}</div>
                  <div className="row mt-3" style={{ gap: 8 }}>
                    <span className="chip warn">cost {f(s.interceptCost)}</span>
                    <span className="chip pink">risk {f(s.iceRisk)}</span>
                  </div>
                  {resolved && (
                    <div className="body dim mt-3" style={{ fontSize: 13 }}>
                      <div className="mono" style={{ color: 'var(--neon-yellow)' }}>I = -log₂({s.p}) = {f(s.information, 3)} бит</div>
                      <div className="mono" style={{ color: s.utility > 2 ? 'var(--neon-green)' : 'var(--ink-dim)' }}>utility = {f(s.utility, 3)}</div>
                      <p>{s.note}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {resolved && (
            <div className="panel pink mt-4">
              <div className="panel-title">// debrief <div className="bar" /></div>
              <p className="body">
                Редкий сигнал несёт больше информации, потому что сильнее снижает неопределённость.
                Но в реальной ИТ-задаче одного <span className="mono">-log₂(p)</span> мало: логи, SOC-аналитика,
                ML-фичи и защитная телеметрия всегда платят ещё стоимостью сбора и риском засветиться.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  Object.assign(window, { SignalValuePuzzle });
})();
