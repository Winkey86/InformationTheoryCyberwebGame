/* ============================================================
   УРОВЕНЬ 1 — Колыбель Шеннона
   Три мини-игры + эссе:
     A) Сортировка сигналов — выбери самый информативный
     B) Энтропия монеты/кубика — биты на исход
     C) Сжатие — повторы несут меньше информации
   Плюс эссе (творческое задание №1)
   ============================================================ */

const { entropy } = window.InfoTheory;

function fmt(n, d=3) {
  if (!isFinite(n)) return '—';
  return n.toFixed(d);
}

function ProbabilityCloud({ probs, color = 'cyan' }) {
  const dots = useMemo(() => {
    const arr = [];
    const n = 60;
    for (let i = 0; i < n; i++) {
      let s = 0, bin = 0;
      const r = i / n;
      for (let j = 0; j < probs.length; j++) {
        s += probs[j];
        if (r < s) { bin = j; break; }
      }
      arr.push({ bin, jit: (Math.random()-0.5) });
    }
    return arr;
  }, [probs.join(',')]);
  const H = entropy(probs);
  const Hmax = Math.log2(probs.length || 1) || 1;
  const ratio = Hmax > 0 ? H / Hmax : 0;
  const c = color === 'pink' ? 'var(--neon-pink)' : color === 'green' ? 'var(--neon-green)' : 'var(--neon-cyan)';
  return (
    <div>
      <div className="cloud">
        {dots.map((d, i) => {
          const cx = ((d.bin + 0.5) / probs.length) * 100;
          const x = cx + d.jit * 12 * ratio;
          const y = 50 + d.jit * 80 * ratio;
          return <span key={i} className="dot" style={{
            left: x + '%', top: y + '%',
            background: c, boxShadow: `0 0 6px ${c}`,
          }} />;
        })}
        {probs.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: -22,
            left: ((i + 0.5) / probs.length) * 100 + '%',
            transform: 'translateX(-50%)',
            fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-faint)'
          }}>
            x{i+1}<br/><span style={{color: 'var(--ink-dim)'}}>{(p*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div className="row" style={{marginTop: 32, justifyContent: 'space-between'}}>
        <span className="mono dim" style={{fontSize: 11}}>H = {fmt(H, 2)} бит</span>
        <span className="mono dim" style={{fontSize: 11}}>H<sub>max</sub> = {fmt(Hmax, 2)} бит</span>
        <span className="mono" style={{fontSize: 11, color: c}}>{(ratio*100).toFixed(0)}% разброс</span>
      </div>
    </div>
  );
}

const SIGNAL_ROUNDS = [
  {
    prompt: 'Дорожный ИИ следит за шоссе. Какая трансляция расскажет больше всего о следующем проезжающем авто?',
    options: [
      { label: 'Сенсор A', detail: '99% машина · 1% грузовик',
        probs: [0.99, 0.01], why: 'Почти наверняка машина. В среднем ≈0.08 бит.' },
      { label: 'Сенсор Б', detail: '50% машина · 50% грузовик',
        probs: [0.5, 0.5], why: 'Подбрасывание монеты. Максимум неожиданности — ровно 1 бит на сигнал.', best: true },
      { label: 'Сенсор В', detail: '70% машина · 30% грузовик',
        probs: [0.7, 0.3], why: '≈0.88 бит. Ближе к честному, но Б всё ещё выигрывает.' },
      { label: 'Сенсор Г', detail: '100% машина',
        probs: [1, 0], why: 'Ноль неожиданности → ноль информации. Сенсор бесполезен.' },
    ],
  },
  {
    prompt: 'Из ShenTech утекли три голосовых сэмпла. Какой в среднем расскажет больше всего о говорящем?',
    options: [
      { label: 'Голос α', detail: 'аааа · аааа · аааа', probs: [1, 0, 0, 0], why: 'Один символ навсегда. 0 бит на знак.' },
      { label: 'Голос β', detail: 'AB · AB · AB · AB', probs: [0.5, 0.5, 0, 0], why: '1 бит на знак. Предсказуемо, но периодично.' },
      { label: 'Голос γ', detail: 'q5%·w5%·e90%', probs: [0.05, 0.05, 0.9, 0], why: '≈0.57 бит. Перекошено → низкая энтропия.' },
      { label: 'Голос δ', detail: '4 буквы · равномерно', probs: [0.25, 0.25, 0.25, 0.25], why: '2 бита на знак. Максимальная плотность информации.', best: true },
    ],
  },
  {
    prompt: 'Успеваешь прочитать один лог-файл до закрытия фаервола. У какого выше плотность информации?',
    options: [
      { label: 'log://heartbeat', detail: '«ОК ОК ОК ОК ОК»', probs: [1], why: 'Чистый пульс. 0 бит. Бесполезно.' },
      { label: 'log://alerts', detail: 'редкие аномалии в шуме', probs: [0.97, 0.03], why: '≈0.19 бит на запись. Разрежено, не самое плотное.' },
      { label: 'log://routing', detail: '8 узлов, почти равномерно', probs: [0.13, 0.12, 0.13, 0.12, 0.12, 0.13, 0.12, 0.13], why: '≈3 бит на запись. Максимальная плотность.', best: true },
      { label: 'log://header', detail: 'один и тот же заголовок', probs: [1], why: 'Константа. 0 бит.' },
    ],
  },
];

function SignalTriage({ onScore }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const r = SIGNAL_ROUNDS[round];
  const next = () => {
    if (round + 1 < SIGNAL_ROUNDS.length) {
      setRound(round + 1);
      setPicked(null);
    } else {
      onScore(score + (picked != null && r.options[picked].best ? 1 : 0), SIGNAL_ROUNDS.length);
    }
  };
  const submit = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (r.options[i].best) setScore(s => s + 1);
  };
  const correct = picked != null ? r.options.findIndex(o => o.best) : -1;
  return (
    <div>
      <div className="row mb-4" style={{justifyContent:'space-between'}}>
        <span className="kicker">// сортировка сигналов · {round + 1}/{SIGNAL_ROUNDS.length}</span>
        <span className="chip">СЧЁТ {score}/{SIGNAL_ROUNDS.length}</span>
      </div>
      <p className="body" style={{maxWidth: 760}}>{r.prompt}</p>
      <div className="cards-row mt-4">
        {r.options.map((o, i) => {
          let cls = 'signal-card';
          if (picked === i) cls += o.best ? ' correct' : ' wrong';
          else if (picked != null && i === correct) cls += ' correct';
          return (
            <div key={i} className={cls} onClick={() => submit(i)}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <span className="kicker" style={{color: 'var(--ink-dim)'}}>вариант {String.fromCharCode(65+i)}</span>
                {picked != null && i === correct && <span className="chip green">ЛУЧШИЙ</span>}
              </div>
              <div className="title-md mt-2" style={{color:'var(--neon-cyan)'}}>{o.label}</div>
              <div className="mono dim mt-2" style={{fontSize: 12}}>{o.detail}</div>
              <div className="mt-3 mono" style={{fontSize: 11, color: 'var(--neon-yellow)'}}>
                H = {fmt(entropy(o.probs), 2)} бит
              </div>
              {picked != null && (
                <div className="mt-2 body dim" style={{fontSize: 12}}>{o.why}</div>
              )}
            </div>
          );
        })}
      </div>
      {picked != null && (
        <div className="mt-6 row">
          <button className="btn" onClick={next}>
            {round + 1 < SIGNAL_ROUNDS.length ? '▸ следующий сигнал' : '▸ продолжить'}
          </button>
        </div>
      )}
    </div>
  );
}

function EntropyLab() {
  const [n, setN] = useState(2);
  const [probs, setProbs] = useState([0.5, 0.5]);
  useEffect(() => {
    setProbs(Array.from({length: n}, () => 1/n));
  }, [n]);
  const setProb = (i, v) => {
    const next = probs.slice();
    next[i] = Math.max(0, Math.min(1, v));
    const others = next.reduce((a, b, j) => j === i ? a : a + b, 0);
    if (others > 0) {
      const remaining = 1 - next[i];
      for (let j = 0; j < next.length; j++)
        if (j !== i) next[j] = (next[j] / others) * remaining;
    }
    setProbs(next);
  };
  const reset = () => setProbs(Array.from({length: n}, () => 1/n));
  const skew = () => {
    const next = Array.from({length: n}, (_, i) => i === 0 ? 0.85 : 0.15 / (n-1));
    setProbs(next);
  };
  const H = entropy(probs);
  const Hmax = Math.log2(n);
  return (
    <div>
      <div className="row" style={{justifyContent: 'space-between'}}>
        <span className="kicker">// лаборатория энтропии · смещённая монета / нечестный кубик</span>
        <span className="row" style={{gap: 8}}>
          {[2,3,4,6,8].map(k => (
            <button key={k} className={`btn ghost`} onClick={() => setN(k)}
              style={{padding: '4px 10px', fontSize: 11, ...(n===k ? {background:'var(--neon-cyan)', color:'#000', borderColor:'var(--neon-cyan)'} : {})}}>
              {k}
            </button>
          ))}
        </span>
      </div>

      <div className="row mt-4" style={{alignItems: 'flex-start', gap: 32}}>
        <div style={{flex: '1 1 380px', minWidth: 320}}>
          <div className="panel">
            <div className="panel-title">// веса исходов<div className="bar"/></div>
            {probs.map((p, i) => (
              <div key={i} style={{marginBottom: 12}}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <span className="mono" style={{fontSize: 12, color:'var(--ink-dim)'}}>x{i+1}</span>
                  <span className="mono" style={{fontSize: 12, color:'var(--neon-cyan)'}}>{(p*100).toFixed(1)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={p}
                  onChange={(e) => setProb(i, parseFloat(e.target.value))}
                  style={{width: '100%', accentColor: '#05d9ff'}} />
              </div>
            ))}
            <div className="row mt-4">
              <button className="btn ghost" onClick={reset} style={{padding:'6px 12px', fontSize:11}}>равномерно</button>
              <button className="btn ghost" onClick={skew} style={{padding:'6px 12px', fontSize:11}}>перекос</button>
            </div>
          </div>
        </div>

        <div style={{flex: '2 1 480px', minWidth: 360}}>
          <div className="panel pink">
            <div className="panel-title">// резервуар энтропии<div className="bar"/></div>
            <ProbabilityCloud probs={probs} color="pink" />
            <div className="row mt-6" style={{gap: 14}}>
              <div className="metric-card pink grow">
                <div className="k">H(X)</div>
                <div className="v">{fmt(H, 3)}</div>
                <div className="mono dim" style={{fontSize: 10, marginTop: 4}}>бит / символ</div>
              </div>
              <div className="metric-card grow">
                <div className="k">H<sub>max</sub></div>
                <div className="v">{fmt(Hmax, 3)}</div>
                <div className="mono dim" style={{fontSize: 10, marginTop: 4}}>равномерно · log₂ {n}</div>
              </div>
              <div className="metric-card green grow">
                <div className="k">ЭФФЕКТИВНОСТЬ</div>
                <div className="v">{Hmax > 0 ? (H/Hmax*100).toFixed(0) : 0}%</div>
                <div className="mono dim" style={{fontSize: 10, marginTop: 4}}>H / H<sub>max</sub></div>
              </div>
            </div>
            <p className="body dim mt-4" style={{fontSize: 13}}>
              Подвинь один ползунок ближе к 1.0 — облако сожмётся, H упадёт. Равные веса = максимальная
              неопределённость = максимум информации на символ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompressionLab() {
  const samples = [
    { id: 'sky', label: 'небо/реклама',     text: 'КУПИ-СЕЙЧАС КУПИ-СЕЙЧАС КУПИ-СЕЙЧАС КУПИ-СЕЙЧАС' },
    { id: 'log', label: 'сенсор/лог',       text: 'ОК ОК ОК ОК ОШ ОК ОК ОК ОК ОК ОШ ОК ОК ОК' },
    { id: 'msg', label: 'перехват/сообщение', text: 'встреча у причала 9 принеси чип не опаздывай' },
    { id: 'rng', label: 'случайный/поток',  text: 'q7@x!9p#m^t&z?L~v8R%c_jY+B*nU=' },
  ];
  const [pick, setPick] = useState(samples[0].id);
  const sample = samples.find(s => s.id === pick);
  const stats = useMemo(() => {
    const t = sample.text;
    const counts = {};
    for (const c of t) counts[c] = (counts[c] || 0) + 1;
    const probs = Object.values(counts).map(n => n / t.length);
    const H = entropy(probs);
    let rle = '';
    for (let i = 0; i < t.length; ) {
      let j = i;
      while (j < t.length && t[j] === t[i]) j++;
      rle += (j - i) + t[i];
      i = j;
    }
    return {
      H,
      orig: t.length,
      rle: rle.length,
      ratio: rle.length / t.length,
      uniq: Object.keys(counts).length,
    };
  }, [pick]);
  return (
    <div>
      <div className="row mb-4">
        <span className="kicker">// отсек сжатия · сигнал против шума</span>
      </div>
      <div className="row mb-4">
        {samples.map(s => (
          <button key={s.id} className={`btn ghost`} onClick={() => setPick(s.id)}
            style={{padding:'6px 14px', fontSize: 11, ...(pick === s.id ? {background:'var(--neon-cyan)', color:'#000', borderColor:'var(--neon-cyan)'} : {})}}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="mono" style={{fontSize: 14, color: 'var(--neon-cyan)', wordBreak: 'break-all', padding: '8px 0'}}>
          {sample.text}
        </div>
        <div className="row mt-6" style={{gap: 14, flexWrap: 'wrap'}}>
          <div className="metric-card grow"><div className="k">ДЛИНА</div><div className="v">{stats.orig}</div></div>
          <div className="metric-card grow"><div className="k">УНИК. СИМВОЛОВ</div><div className="v">{stats.uniq}</div></div>
          <div className="metric-card pink grow"><div className="k">ЭНТРОПИЯ</div><div className="v">{fmt(stats.H, 2)}</div></div>
          <div className="metric-card green grow"><div className="k">RLE-КОЭФ.</div><div className="v">{fmt(stats.ratio, 2)}</div></div>
        </div>
        <p className="body dim mt-4" style={{fontSize: 13}}>
          Строки с низкой энтропией (реклама, лог сенсора) сжимаются сильнее — они несут меньше
          <i> шенноновской информации</i> на символ, даже если выглядят болтливо. Перехваченное СМС
          читается как смысл для человека, но почти равномерный случайный поток упаковывает больше
          бит на символ. <span className="mono" style={{color:'var(--neon-cyan)'}}>сжатие ≈ оценка энтропии</span>.
        </p>
      </div>
    </div>
  );
}

function Essay() {
  return (
    <div>
      <div className="row mb-4"><span className="kicker">// разбор · монолог нетраннера (эссе · творческое задание)</span></div>
      <div className="brackets panel" style={{maxWidth: 920}}>
        <span className="br-tr"/><span className="br-bl"/>
        <h3 className="title-md" style={{color:'var(--neon-cyan)'}}>Что я понял про количество информации</h3>
        <div className="body" style={{lineHeight: 1.7, marginTop: 12}}>
          <p>
            До этого захода я думал, что «информация» — то же самое, что «содержимое»: объём фразы,
            размер файла. Колыбель показала мне обратное: информация — это то, что{' '}
            <b style={{color:'var(--neon-cyan)'}}>снимает сомнение</b>. Лог пульса может литься вечно
            и не сообщать ничего, потому что следующий символ уже известен. Одна строка, которая
            меняет ожидания, может стоить мегабайта успокоительной телеметрии.
          </p>
          <p>
            Цифра на счётчике — это шенноновская энтропия:{' '}
            <span className="mono" style={{color:'var(--neon-cyan)'}}>H(X) = −Σ p(x)·log₂ p(x)</span>.
            Она говорит: взвесь каждый возможный исход на его вероятности, потом — на том, насколько
            ты бы удивился, увидев именно его (<span className="mono">−log₂ p</span> бит), и сложи.
            Честная монета даёт 1 бит; смещённая — меньше; сломанный сенсор, который всегда отвечает
            <span className="mono"> «ОК»</span>, — ноль.
          </p>
          <p>
            За пределами хакерских историй это важно потому, что почти любая современная технология,
            если присмотреться, — это игра с энтропией. <b style={{color:'var(--neon-pink)'}}>Сжатие</b>{' '}
            (zip, JPEG, видеокодеки) зарабатывает деньги тем, что сбивает биты до уровня энтропии —
            всё, что выше, — это шум, который ты зачем-то отправляешь.
            <b style={{color:'var(--neon-pink)'}}> Канальное кодирование</b> (5G, Wi-Fi, дальняя
            космическая связь) добавляет избыточность обратно — ровно столько, чтобы пережить шумный провод;
            теорема Шеннона о пропускной способности задаёт точную границу.
            <b style={{color:'var(--neon-pink)'}}> Криптография</b> хочет противоположного сжатию:
            шифротекст должен выглядеть максимально энтропично, чтобы любая догадка была не лучше любой
            другой. <b style={{color:'var(--neon-pink)'}}>Машинное обучение</b> всю свою жизнь подбирает
            следующий токен с самой высокой <span className="mono">p</span> — поэтому его выход
            по построению низкоэнтропичен и кажется человечным; «перплексия» — это по сути{' '}
            <span className="mono">2^H</span>. <b style={{color:'var(--neon-pink)'}}>Big Data</b>{' '}
            ценен не из-за объёма. Он ценен, когда взаимная информация с какой-то целью — кликом,
            оттоком, опухолью — высока. Большая часть данных — это пульс. Задача — найти бит, который удивит.
          </p>
          <p>
            Поэтичность шенноновского бита в том, что ему всё равно, что значат символы. Бит, измеренный
            в любовных письмах, имеет ту же единицу, что и бит, измеренный в основаниях ДНК или в
            радиошуме. Поэтому теория информации вылезает там, где её, кажется, никто не ждал: в физике
            (принцип Ландауэра: стирание одного бита стоит <span className="mono">kT·ln 2</span> джоулей),
            в биологии (сжимаемость генома), даже в экономике (эффективные рынки оценивают предсказуемую
            информацию в ноль).
          </p>
          <p style={{color: 'var(--ink-dim)'}}>
            Вывод Johnny: когда пытаешься понять, что именно слушать в шумном городе, не меряй
            громкость канала. Меряй, насколько он меняет ожидания. Самые громкие билборды Midnight City,
            как правило, — самые скучные.
          </p>
        </div>
      </div>
    </div>
  );
}

function Level1({ onComplete, gameState, gameActions }) {
  const tabs = [
    { id: 'signal', label: 'I · Signal Value' },
    { id: 'entropyLock', label: 'II · Entropy Lock' },
    { id: 'triage', label: 'III · Сортировка' },
    { id: 'lab',    label: 'IV · Энтропия Lab' },
    { id: 'comp',   label: 'V · Сжатие' },
    { id: 'essay',  label: 'VI · Разбор' },
  ];
  const [tab, setTab] = useState('signal');
  const [score, setScore] = useState({ done: false, n: 0, of: 0 });
  const l1Ready = gameState.accessFragments.includes('BIT') && gameState.accessFragments.includes('ENTROPY');
  return (
    <div className="fade-in" style={{padding: '32px 64px 64px', maxWidth: 1280, margin: '0 auto'}}>
      <div className="row mb-2" style={{justifyContent:'space-between'}}>
        <div>
          <div className="kicker">ОП-01 · ПОГРУЖЕНИЕ</div>
          <h1 className="title-lg" style={{color:'var(--neon-cyan)', marginTop: 8}}>КОЛЫБЕЛЬ ШЕННОНА</h1>
        </div>
        <span className="chip">КОЛИЧЕСТВО ИНФОРМАЦИИ</span>
      </div>
      <p className="body dim" style={{maxWidth: 720}}>
        Сначала пазлы с последствиями, затем тренажёры и эссе. Колыбель учит сначала чувствовать вес сигнала, а потом считать его точно.
      </p>
      <StoryPanel cue="l1" />

      <div className="tabs mt-6">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'signal' && <SignalValuePuzzle gameState={gameState} gameActions={gameActions} />}
      {tab === 'entropyLock' && <EntropyLock gameState={gameState} gameActions={gameActions} />}
      {tab === 'triage' && (
        <SignalTriage onScore={(n, of) => {
          setScore({ done: true, n, of });
          setTab('lab');
        }} />
      )}
      {tab === 'lab' && <EntropyLab />}
      {tab === 'comp' && <CompressionLab />}
      {tab === 'essay' && <Essay />}

      <div className="row mt-6" style={{justifyContent:'space-between', borderTop:'1px solid rgba(5,217,255,0.12)', paddingTop: 24}}>
        <div className="mono dim" style={{fontSize: 11}}>
          {l1Ready ? 'Access Fragments cached :: BIT / ENTROPY' : score.done ? `legacy sorting :: ${score.n}/${score.of}` : 'signal gate ...... ожидание'}
        </div>
        <button className="btn pink" onClick={onComplete} disabled={!l1Ready}>▸ seal OP-01 checkpoint</button>
      </div>
    </div>
  );
}

window.Level1 = Level1;
