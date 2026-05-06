/* ============================================================
   Главное меню + финал + брифинги уровней
   ============================================================ */

function MainMenu({ setScreen, completed, gameState, gameActions }) {
  const ops = [
    { id: 'l1', code: 'ОП-01', name: 'Колыбель Шеннона', sub: 'Количество информации', color: 'cyan',
      brief: 'Signal Value и Entropy Lock. Учись выбирать сигналы, которые действительно уменьшают неопределённость, а не просто шумят.'},
    { id: 'l2', code: 'ОП-02', name: 'Решётка взаимности', sub: 'Анализ совместных вероятностей', color: 'pink',
      brief: 'Matrix Breach и живой калькулятор. Собери P(X,Y), где связь достаточно сильна, но не бросается в глаза защитному контуру.'},
    { id: 'l3', code: 'ОП-03', name: 'Лом Чёрного Льда', sub: '3DES — шифрование / дешифрование / взлом', color: 'green',
      brief: 'Cipher Tunnel Assembly и шифроядро 3DES: EDE, CBC, IV, файлы и демонстрация перебора.'},
  ];
  return (
    <div className="fade-in" style={{padding: '40px 64px 64px', maxWidth: 1280, margin: '0 auto'}}>
      <div className="kicker fade-in">// досье · 480.221.07</div>
      <h1 className="title-xl fade-in d1" style={{marginTop: 12, marginBottom: 8}}>
        <span className="glitch" data-text="ЭХО">ЭХО</span>
        <br/>
        <span style={{color:'var(--neon-pink)', textShadow:'0 0 24px rgba(255,42,109,0.6)'}}>ИНФОРМАЦИИ</span>
      </h1>
      <div className="row fade-in d2" style={{marginTop: 12, marginBottom: 28}}>
        <span className="chip">НЕТРАННЕР · {window.HERO_NAME || 'Johnny'}</span>
        <span className="chip pink">ЦЕЛЬ · SHENTECH</span>
        <span className="chip green">ГОРОД · MIDNIGHT CITY</span>
        <span className="chip warn">DIFFICULTY · {gameState.difficulty.toUpperCase()}</span>
      </div>
      <StoryPanel cue="boot" />

      <div className="brackets panel fade-in d3" style={{maxWidth: 760, marginBottom: 32}}>
        <span className="br-tr" /><span className="br-bl" />
        <div className="panel-title">// перехват трансляции <div className="bar" /></div>
        <p className="body" style={{margin:0}}>
          Корпорация ShenTech построила скайлайн из чужих секретов. Каждый билборд, каждый чёрнорыночный киоск,
          каждая костно-проводная реклама в Midnight City питается украденными данными.
          Сегодня Johnny уходит под кожу города, чтобы добыть <b style={{color:'var(--neon-cyan)'}}>Ключ Информации</b>{' '}
          — алгоритм, который решает, какие биты станут видимыми.
        </p>
        <p className="body mono dim" style={{margin: '14px 0 0', fontSize: 12, letterSpacing: '0.05em'}}>
          три операции. три замка. один позывной.
        </p>
      </div>

      <div className="cards-row fade-in d4" style={{maxWidth: 1100}}>
        {ops.map(op => (
          <div key={op.id} className="signal-card" onClick={() => setScreen(op.id)} style={{padding: 22, cursor: 'pointer'}}>
            <div className="row" style={{justifyContent: 'space-between'}}>
              <span className={`chip ${op.color === 'pink' ? 'pink' : op.color === 'green' ? 'green' : ''}`}>{op.code}</span>
              {completed[op.id] && <span className="chip green">✓ ВЫПОЛНЕНО</span>}
            </div>
            <div className="title-md" style={{marginTop: 14, color: op.color === 'cyan' ? 'var(--neon-cyan)' : op.color === 'pink' ? 'var(--neon-pink)' : 'var(--neon-green)'}}>
              {op.name}
            </div>
            <div className="kicker" style={{color: 'var(--ink-dim)', marginTop: 4, fontSize: 10}}>{op.sub}</div>
            <p className="body dim" style={{fontSize: 14, marginTop: 12, marginBottom: 18}}>{op.brief}</p>
            <div className="btn ghost" style={{padding: '6px 12px'}}>
              ▸ Начать операцию
            </div>
          </div>
        ))}
      </div>
      <div className="row mt-6">
        <button className="btn ghost" onClick={() => gameActions.fullReset()}>Reset Run</button>
        <button className="btn ghost" onClick={() => setScreen(gameActions.restoreCheckpoint())}>Restore Checkpoint</button>
      </div>
    </div>
  );
}

function Finale({ completed, setScreen, gameState, gameActions }) {
  const allDone = completed.l1 && completed.l2 && completed.l3;
  return (
    <div className="fade-in" style={{padding: '40px 64px 64px', maxWidth: 1100, margin: '0 auto'}}>
      <div className="kicker">// Obsidian Core · финальная трансляция</div>
      <h1 className="title-xl" style={{marginTop: 12, marginBottom: 24}}>
        {allDone ? (
          <><span style={{color:'var(--neon-green)'}}>OBSIDIAN</span> BREACH</>
        ) : (
          <><span style={{color:'var(--neon-yellow)'}}>ОЖИ</span>ДАНИЕ</>
        )}
      </h1>

      {!allDone ? (
          <div className="panel" style={{maxWidth: 720}}>
            <div className="panel-title">// статус <div className="bar"/></div>
            <p className="body">
            Нужно закрыть три операции как checkpoints. Core также проверяет Access Fragments: BIT, ENTROPY, MUTUAL, CIPHER.
          </p>
          <ul className="body mono" style={{fontSize: 13, lineHeight: 2, listStyle: 'none', padding: 0}}>
            <li>{completed.l1 ? '✓ ' : '☐ '} ОП-01 :: Колыбель Шеннона</li>
            <li>{completed.l2 ? '✓ ' : '☐ '} ОП-02 :: Решётка взаимности</li>
            <li>{completed.l3 ? '✓ ' : '☐ '} ОП-03 :: Лом Чёрного Льда</li>
          </ul>
          <div className="row mt-4">
            <button className="btn" onClick={() => setScreen('menu')}>◂ вернуться к досье</button>
          </div>
        </div>
      ) : (
        <FinalBreachSequence gameState={gameState} gameActions={gameActions} setScreen={setScreen} />
      )}
    </div>
  );
}

Object.assign(window, { MainMenu, Finale });
