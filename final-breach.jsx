/* ============================================================
   Final mission: Obsidian Breach
   ============================================================ */

(function () {
  function FinalBreachSequence({ gameState, gameActions, setScreen }) {
    const required = ['BIT', 'ENTROPY', 'MUTUAL', 'CIPHER'];
    const missing = required.filter(x => !gameState.accessFragments.includes(x));
    const hard = gameState.difficulty === 'hard';
    const maxAttempts = hard ? 1 : 2;
    const [step, setStep] = React.useState(0);
    const [attempts, setAttempts] = React.useState(maxAttempts);
    const [done, setDone] = React.useState(false);
    const [packet, setPacket] = React.useState(null);

    React.useEffect(() => {
      setAttempts(maxAttempts);
    }, [step, maxAttempts]);

    if (missing.length) {
      return (
        <div className="panel" style={{ maxWidth: 820 }}>
          <div className="panel-title">// Obsidian Core locked <div className="bar" /></div>
          <p className="body">Core не принимает неполный keyring. Нужны Access Fragments:</p>
          <div className="row">
            {required.map(f => <span key={f} className={`chip ${missing.includes(f) ? 'pink' : 'green'}`}>{missing.includes(f) ? 'missing' : 'cached'} {f}</span>)}
          </div>
          <button className="btn mt-6" onClick={() => setScreen('menu')}>back to dossier</button>
        </div>
      );
    }

    const fail = (reason) => {
      const left = attempts - 1;
      gameActions.penalty({ heat: 18, trace: 18, integrity: hard ? 15 : 0, reason });
      if (left <= 0) {
        if (hard) {
          gameActions.addLog('! hardline rollback :: final error kicked you to OP-03', 'warn');
          setScreen('l3');
          return;
        }
        gameActions.forceDefeat(reason);
      } else {
        setAttempts(left);
      }
    };

    const pass = (line) => {
      gameActions.addLog(`✓ Obsidian step cleared :: ${line}`, 'success');
      setStep(s => s + 1);
    };

    const finish = () => {
      const plaintext = 'Meet me beyond the Obsidian Curtain';
      const iv = '0b51d1aaca7e0001';
      const key = 'f1e2d3c4b5a6978877665544332211000f1e2d3c4b5a6978';
      const ciphertext = window.TripleDES.encryptText(plaintext, key, { mode: 'CBC', iv });
      const decrypted = window.TripleDES.decryptText(ciphertext, key, { mode: 'CBC', iv });
      setPacket({ plaintext, iv, ciphertext, decrypted });
      setDone(true);
      gameActions.addLog('✓ BREACH COMPLETE :: final packet accepted', 'success');
    };

    if (done) return <BreachCertificate gameState={gameState} packet={packet} />;

    const steps = [
      {
        title: '1 / pick the signal',
        line: 'Rook: один сигнал, который стоит шума. BurnICE уже нюхает воду.',
        body: (
          <div className="cards-row">
            {[
              ['Routine ping', false],
              ['Rare admin token leak', true],
              ['BurnICE anomaly', false],
            ].map(([label, ok]) => (
              <button key={label} className="signal-card" onClick={() => ok ? pass('signal value') : fail(`final signal mismatch :: ${label}`)}>
                <div className="title-md" style={{ color: 'var(--neon-cyan)' }}>{label}</div>
                <p className="body dim" style={{ fontSize: 13 }}>{ok ? 'Низкая p, разумный risk, высокая utility.' : 'Либо слишком скучно, либо слишком горячо.'}</p>
              </button>
            ))}
          </div>
        ),
      },
      {
        title: '2 / tune entropy channel',
        line: 'Rook: канал должен звучать как дождь, но не как сирена.',
        body: (
          <div className="cards-row">
            {[
              ['0.97 / 0.01 / 0.01 / 0.01', false],
              ['0.25 / 0.25 / 0.25 / 0.25', true],
              ['0.70 / 0.10 / 0.10 / 0.10', false],
            ].map(([label, ok]) => (
              <button key={label} className="signal-card" onClick={() => ok ? pass('entropy masking') : fail(`final entropy mismatch :: ${label}`)}>
                <span className="chip">distribution</span>
                <div className="mono mt-3" style={{ color: ok ? 'var(--neon-green)' : 'var(--ink-dim)' }}>{label}</div>
              </button>
            ))}
          </div>
        ),
      },
      {
        title: '3 / mini matrix breach',
        line: 'Rook: X должен шепнуть Y достаточно, чтобы дверь узнала нас, но не достаточно, чтобы SOC проснулся.',
        body: (
          <div className="cards-row">
            {[
              ['independent', 'I≈0.00', false],
              ['quiet link', 'I≈0.28, H(X)=1, H(Y)=1', true],
              ['perfect mirror', 'I≈1.00', false],
            ].map(([name, stat, ok]) => (
              <button key={name} className="signal-card" onClick={() => ok ? pass('mutual information') : fail(`final matrix mismatch :: ${name}`)}>
                <div className="title-md" style={{ color: 'var(--neon-pink)' }}>{name}</div>
                <div className="mono dim mt-2">{stat}</div>
              </button>
            ))}
          </div>
        ),
      },
      {
        title: '4 / assemble and send payload',
        line: 'Rook: CBC. Random IV. EDE. PKCS#7. Сейчас или никогда.',
        body: (
          <div className="cards-row">
            {[
              ['ECB / no IV / EEE / none', false],
              ['CBC / random IV / EDE / PKCS#7', true],
              ['CBC / fixed IV / DDE / zero padding', false],
            ].map(([label, ok]) => (
              <button key={label} className="signal-card" onClick={() => ok ? finish() : fail(`final cipher mismatch :: ${label}`)}>
                <div className="title-md" style={{ color: ok ? 'var(--neon-green)' : 'var(--neon-cyan)' }}>{label}</div>
              </button>
            ))}
          </div>
        ),
      },
    ];

    const active = steps[step];
    return (
      <div>
        <StoryPanel cue="final" />
        <div className="panel pink mt-4">
          <div className="panel-title">// Obsidian Breach <div className="bar" /></div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h2 className="title-md" style={{ color: 'var(--neon-pink)', margin: 0 }}>{active.title}</h2>
              <p className="body dim">{active.line}</p>
            </div>
            <span className="chip warn">attempts {attempts}/{maxAttempts}</span>
          </div>
          {active.body}
        </div>
      </div>
    );
  }

  function BreachCertificate({ gameState, packet }) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    return (
      <div>
        <StoryPanel cue="win" />
        <div className="brackets panel pink mt-4">
          <span className="br-tr" /><span className="br-bl" />
          <div className="panel-title">// BREACH COMPLETE · certificate <div className="bar" /></div>
          <div className="certificate">
            <div className="kicker">DesignTest / НЕТРАННЕР - Эхо Информации</div>
            <h1 className="title-lg" style={{ color: 'var(--neon-green)' }}>BREACH COMPLETE</h1>
            <p className="body">
              Оператор {window.HERO_NAME || 'Rook'} закрыл три задания БДЗ и прошёл Obsidian Core.
            </p>
            <div className="cert-grid">
              <div><b>Количество информации</b><span>Информация — не размер сообщения, а мера того, насколько сигнал уменьшает неопределённость.</span></div>
              <div><b>Взаимная информация</b><span>Реализован live-калькулятор P(X,Y), H(X), H(Y), H(X,Y), I(X;Y), NMI и условных энтропий.</span></div>
              <div><b>3DES</b><span>Реализовано шифрование/дешифрование 3DES EDE на чистом JS, CBC/ECB, IV, PKCS#7, файлы и EDE-визуализация.</span></div>
            </div>
            {packet && (
              <div className="terminal mt-4">
                {[
                  `plaintext  :: ${packet.plaintext}`,
                  `IV         :: ${packet.iv}`,
                  `ciphertext :: ${packet.ciphertext}`,
                  `decrypted  :: ${packet.decrypted}`,
                ].join('\n')}
                <span className="cursor" />
              </div>
            )}
            <div className="mono dim mt-4">issued {today} · fragments {gameState.accessFragments.join(' / ')} · failCount {gameState.failCount}</div>
          </div>
        </div>
        <div className="row mt-6">
          <button className="btn pink" onClick={() => window.print()}>print certificate</button>
        </div>
      </div>
    );
  }

  Object.assign(window, { FinalBreachSequence, BreachCertificate });
})();
