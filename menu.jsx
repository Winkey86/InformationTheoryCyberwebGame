/* ============================================================
   Главное меню + финал + брифинги уровней
   ============================================================ */

function MainMenu({ setScreen, completed }) {
  const ops = [
    { id: 'l1', code: 'ОП-01', name: 'Колыбель Шеннона', sub: 'Количество информации', color: 'cyan',
      brief: 'Первое погружение. Учись взвешивать сигналы — чувствовать, какие биты по-настоящему сжимают неизвестность.'},
    { id: 'l2', code: 'ОП-02', name: 'Решётка взаимности', sub: 'Анализ совместных вероятностей', color: 'pink',
      brief: 'Живой калькулятор, врезанный в дата-этаж. Подай ему совместную матрицу — и наблюдай, как из неё течёт зависимость.'},
    { id: 'l3', code: 'ОП-03', name: 'Лом Чёрного Льда', sub: '3DES — шифрование / дешифрование / взлом', color: 'green',
      brief: 'Тройной шифр. Расписание EDE. Ключ от хранилища куётся в три прохода.'},
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
        <span className="chip">НЕТРАННЕР · V0ID</span>
        <span className="chip pink">ЦЕЛЬ · KRONOS SYSCORP</span>
        <span className="chip green">ГОРОД · НЕОН-ХАРБОР</span>
        <span className="chip warn">ДОПУСК · УРОВЕНЬ-Δ</span>
      </div>

      <div className="brackets panel fade-in d3" style={{maxWidth: 760, marginBottom: 32}}>
        <span className="br-tr" /><span className="br-bl" />
        <div className="panel-title">// перехват трансляции <div className="bar" /></div>
        <p className="body" style={{margin:0}}>
          Они построили скайлайн из чужих секретов. Каждый билборд, каждый чёрнорыночный киоск,
          каждая костно-проводная реклама — это всего лишь утёкшая энтропия со спиленными серийниками.
          Сегодня ты ныряешь под кожу города, чтобы добыть <b style={{color:'var(--neon-cyan)'}}>Ключ Информации</b>{' '}
          — алгоритм, который решает, каким битам быть громкими.
        </p>
        <p className="body mono dim" style={{margin: '14px 0 0', fontSize: 12, letterSpacing: '0.05em'}}>
          три операции. три замка. один нетраннер.
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
    </div>
  );
}

function Finale({ completed, setScreen }) {
  const allDone = completed.l1 && completed.l2 && completed.l3;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="fade-in" style={{padding: '40px 64px 64px', maxWidth: 1100, margin: '0 auto'}}>
      <div className="kicker">// эвакуация · последняя трансляция</div>
      <h1 className="title-xl" style={{marginTop: 12, marginBottom: 24}}>
        {allDone ? (
          <><span style={{color:'var(--neon-green)'}}>ВЫХОД</span> ИЗ СЕТИ</>
        ) : (
          <><span style={{color:'var(--neon-yellow)'}}>ОЖИ</span>ДАНИЕ</>
        )}
      </h1>

      {!allDone ? (
        <div className="panel" style={{maxWidth: 720}}>
          <div className="panel-title">// статус <div className="bar"/></div>
          <p className="body">
            Три замка. Три ключа. Хранилище не открывается за неполный набор.
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
        <>
          <div className="brackets panel pink" style={{maxWidth: 880, marginBottom: 24}}>
            <span className="br-tr" /><span className="br-bl"/>
            <div className="panel-title">// сертификат нетраннера <div className="bar"/></div>
            <div style={{textAlign: 'center', padding: '20px 8px'}}>
              <div className="kicker" style={{color: 'var(--ink-dim)'}}>сертификат безопасной экстракции</div>
              <div className="title-lg" style={{marginTop: 12, color: 'var(--neon-pink)'}}>V0ID</div>
              <div className="body dim" style={{marginTop: 8}}>
                расшифровал Ключ Информации и вышел из дата-этажа Kronos Syscorp,<br/>
                заметно облегчив их резервуар энтропии.
              </div>
              <div className="row" style={{justifyContent:'center', marginTop: 24, gap: 32}}>
                <div>
                  <div className="kicker">ШЕННОН</div>
                  <div className="title-md" style={{color: 'var(--neon-cyan)'}}>ВЫПОЛНЕНО</div>
                </div>
                <div>
                  <div className="kicker">ВЗАИМНАЯ</div>
                  <div className="title-md" style={{color: 'var(--neon-pink)'}}>ВЫПОЛНЕНО</div>
                </div>
                <div>
                  <div className="kicker">3DES</div>
                  <div className="title-md" style={{color: 'var(--neon-green)'}}>ВЫПОЛНЕНО</div>
                </div>
              </div>
              <div className="mono dim" style={{marginTop: 24, fontSize: 11, letterSpacing: '0.2em'}}>
                ВЫДАН {today.replace(/-/g, '.')} · НЕОН-ХАРБОР · KRONOS SYSCORP ВСЁ ОТРИЦАЕТ
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">// разбор полётов <div className="bar"/></div>
            <p className="body">
              Ты начал заход с подозрением, что информация — это чувство, что одни сообщения
              просто <i>тяжелее</i> других. Уходишь — с математикой: <span className="mono" style={{color:'var(--neon-cyan)'}}>H(X) = −Σp·log₂p</span>{' '}
              — точный вес неожиданности. <span className="mono" style={{color:'var(--neon-pink)'}}>I(X;Y) = H(X) + H(Y) − H(X,Y)</span> — то,
              как плотно две системы шепчутся друг с другом. <span className="mono" style={{color:'var(--neon-green)'}}>3DES = E·D·E</span>{' '}
              — то, во что заворачивают тайну, когда нельзя доверять проводам.
            </p>
            <p className="body dim">
              Сжатие. Канальное кодирование. Криптография. Машинное обучение. Любая современная
              система — это борьба с одним и тем же врагом: с энтропией, которой ты не управляешь.
            </p>
          </div>

          <div className="row mt-6">
            <button className="btn pink" onClick={() => setScreen('menu')}>◂ пройти ещё раз</button>
            <button className="btn ghost" onClick={() => window.print()}>⎙ распечатать сертификат</button>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { MainMenu, Finale });
