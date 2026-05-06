/* ============================================================
   УРОВЕНЬ 3 — Лом Чёрного Льда
   3DES шифрование/дешифрование, режимы, файлы, EDE-визуализация
   ============================================================ */

const { encryptText, decryptText, decryptBytes, encryptOneBlockSteps, bytesToHex, hexToBytes, strToBytes, bytesToStr, normalizeKey } = window.TripleDES;

function EDEVisualizer({ active, k1Hex, k2Hex, k3Hex, blocks }) {
  return (
    <div>
      <div className="ede-stage">
        <div className={`ede-block ${active >= 1 ? 'active' : ''}`}>
          <div className="lab">ШАГ 1 · ШИФР.</div>
          <div className="op">E<sub>K1</sub></div>
          <div className="key">{k1Hex || '—'}</div>
          <div className="mono dim mt-2" style={{fontSize: 10, wordBreak: 'break-all'}}>
            вх:  {blocks?.input ? bytesToHex(blocks.input) : '—'}
            <br/>вых: {blocks?.afterE1 ? bytesToHex(blocks.afterE1) : '—'}
          </div>
        </div>
        <div className={`ede-block ${active >= 2 ? 'active' : ''}`}>
          <div className="lab">ШАГ 2 · ДЕШИФР.</div>
          <div className="op">D<sub>K2</sub></div>
          <div className="key">{k2Hex || '—'}</div>
          <div className="mono dim mt-2" style={{fontSize: 10, wordBreak: 'break-all'}}>
            вх:  {blocks?.afterE1 ? bytesToHex(blocks.afterE1) : '—'}
            <br/>вых: {blocks?.afterD2 ? bytesToHex(blocks.afterD2) : '—'}
          </div>
        </div>
        <div className={`ede-block ${active >= 3 ? 'active' : ''}`}>
          <div className="lab">ШАГ 3 · ШИФР.</div>
          <div className="op">E<sub>K3</sub></div>
          <div className="key">{k3Hex || '—'}</div>
          <div className="mono dim mt-2" style={{fontSize: 10, wordBreak: 'break-all'}}>
            вх:  {blocks?.afterD2 ? bytesToHex(blocks.afterD2) : '—'}
            <br/>вых: {blocks?.afterE3 ? bytesToHex(blocks.afterE3) : '—'}
          </div>
        </div>
      </div>
      <p className="body dim mt-3" style={{fontSize: 12}}>
        Расписание EDE. При K1 = K3 ≠ K2 получается «двух-ключевой 3DES» (112 бит). С тремя
        независимыми ключами — ≈168 бит (фактически ≈112 из-за meet-in-the-middle).
        K1 = K2 = K3 схлопывает 3DES в обычный DES — именно то, чего делать <i>не нужно</i>.
      </p>
    </div>
  );
}

function Level3({ onComplete, gameState, gameActions }) {
  const [tab, setTab] = useState('assembly');
  const [plain, setPlain] = useState('узел горит в полночь. принеси чип.');
  const [keyInput, setKeyInput] = useState('netrunner-johnny-shadow-key');
  const [iv, setIv] = useState('1337c0de');
  const [mode, setMode] = useState('CBC');
  const [cipherHex, setCipherHex] = useState('');
  const [decoded, setDecoded] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState(0);
  const [stageBlocks, setStageBlocks] = useState(null);
  const [terminalLog, setTerminalLog] = useState([]);

  const keyBytes = useMemo(() => {
    try { return normalizeKey(keyInput); } catch { return new Uint8Array(24); }
  }, [keyInput]);
  const k1Hex = bytesToHex(keyBytes.slice(0,8));
  const k2Hex = bytesToHex(keyBytes.slice(8,16));
  const k3Hex = bytesToHex(keyBytes.slice(16,24));

  const log = (line) => setTerminalLog(l => [...l, line]);

  const animateEDE = (firstBlock) => {
    setStage(0);
    setStageBlocks(null);
    const steps = encryptOneBlockSteps(firstBlock, keyBytes);
    setTimeout(() => { setStage(1); setStageBlocks({input: steps.input, afterE1: steps.afterE1}); }, 200);
    setTimeout(() => { setStage(2); setStageBlocks({input: steps.input, afterE1: steps.afterE1, afterD2: steps.afterD2}); }, 700);
    setTimeout(() => { setStage(3); setStageBlocks(steps); }, 1200);
  };

  const doEncrypt = () => {
    setError('');
    try {
      log(`> вход в шифроядро :: режим=${mode} iv=${iv}`);
      log(`> упаковка открытого текста (${strToBytes(plain).length} байт) ...`);
      const hex = encryptText(plain, keyInput, { mode, iv });
      setCipherHex(hex);
      setDecoded('');
      log(`✓ шифротекст :: ${hex.length/2} байт (${hex.length} hex-символов)`);
      const padded = strToBytes(plain);
      let first = padded.slice(0, 8);
      if (first.length < 8) {
        const fill = new Uint8Array(8);
        fill.set(first);
        for (let i = first.length; i < 8; i++) fill[i] = 8 - first.length;
        first = fill;
      }
      animateEDE(first);
    } catch (e) {
      setError(e.message);
      log(`✗ ошибка :: ${e.message}`);
    }
  };
  const doDecrypt = () => {
    setError('');
    try {
      log(`> распаковка шифротекста ...`);
      const out = decryptText(cipherHex, keyInput, { mode, iv });
      setDecoded(out);
      log(`✓ открытый текст :: «${out.slice(0, 60)}${out.length > 60 ? '…' : ''}»`);
    } catch (e) {
      setError(e.message);
      log(`✗ ошибка дешифровки :: ${e.message}`);
    }
  };

  const swapKey = () => {
    setError('');
    const wrongKey = new Uint8Array(keyBytes);
    wrongKey[0] ^= 0xff;
    try {
      decryptText(cipherHex, wrongKey, { mode, iv });
      setDecoded('▒▒▒▒▒▒▒ повреждение :: неверный ключ ▒▒▒▒▒▒▒');
      log('✗ использован изменённый ключ K1 — аутентичного открытого текста нет');
    } catch (e) {
      setDecoded('▒▒▒▒▒▒▒ повреждение :: неверный ключ ▒▒▒▒▒▒▒');
      log(`✗ неверный ключ разрушил padding/блоки :: ${e.message}`);
    }
  };

  const [fileName, setFileName] = useState('');
  const [fileHex, setFileHex] = useState('');
  const [decryptFileName, setDecryptFileName] = useState('');
  const [decryptedFileBytes, setDecryptedFileBytes] = useState(null);
  const fileInputRef = useRef(null);
  const decryptFileInputRef = useRef(null);
  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    const buf = new Uint8Array(await f.arrayBuffer());
    const hex = encryptText(buf, keyInput, { mode, iv });
    setFileHex(hex);
    log(`> файл :: ${f.name} (${buf.length} байт) → шифротекст (${hex.length/2} байт)`);
  };
  const onDecryptFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setDecryptFileName(f.name);
    setDecryptedFileBytes(null);
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      const hex = bytesToHex(buf);
      const bytes = decryptBytes(hex, keyInput, { mode, iv });
      setDecryptedFileBytes(bytes);
      log(`✓ файл расшифрован :: ${f.name} → ${bytes.length} байт`);
    } catch (err) {
      setError(err.message);
      log(`✗ ошибка расшифровки файла :: ${err.message}`);
    }
  };
  const downloadFile = () => {
    const bytes = hexToBytes(fileHex);
    const blob = new Blob([bytes], {type:'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (fileName || 'payload') + '.3des';
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadDecryptedFile = () => {
    if (!decryptedFileBytes) return;
    const blob = new Blob([decryptedFileBytes], {type:'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptFileName.replace(/\.3des$/i, '') || 'decrypted-payload';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [bruteRunning, setBruteRunning] = useState(false);
  const [bruteAttempt, setBruteAttempt] = useState('');
  const [bruteCount, setBruteCount] = useState(0);
  const [bruteHeat, setBruteHeat] = useState(0);
  const bruteTimer = useRef(null);
  const startBrute = () => {
    setBruteRunning(true);
    setBruteCount(0);
    setBruteHeat(0);
    log('> запуск перебора ...');
    log('> пространство ключей 3DES ≈ 2^168. ETA: тепловая смерть Вселенной.');
    let i = 0, heat = 0;
    bruteTimer.current = setInterval(() => {
      i += Math.floor(1e6 + Math.random() * 5e6);
      setBruteCount(i);
      const fake = Array.from({length: 24}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');
      setBruteAttempt(fake);
      heat += 0.4 + Math.random();
      setBruteHeat(Math.min(100, heat));
      if (heat >= 100) {
        log('✗ нейрошунт перегрелся (100°C) — обрыв до того, как Johnny сгорит вместе с линией.');
        stopBrute();
      }
    }, 80);
  };
  const stopBrute = () => {
    setBruteRunning(false);
    clearInterval(bruteTimer.current);
  };
  useEffect(() => () => clearInterval(bruteTimer.current), []);

  return (
    <div className="fade-in" style={{padding: '32px 64px 64px', maxWidth: 1320, margin: '0 auto'}}>
      <div className="row mb-2" style={{justifyContent:'space-between'}}>
        <div>
          <div className="kicker">ОП-03 · ХРАНИЛИЩЕ</div>
          <h1 className="title-lg" style={{color:'var(--neon-green)', marginTop: 8}}>ЛОМ ЧЁРНОГО ЛЬДА</h1>
        </div>
        <span className="chip green">3DES · ТРОЙНОЙ DES · EDE</span>
      </div>
      <p className="body dim" style={{maxWidth: 760}}>
        Чистый JS-3DES (без крипто-библиотек). 64-битные блоки, PKCS#7-набивка, режимы ECB и CBC,
        шифрование файлов и пошаговый показ цепочки E-D-E. Сначала собери безопасный маршрут туннеля,
        затем проверь его на тексте, файле и демонстрации перебора.
      </p>
      <StoryPanel cue="l3" />

      <div className="tabs mt-6">
        <button className={`tab ${tab==='assembly'?'active':''}`} onClick={() => setTab('assembly')}>I · Cipher Tunnel</button>
        <button className={`tab ${tab==='main'?'active':''}`} onClick={() => setTab('main')}>II · Шифроядро</button>
        <button className={`tab ${tab==='file'?'active':''}`} onClick={() => setTab('file')}>III · Файлы</button>
        <button className={`tab ${tab==='brute'?'active':''}`} onClick={() => setTab('brute')}>IV · Перебор ключа</button>
      </div>

      {tab === 'assembly' && <ProtocolAssemblyPuzzle gameState={gameState} gameActions={gameActions} />}

      {tab === 'main' && (
        <div className="row" style={{gap: 24, alignItems: 'flex-start'}}>
          <div style={{flex: '1 1 480px', minWidth: 380}}>
            <div className="panel">
              <div className="panel-title">// входные данные<div className="bar"/></div>
              <div className="row" style={{gap: 12}}>
                <div style={{flex: '1 1 200px'}}>
                  <div className="label">режим</div>
                  <div className="row" style={{gap: 6}}>
                    {['ECB','CBC'].map(m => (
                      <button key={m} className="btn ghost" onClick={() => setMode(m)}
                        style={{padding:'6px 14px', fontSize: 11, ...(mode===m ? {background:'var(--neon-cyan)', color:'#000', borderColor:'var(--neon-cyan)'} : {})}}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{flex: '1 1 200px'}}>
                  <div className="label">iv (только cbc · 8 байт)</div>
                  <input className="input" value={iv} onChange={e => setIv(e.target.value)} disabled={mode === 'ECB'} />
                </div>
              </div>
              <div className="mt-3">
                <div className="label">ключ — строка или 48-hex (24 байта на выходе)</div>
                <input className="input" value={keyInput} onChange={e => setKeyInput(e.target.value)} />
                <div className="row mono dim mt-2" style={{fontSize: 10, gap: 18, flexWrap: 'wrap'}}>
                  <span>K1: <span style={{color:'var(--neon-yellow)'}}>{k1Hex}</span></span>
                  <span>K2: <span style={{color:'var(--neon-yellow)'}}>{k2Hex}</span></span>
                  <span>K3: <span style={{color:'var(--neon-yellow)'}}>{k3Hex}</span></span>
                </div>
              </div>
              <div className="mt-3">
                <div className="label">открытый текст</div>
                <textarea className="textarea" rows={3} value={plain} onChange={e => setPlain(e.target.value)} />
              </div>
              <div className="row mt-4">
                <button className="btn green" onClick={doEncrypt}>▸ зашифровать</button>
                <button className="btn pink" onClick={doDecrypt} disabled={!cipherHex}>◂ дешифровать</button>
                <button className="btn ghost" onClick={swapKey} disabled={!cipherHex}>испортить ключ и проверить</button>
              </div>
              {error && <div className="chip" style={{borderColor:'var(--neon-red)', color:'var(--neon-red)', marginTop: 12}}>!! {error}</div>}
            </div>

            <div className="panel mt-4">
              <div className="panel-title">// результат<div className="bar"/></div>
              <div className="label">шифротекст (hex)</div>
              <div className="mono" style={{
                background:'rgba(0,0,0,0.5)', padding: 12,
                border:'1px solid rgba(57,255,122,0.25)',
                color:'var(--neon-green)',
                fontSize: 12, wordBreak:'break-all', minHeight: 60
              }}>
                {cipherHex || <span className="dim">— ждём шифрования —</span>}
              </div>
              {decoded && (
                <>
                  <div className="label mt-3">расшифровано</div>
                  <div className="mono" style={{
                    background:'rgba(0,0,0,0.5)', padding: 12,
                    border:'1px solid rgba(255,42,109,0.25)',
                    color:'var(--neon-pink)',
                    fontSize: 13, wordBreak:'break-word'
                  }}>
                    {decoded}
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{flex: '1 1 480px', minWidth: 380}}>
            <div className="panel pink">
              <div className="panel-title">// расписание EDE · первый блок<div className="bar"/></div>
              <EDEVisualizer active={stage} k1Hex={k1Hex} k2Hex={k2Hex} k3Hex={k3Hex} blocks={stageBlocks} />
            </div>
            <div className="panel mt-4">
              <div className="panel-title">// терминал<div className="bar"/></div>
              <div className="terminal">
                {terminalLog.length === 0 ? '> ожидание ввода...' : terminalLog.join('\n')}
                <span className="cursor"/>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'file' && (
        <div className="row" style={{gap: 24, alignItems:'flex-start'}}>
          <div className="panel" style={{flex:'1 1 420px'}}>
            <div className="panel-title">// работа с файлами<div className="bar"/></div>
            <p className="body dim" style={{fontSize: 13}}>
              Загрузи любой файл. Он читается как сырые байты, дополняется PKCS#7 и проходит через
              ту же EDE-цепочку. Для обратной операции загрузи .3des с тем же ключом, режимом и IV.
            </p>
            <div className="mt-3">
              <input ref={fileInputRef} type="file" onChange={onFile} style={{display: 'none'}} />
              <button className="btn green" onClick={() => fileInputRef.current?.click()}>+ загрузить файл</button>
            </div>
            {fileName && (
              <div className="mt-4">
                <div className="chip green">{fileName}</div>
                <div className="mono dim mt-2" style={{fontSize: 11}}>зашифровано: {fileHex.length / 2} байт</div>
                <div className="mt-3">
                  <button className="btn pink" onClick={downloadFile}>⇩ скачать .3des</button>
                </div>
              </div>
            )}
            <div className="mt-6" style={{borderTop:'1px solid rgba(57,255,122,0.15)', paddingTop: 18}}>
              <div className="label">расшифровать .3des</div>
              <input ref={decryptFileInputRef} type="file" onChange={onDecryptFile} style={{display: 'none'}} />
              <button className="btn ghost" onClick={() => decryptFileInputRef.current?.click()}>+ загрузить .3des</button>
              {decryptFileName && (
                <div className="mt-4">
                  <div className="chip">{decryptFileName}</div>
                  <div className="mono dim mt-2" style={{fontSize: 11}}>
                    {decryptedFileBytes ? `расшифровано: ${decryptedFileBytes.length} байт` : 'ожидание корректного ключа/IV'}
                  </div>
                  {decryptedFileBytes && (
                    <div className="mt-3">
                      <button className="btn green" onClick={downloadDecryptedFile}>⇩ скачать исходный файл</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="panel pink" style={{flex:'1 1 420px'}}>
            <div className="panel-title">// фрагмент шифротекста<div className="bar"/></div>
            <div className="mono" style={{
              background:'rgba(0,0,0,0.5)', padding: 12,
              maxHeight: 280, overflow: 'auto',
              fontSize: 11, color:'var(--neon-green)',
              wordBreak:'break-all',
            }}>
              {fileHex ? fileHex.slice(0, 4000) + (fileHex.length > 4000 ? ' ...' : '') : <span className="dim">— файл не загружен —</span>}
            </div>
          </div>
        </div>
      )}

      {tab === 'brute' && (
        <div className="panel" style={{maxWidth: 920}}>
          <div className="panel-title">// демонстрация перебора · в реальности не пытайся<div className="bar"/></div>
          <p className="body" style={{fontSize: 14}}>
            Демонстрация масштаба. Подбираем случайные 24-байтовые ключи к текущему шифротексту и смотрим, как
            греется нейрошунт. У настоящего 3DES ≈2¹⁶⁸ ключей; meet-in-the-middle сбивает фактическую
            стойкость до ≈2¹¹². В любом случае Johnny и линия сгорят <b>задолго</b> до попадания.
          </p>
          <div className="row mt-4">
            {!bruteRunning
              ? <button className="btn pink" onClick={startBrute} disabled={!cipherHex}>▸ начать перебор</button>
              : <button className="btn" onClick={stopBrute}>■ прервать до перегрева</button>}
          </div>
          <div className="row mt-6" style={{gap: 14}}>
            <div className="metric-card grow"><div className="k">попыток</div><div className="v">{bruteCount.toLocaleString()}</div></div>
            <div className="metric-card pink grow"><div className="k">прогресс</div><div className="v">{(bruteCount / 2**168 * 100).toExponential(1)}%</div></div>
            <div className="metric-card grow" style={{borderColor: bruteHeat > 70 ? 'var(--neon-red)' : undefined}}>
              <div className="k">нагрев шунта</div>
              <div className="v" style={{color: bruteHeat > 70 ? 'var(--neon-red)' : 'var(--neon-yellow)'}}>{bruteHeat.toFixed(0)}°C</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="bar-track"><div className="bar-fill" style={{width: bruteHeat + '%', background: bruteHeat > 70 ? 'linear-gradient(90deg, var(--neon-yellow), var(--neon-red))' : undefined}}/></div>
          </div>
          <div className="mt-4 mono dim" style={{fontSize: 11}}>
            текущий кандидат: <span style={{color:'var(--neon-yellow)'}}>{bruteAttempt || '—'}</span>
          </div>
        </div>
      )}

      <div className="row mt-6" style={{justifyContent:'space-between', borderTop:'1px solid rgba(57,255,122,0.15)', paddingTop: 24}}>
        <div className="mono dim" style={{fontSize: 11}}>
          {gameState.accessFragments.includes('CIPHER') ? 'Access Fragment cached :: CIPHER' : 'Cipher Tunnel Assembly ждёт безопасную сборку'}
        </div>
        <button className="btn pink" onClick={onComplete} disabled={!gameState.accessFragments.includes('CIPHER')}>▸ seal OP-03 checkpoint</button>
      </div>
    </div>
  );
}

window.Level3 = Level3;
