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

  const labels = {
    mode: 'режим блоков',
    iv: 'IV для CBC',
    pipeline: 'цепочка 3DES',
    padding: 'выравнивание блока',
    keyProfile: 'профиль ключа',
  };

  const correct = {
    mode: 'CBC',
    iv: 'random IV',
    pipeline: 'EDE',
    padding: 'PKCS#7',
    keyProfile: 'strong 24-byte key',
  };

  const reasons = {
    mode: 'ECB раскрывает повторяющиеся блоки. ICE увидит паттерн.',
    iv: 'CBC нужен IV. Фиксированный или отсутствующий IV оставляет след.',
    pipeline: 'Это не Triple DES EDE. Приёмник не сможет расшифровать полезную нагрузку.',
    padding: 'Без PKCS#7 длина полезной нагрузки не выравнивается по 8-байтовому блоку DES.',
    keyProfile: 'Слабый ключ рушит туннель. При K1=K2=K3 схема фактически откатывается к обычному DES.',
  };

  const intel = [
    {
      id: 'traffic',
      group: 'mode',
      value: 'CBC',
      title: 'Дамп трафика',
      clue: 'В полезной нагрузке повторяются одинаковые 8-байтовые блоки. ECB оставит одинаковые блоки одинаковыми.',
      why: 'CBC перед шифрованием XOR-ит блок с предыдущим шифроблоком, поэтому повтор не превращается в заметный паттерн.',
    },
    {
      id: 'nonce',
      group: 'iv',
      value: 'random IV',
      title: 'Заголовок туннеля',
      clue: 'Первый блок не должен повторяться между запусками даже при одинаковом тексте.',
      why: 'Случайный IV делает первый CBC-блок непредсказуемым. Отсутствующий или фиксированный IV оставляет стабильный след.',
    },
    {
      id: 'receiver',
      group: 'pipeline',
      value: 'EDE',
      title: 'Спецификация приёмника',
      clue: 'Core ожидает Triple DES: encrypt K1, decrypt K2, encrypt K3.',
      why: 'EDE — стандартная схема 3DES. Для расшифровки приёмник пройдёт обратный маршрут D_K3 -> E_K2 -> D_K1.',
    },
    {
      id: 'block',
      group: 'padding',
      value: 'PKCS#7',
      title: 'Отчёт по блокам',
      clue: 'DES работает блоками по 8 байт, а сообщение редко попадает в размер блока ровно.',
      why: 'PKCS#7 однозначно добавляет недостающие байты и позволяет корректно снять padding после дешифрования.',
    },
    {
      id: 'key',
      group: 'keyProfile',
      value: 'strong 24-byte key',
      title: 'Аудит ключа',
      clue: 'K1, K2 и K3 должны быть независимыми 8-байтовыми частями одного 24-байтового ключа.',
      why: 'Повтор ключей ослабляет 3DES: при K1=K2=K3 схема сводится к обычному DES.',
    },
  ];

  const optionNotes = {
    mode: {
      ECB: 'ECB шифрует одинаковые открытые блоки в одинаковые шифроблоки: паттерн виден.',
      CBC: 'CBC связывает каждый блок с предыдущим шифроблоком и скрывает повторы.',
    },
    iv: {
      none: 'Без IV первый CBC-блок становится предсказуемым.',
      'fixed IV': 'Фиксированный IV повторяет первый блок между запусками.',
      'random IV': 'Случайный IV нужен для неповторяемого первого блока.',
    },
    pipeline: {
      EDE: 'EDE совместим со стандартным Triple DES: E_K1 -> D_K2 -> E_K3.',
      EEE: 'EEE — три шифрования подряд, но это не ожидаемый приёмником 3DES EDE.',
      DDE: 'DDE нарушает порядок операций, приёмник не восстановит исходный текст.',
    },
    padding: {
      none: 'Без padding сообщение должно быть кратно 8 байтам, иначе последний блок неполный.',
      'zero padding': 'Нулевой padding неоднозначен, если исходные данные сами заканчиваются нулями.',
      'PKCS#7': 'PKCS#7 хранит длину добавки и корректно снимается после расшифровки.',
    },
    keyProfile: {
      'weak repeated key': 'Повторение частей ключа резко снижает стойкость.',
      'short passphrase': 'Короткая фраза здесь растягивается до 24 байт, но энтропии в ней мало.',
      'strong 24-byte key': '24 случайных байта дают K1, K2, K3 без повторов.',
    },
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
    const appliedIntel = intel.filter(item => choice[item.group] === item.value).length;

    const set = (group, value) => setChoice(c => ({ ...c, [group]: value }));
    const applyIntel = (item) => {
      set(item.group, item.value);
      setError('');
    };
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
      gameActions.addLog(`✓ полезная нагрузка зашифрована :: ${ciphertext.slice(0, 28)}...`, 'success');
    };

    return (
      <div className="puzzle-block">
        <StoryPanel cue="l3" />
        <div className="panel">
          <div className="panel-title">// Cipher Tunnel Assembly <div className="bar" /></div>
          <p className="body dim">
            Собери маршрут из источников ниже. Каждый источник указывает на один параметр туннеля:
            режим, IV, цепочку 3DES, padding или профиль ключа. Когда все подсказки применены,
            проверь сборку.
          </p>
          <div className="row mt-3" style={{ justifyContent: 'space-between' }}>
            <span className="chip green">источники применены · {appliedIntel}/{intel.length}</span>
            <span className="mono dim" style={{ fontSize: 11 }}>маршрут: CBC / random IV / EDE / PKCS#7 / 24-byte key</span>
          </div>
          <div className="intel-grid mt-4">
            {intel.map(item => {
              const active = choice[item.group] === item.value;
              return (
                <button key={item.id} className={`intel-card ${active ? 'active' : ''}`} onClick={() => applyIntel(item)}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="kicker">{item.title}</span>
                    <span className={`chip ${active ? 'green' : ''}`}>{labels[item.group]}</span>
                  </div>
                  <p className="body dim">{item.clue}</p>
                  <div className="mono" style={{ color: active ? 'var(--neon-green)' : 'var(--neon-yellow)', fontSize: 11 }}>
                    выбрать :: {item.value}
                  </div>
                  <small>{item.why}</small>
                </button>
              );
            })}
          </div>
          <div className="choice-grid mt-4">
            {Object.entries(options).map(([group, vals]) => (
              <div key={group} className="choice-group">
                <div className="label">{labels[group]}</div>
                {vals.map(v => (
                  <button key={v} className={`choice-pill ${choice[group] === v ? 'active' : ''}`} onClick={() => set(group, v)}>
                    {v}
                  </button>
                ))}
                <p className="choice-note">{optionNotes[group][choice[group]]}</p>
              </div>
            ))}
          </div>
          <div className="row mt-4">
            <button className="btn green" onClick={assemble}>assemble tunnel</button>
            {error && <span className="chip pink">{error}</span>}
          </div>
          {result && (
            <div className="panel pink mt-4">
              <div className="panel-title">// проверка полезной нагрузки <div className="bar" /></div>
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
