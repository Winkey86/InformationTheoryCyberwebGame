/* ============================================================
   Global run state: Heat / Trace / Integrity / checkpoints
   ============================================================ */

(function () {
  const STORE_KEY = 'netrunner.echo.v2.state';
  const HERO_NAME = 'Rook';

  const defaultCompleted = { menu: false, l1: false, l2: false, l3: false, finale: false };
  const defaultState = {
    heat: 0,
    integrity: 100,
    trace: 0,
    accessFragments: [],
    checkpoint: 'BOOT',
    checkpointScreen: 'menu',
    checkpointFragments: [],
    checkpointCompleted: defaultCompleted,
    failCount: 0,
    currentMission: 'dossier',
    difficulty: 'normal',
    difficultyChosen: false,
    terminalLog: [],
    completed: defaultCompleted,
    defeated: false,
    defeatReason: '',
    storyCue: null,
    flags: { firstError: false, heat60: false },
  };

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function nowStamp() {
    const d = new Date();
    return d.toLocaleTimeString('ru-RU', { hour12: false });
  }

  function mergeState(raw) {
    return {
      ...defaultState,
      ...raw,
      completed: { ...defaultCompleted, ...(raw && raw.completed) },
      checkpointCompleted: { ...defaultCompleted, ...(raw && raw.checkpointCompleted) },
      flags: { ...defaultState.flags, ...(raw && raw.flags) },
      terminalLog: Array.isArray(raw && raw.terminalLog) ? raw.terminalLog.slice(-80) : [],
      accessFragments: Array.isArray(raw && raw.accessFragments) ? raw.accessFragments : [],
      checkpointFragments: Array.isArray(raw && raw.checkpointFragments) ? raw.checkpointFragments : [],
    };
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY));
      return mergeState(raw);
    } catch {
      return defaultState;
    }
  }

  function line(text, tone) {
    return { id: Date.now() + Math.random(), time: nowStamp(), text, tone: tone || 'info' };
  }

  function pushLog(state, text, tone) {
    return { ...state, terminalLog: [...state.terminalLog, line(text, tone)].slice(-80) };
  }

  function markDefeat(next, reason) {
    if (next.heat >= 100 || next.trace >= 100 || next.integrity <= 0) {
      const cause = reason || (next.heat >= 100 ? 'ICE Heat reached 100' : next.trace >= 100 ? 'Trace reached 100' : 'Integrity dropped to zero');
      return pushLog({ ...next, defeated: true, defeatReason: cause, storyCue: 'defeat' }, `!! ICE TRACE COMPLETE :: ${cause}`, 'danger');
    }
    return next;
  }

  function useNetrunnerGame() {
    const [gameState, setGameState] = React.useState(loadState);

    React.useEffect(() => {
      localStorage.setItem(STORE_KEY, JSON.stringify(gameState));
    }, [gameState]);

    const update = React.useCallback((fn) => {
      setGameState(prev => fn(mergeState(prev)));
    }, []);

    const actions = React.useMemo(() => ({
      setDifficulty(difficulty) {
        update(prev => pushLog({
          ...prev,
          difficulty,
          difficultyChosen: true,
          currentMission: 'dossier',
          storyCue: 'boot',
        }, `> difficulty set :: ${difficulty.toUpperCase()}`, 'success'));
      },
      setMission(mission) {
        update(prev => prev.currentMission === mission ? prev : pushLog({ ...prev, currentMission: mission }, `> route opened :: ${mission}`, 'info'));
      },
      clearStoryCue() {
        update(prev => ({ ...prev, storyCue: null }));
      },
      addLog(text, tone) {
        update(prev => pushLog(prev, text, tone));
      },
      awardFragment(fragment, note) {
        update(prev => {
          if (prev.accessFragments.includes(fragment)) {
            return pushLog(prev, `= Access Fragment ${fragment} already cached`, 'info');
          }
          return pushLog({
            ...prev,
            accessFragments: [...prev.accessFragments, fragment],
            storyCue: fragment === 'CIPHER' ? 'cipher' : 'success',
          }, `+ Access Fragment acquired :: ${fragment}${note ? ` :: ${note}` : ''}`, 'success');
        });
      },
      penalty(payload) {
        update(prev => {
          const hard = prev.difficulty === 'hard';
          const heat = payload.heat || 0;
          const trace = payload.trace || 0;
          const integrity = payload.integrity || 0;
          const nextFlags = { ...prev.flags };
          let storyCue = prev.storyCue;
          if (!nextFlags.firstError) {
            nextFlags.firstError = true;
            storyCue = 'firstError';
          }
          const next = {
            ...prev,
            heat: clamp(prev.heat + heat, 0, 100),
            trace: clamp(prev.trace + trace, 0, 100),
            integrity: clamp(prev.integrity - integrity, 0, 100),
            flags: nextFlags,
            storyCue,
          };
          if (!nextFlags.heat60 && next.heat > 60) {
            next.flags = { ...next.flags, heat60: true };
            next.storyCue = 'heat60';
          }
          const reason = payload.reason || 'bad click left a trace';
          const suffix = hard && integrity > 0 ? ' :: hardline damage confirmed' : '';
          return markDefeat(pushLog(next, `! ${reason} :: heat +${heat} trace +${trace} integrity -${integrity}${suffix}`, 'danger'), reason);
        });
      },
      normalizeNoise(note) {
        update(prev => {
          if (prev.difficulty !== 'hard') return pushLog(prev, note || '> matrix normalized', 'info');
          const next = { ...prev, trace: clamp(prev.trace + 5, 0, 100) };
          return markDefeat(pushLog(next, '! noisy recalibration :: Trace +5', 'warn'), 'Noisy recalibration exposed the matrix');
        });
      },
      completeMission(id, checkpointLabel, checkpointScreen) {
        update(prev => {
          const completed = { ...prev.completed, [id]: true };
          const next = {
            ...prev,
            completed,
            checkpoint: checkpointLabel,
            checkpointScreen,
            checkpointFragments: prev.accessFragments.slice(),
            checkpointCompleted: completed,
            heat: clamp(prev.heat - 12, 0, 100),
            trace: clamp(prev.trace - 8, 0, 100),
            storyCue: 'missionComplete',
          };
          return pushLog(next, `✓ checkpoint sealed :: ${checkpointLabel}`, 'success');
        });
      },
      restoreCheckpoint() {
        const target = gameState.checkpointScreen || 'menu';
        update(prev => pushLog({
          ...prev,
          defeated: false,
          defeatReason: '',
          heat: clamp(24 + prev.failCount * 4, 0, 62),
          trace: clamp(12 + prev.failCount * 3, 0, 54),
          integrity: clamp(Math.max(50, prev.integrity), 0, 100),
          accessFragments: prev.checkpointFragments.slice(),
          completed: { ...defaultCompleted, ...prev.checkpointCompleted },
          currentMission: prev.checkpoint,
          failCount: prev.failCount + 1,
          storyCue: 'rollback',
          flags: { ...prev.flags, firstError: true },
        }, `↺ rollback loaded :: ${prev.checkpoint}`, 'warn'));
        return target;
      },
      fullReset() {
        const fresh = mergeState({ ...defaultState, terminalLog: [line('> run reset :: clean neural buffer', 'warn')] });
        setGameState(fresh);
      },
      forceDefeat(reason) {
        update(prev => pushLog({ ...prev, defeated: true, defeatReason: reason, storyCue: 'defeat' }, `!! ICE TRACE COMPLETE :: ${reason}`, 'danger'));
      },
    }), [gameState, update]);

    return { gameState, gameActions: actions };
  }

  function DifficultyGate({ gameActions }) {
    return (
      <div className="fade-in run-gate">
        <World />
        <div className="gate-card brackets">
          <span className="br-tr" /><span className="br-bl" />
          <div className="kicker">// boot complete · operator profile</div>
          <h1 className="title-lg mt-3"><span style={{ color: 'var(--neon-cyan)' }}>Select</span> Run Difficulty</h1>
          <p className="body dim">
            Normal даёт больше подсказок и мягче штрафует. Hard режет запас по Integrity, ускоряет таймеры и делает Rollback злее.
          </p>
          <div className="difficulty-grid mt-6">
            <button className="difficulty-card" onClick={() => gameActions.setDifficulty('normal')}>
              <span className="chip green">Recommended</span>
              <b>Normal</b>
              <small>Подсказки включены · таймеры длиннее · ошибки терпимее.</small>
            </button>
            <button className="difficulty-card hard" onClick={() => gameActions.setDifficulty('hard')}>
              <span className="chip pink">Hard</span>
              <b>Hardline</b>
              <small>Меньше намёков · выше Heat/Trace · финальная ошибка откатывает глубже.</small>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function RunDock({ gameState, gameActions, setScreen }) {
    const [open, setOpen] = React.useState(false);
    const recent = gameState.terminalLog.slice(-7);
    return (
      <div className={`run-dock ${open ? 'open' : ''}`}>
        <button className="dock-toggle" onClick={() => setOpen(!open)}>{open ? 'close log' : 'run log'}</button>
        <div className="dock-body">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="kicker">run controls</span>
            <span className="chip warn">fail {gameState.failCount}</span>
          </div>
          <div className="row mt-3">
            <button className="btn ghost micro" onClick={() => gameActions.fullReset()}>Reset Run</button>
            <button className="btn ghost micro" onClick={() => setScreen(gameActions.restoreCheckpoint())}>Restore Checkpoint</button>
          </div>
          <div className="terminal compact mt-3">
            {recent.length ? recent.map(e => `[${e.time}] ${e.text}`).join('\n') : '> terminal idle'}
            <span className="cursor" />
          </div>
        </div>
      </div>
    );
  }

  function DefeatScreen({ gameState, gameActions, setScreen }) {
    return (
      <div className="defeat-screen">
        <div className="defeat-static" />
        <div className="defeat-card brackets">
          <span className="br-tr" /><span className="br-bl" />
          <div className="kicker">BurnICE / terminal breach</div>
          <h1 className="title-xl glitch" data-text="ICE TRACE COMPLETE">ICE TRACE COMPLETE</h1>
          <p className="body">
            Connection burned. {gameState.defeatReason || 'Trace замкнулся на физический канал.'}
          </p>
          <div className="terminal mt-4">
            {gameState.terminalLog.slice(-10).map(e => `[${e.time}] ${e.text}`).join('\n')}
            <span className="cursor" />
          </div>
          <div className="row mt-6">
            <button className="btn pink" onClick={() => setScreen(gameActions.restoreCheckpoint())}>Restore from checkpoint</button>
            <button className="btn ghost" onClick={() => gameActions.fullReset()}>Full reset</button>
          </div>
        </div>
      </div>
    );
  }

  function GlobalStoryPulse({ gameState, gameActions }) {
    if (!gameState.storyCue) return null;
    const cueMap = {
      boot: ['Focused', 'Лёд в ванной уже кусает кожу. Хорошо. Значит, линия держится.'],
      firstError: ['Nervous', 'Ошибка — это не просто минус балл. В DeepGrid ошибка оставляет след.'],
      heat60: ['Overheated', 'Trace растёт. Ещё один тупой клик — и BurnICE найдёт моё тело раньше, чем я найду Core.'],
      rollback: ['Calm', `Rollback к checkpoint ${gameState.checkpoint}. Я уже видел этот коридор. Теперь он увидит меня.`],
      missionComplete: ['Focused', 'Checkpoint sealed. Город делает вид, что ничего не произошло. Милый город.'],
      success: ['Breach Mode', 'Access Fragment вошёл в кэш. KuroData прячет не данные, а связи между ними.'],
      cipher: ['Breach Mode', 'CBC, random IV, EDE. Без этого ICE увидит паттерн и сожжёт туннель.'],
      defeat: ['Overheated', 'Канал горит. Не геройствуй, Rook. Rollback — это тоже инструмент.'],
    };
    const [status, text] = cueMap[gameState.storyCue] || cueMap.success;
    return (
      <div className="story-toast">
        <StoryPanel status={status} text={text} compact />
        <button className="btn ghost micro" onClick={() => gameActions.clearStoryCue()}>sync</button>
      </div>
    );
  }

  Object.assign(window, {
    HERO_NAME,
    useNetrunnerGame,
    DifficultyGate,
    RunDock,
    DefeatScreen,
    GlobalStoryPulse,
  });
})();
