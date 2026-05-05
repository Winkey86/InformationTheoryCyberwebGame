/* ============================================================
   Shared shell: world background, top bar, status bar, nav
   ============================================================ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

function World() {
  const drops = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 0.8 + Math.random() * 1.6,
      h: 40 + Math.random() * 80,
      o: 0.2 + Math.random() * 0.5,
    }));
  }, []);
  return (
    <div className="world" aria-hidden="true">
      <div className="glow-pink" />
      <div className="glow-cyan" />
      <div className="grid" />
      <div className="horizon" />
      <div className="rain">
        {drops.map((d, i) => (
          <span key={i} style={{
            left: d.left + '%',
            animationDelay: -d.delay + 's',
            animationDuration: d.dur + 's',
            height: d.h + 'px',
            opacity: d.o,
          }} />
        ))}
      </div>
      <div className="noise" />
      <div className="scanlines" />
      <div className="vignette" />
    </div>
  );
}

function TopBar({ level, totalLevels, gameState }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (n) => String(n).padStart(2, '0');
  const stamp = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`;
  const heat = gameState?.heat ?? 0;
  const trace = gameState?.trace ?? 0;
  const integrity = gameState?.integrity ?? 100;
  const fragments = gameState?.accessFragments || [];
  return (
    <div className="topbar">
      <div className="topbar-main">
        <div className="left">
          <span className="dot" />
          Канал <b style={{color: 'var(--neon-green)'}}>СТАБИЛЕН</b> · Node 7E-22 · 480 Тб/с
        </div>
        <div className="center">НЕТРАННЕР · ЭХО ИНФОРМАЦИИ</div>
        <div className="right">
          ОП {fmt(level || 0)}/{fmt(totalLevels || 4)} · ICE {heat > 70 ? 'BURN' : heat > 40 ? 'HEAT' : 'ФОНОВЫЙ'} · {stamp}
        </div>
      </div>
      <div className="run-hud">
        <HudMeter label="ICE Heat" value={heat} color="pink" />
        <HudMeter label="Trace" value={trace} color="warn" />
        <HudMeter label="Integrity" value={integrity} color="green" invert />
        <div className="hud-box fragments">
          <span>Access Fragments</span>
          <b>{fragments.length ? fragments.join(' / ') : '—'}</b>
        </div>
        <div className="hud-box checkpoint">
          <span>Checkpoint</span>
          <b>{gameState?.checkpoint || 'BOOT'}</b>
        </div>
      </div>
    </div>
  );
}

function HudMeter({ label, value, color, invert }) {
  const tone = color === 'pink' ? 'var(--neon-pink)' : color === 'green' ? 'var(--neon-green)' : 'var(--neon-yellow)';
  const danger = invert ? value < 35 : value > 70;
  return (
    <div className={`hud-box ${danger ? 'danger' : ''}`}>
      <span>{label}</span>
      <b style={{ color: danger ? 'var(--neon-red)' : tone }}>{Math.round(value)}</b>
      <div className="hud-track"><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: danger ? 'var(--neon-red)' : tone }} /></div>
    </div>
  );
}

function StatusBar({ children }) {
  return (
    <div className="statusbar">
      <div className="seg">НЕТРАННЕР · <b>V0ID</b></div>
      <div className="seg">{children}</div>
      <div className="seg">ОБЩАЯ СЕТЬ / KRONOS SYSCORP / УРОВЕНЬ-Δ</div>
    </div>
  );
}

function NavRail({ screen, setScreen, completed, gameState }) {
  const fragments = gameState?.accessFragments || [];
  const finalOpen = ['BIT', 'ENTROPY', 'MUTUAL', 'CIPHER'].every(f => fragments.includes(f));
  const items = [
    { id: 'menu', label: 'M' },
    { id: 'l1',   label: '1' },
    { id: 'l2',   label: '2' },
    { id: 'l3',   label: '3' },
    { id: 'finale', label: '◆', locked: !finalOpen },
  ];
  return (
    <div className="nav">
      {items.map(it => (
        <button
          key={it.id}
          className={screen === it.id ? 'active' : ''}
          onClick={() => !it.locked && setScreen(it.id)}
          title={it.locked ? 'Obsidian Core locked' : it.id}
          disabled={it.locked}
        >
          {it.label}
          {completed[it.id] ? <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 5, height: 5, background: 'var(--neon-green)',
            borderRadius: '50%', boxShadow: '0 0 6px var(--neon-green)'
          }} /> : null}
        </button>
      ))}
    </div>
  );
}

// Boot sequence
function BootSequence({ onDone }) {
  const lines = [
    '> инициализация нейрошунта ................. [ok]',
    '> рукопожатие :: KRONOS SYSCORP / УРОВЕНЬ-Δ. [ok]',
    '> зондирование ICE-решётки 7Е-22/0xAA01 .... [ok]',
    '> калибровка резервуара энтропии ........... [ok]',
    '> загрузка профиля нетраннера :: V0ID ...... [ok]',
    '> монтирование модулей: SHANNON, MUTUAL, 3DES [ok]',
    '> обход телеметрии Black ICE ............... [скрыто]',
    '> ГОТОВ.',
    '',
    '   «город слушает каждый провод,',
    '    поэтому ты шепчешь битами.»',
    '',
    '> нажми любую клавишу, чтобы войти_',
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown(s => s + 1), shown < 7 ? 180 : 280);
    return () => clearTimeout(t);
  }, [shown]);
  useEffect(() => {
    if (shown < lines.length) return;
    const handler = () => onDone();
    window.addEventListener('keydown', handler);
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
    };
  }, [shown]);
  return (
    <div className="boot">
      <pre style={{color: 'var(--neon-cyan)', marginBottom: 12}}>
{`╔══════════════════════════════════════════════════════════╗
║   Н Е Т Р А Н Н Е Р   ::   Э Х О   И Н Ф О Р М А Ц И И   ║
║   v0.9.7 — сборка neon harbor — только для операторов     ║
╚══════════════════════════════════════════════════════════╝`}
      </pre>
      {lines.slice(0, shown).map((l, i) => <pre key={i}>{l}</pre>)}
      {shown < lines.length ? <pre><span className="cursor" /></pre> : <pre style={{color:'var(--neon-pink)'}}><span className="cursor" /></pre>}
    </div>
  );
}

Object.assign(window, { World, TopBar, StatusBar, NavRail, BootSequence });
