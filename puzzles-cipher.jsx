/* ============================================================
   Puzzle 4: Cipher Tunnel Assembly
   ============================================================ */

(function () {
  const options = {
    mode: ['ECB', 'CBC'],
    iv: ['none', 'fixed IV', 'random IV'],
    pipeline: ['EDE', 'EEE', 'DDE'],
    padding: ['none', 'zero padding', 'PKCS#7'],
    keyProfile: ['weak repeated key', 'short passphrase', 'strong 24-byte key'],
  };

  const correct = {
    mode: 'CBC',
    iv: 'random IV',
    pipeline: 'EDE',
    padding: 'PKCS#7',
    keyProfile: 'strong 24-byte key',
  };

  const reasons = {
    mode: 'ECB: Repeating blocks detected. ICE sees the pattern.',
    iv: 'CBC needs an IV. Fixed or missing IV leaves a trace.',
    pipeline: 'This is not Triple DES EDE. Receiver cannot decode payload.',
    padding: 'Payload length is not aligned to 8-byte DES block without PKCS#7.',
    keyProfile: 'Weak key profile collapses the tunnel. K1=K2=K3 drifts toward single DES behavior.',
  };

  function randomHex(bytes) {
    const arr = new Uint8Array(bytes);
    if (crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return window.TripleDES.bytesToHex(arr);
  }

  function ProtocolAssemblyPuzzle({ gameState, gameActions }) {
    const hard = gameState.difficulty === 'hard';
    const [choice, setChoice] = React.useState({
      mode: 'ECB',
      iv: 'none',
      pipeline: 'EEE',
      padding: 'none',
      keyProfile: 'short passphrase',
    });
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState('');

    const set = (group, value) => setChoice(c => ({ ...c, [group]: value }));
    const assemble = () => {
      const bad = Object.keys(correct).find(k => choice[k] !== correct[k]);
      if (bad) {
        setError(reasons[bad]);
        gameActions.penalty({ heat: 15, trace: 15, integrity: hard ? 15 : 0, reason: `Cipher Tunnel rejected :: ${bad}` });
        return;
      }
      const plaintext = 'Meet me beyond the Obsidian Curtain';
      const iv = randomHex(8);
      const key = randomHex(24);
      const ciphertext = window.TripleDES.encryptText(plaintext, key, { mode: 'CBC', iv });
      const decrypted = window.TripleDES.decryptText(ciphertext, key, { mode: 'CBC', iv });
      setResult({ plaintext, iv, key, ciphertext, decrypted });
      setError('');
      gameActions.awardFragment('CIPHER', 'cipher tunnel assembled');
      gameActions.addLog(`✓ payload encrypted :: ${ciphertext.slice(0, 28)}...`, 'success');
    };

    return (
      <div className="puzzle-block">
        <StoryPanel cue="l3" />
        <div className="panel">
          <div className="panel-title">// Cipher Tunnel Assembly <div className="bar" /></div>
          <p className="body dim">
            Собери протокол для отправки payload в Core. Здесь не надо переписывать 3DES: нужно выбрать параметры,
            которые не палят паттерны и совместимы с EDE-пайплайном.
          </p>
          <div className="choice-grid mt-4">
            {Object.entries(options).map(([group, vals]) => (
              <div key={group} className="choice-group">
                <div className="label">{group}</div>
                {vals.map(v => (
                  <button key={v} className={`choice-pill ${choice[group] === v ? 'active' : ''}`} onClick={() => set(group, v)}>
                    {v}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="row mt-4">
            <button className="btn green" onClick={assemble}>assemble tunnel</button>
            {error && <span className="chip pink">{error}</span>}
          </div>
          {result && (
            <div className="panel pink mt-4">
              <div className="panel-title">// payload test <div className="bar" /></div>
              <div className="terminal">
                {[
                  `plaintext  :: ${result.plaintext}`,
                  `IV         :: ${result.iv}`,
                  `ciphertext :: ${result.ciphertext}`,
                  `decrypted  :: ${result.decrypted}`,
                  '> tunnel status :: CBC / random IV / 3DES EDE / PKCS#7',
                ].join('\n')}
                <span className="cursor" />
              </div>
              <p className="body dim mt-4">
                3DES исторически важен: DES-блок 64 бита, три прохода EDE, padding для кратности блока.
                CBC скрывает повторяющиеся блоки лучше ECB, а IV делает первый блок непредсказуемым.
                Для новых реальных систем лучше AEAD вроде AES-GCM или ChaCha20-Poly1305.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  Object.assign(window, { ProtocolAssemblyPuzzle });
})();
