/* ============================================================
   Story Panels / Hero Monologue
   ============================================================ */

(function () {
  const PHRASES = {
    boot: {
      status: 'Focused',
      text: 'Информация — это не шум. Это момент, когда туман в голове становится картой.',
    },
    l1: {
      status: 'Calm',
      text: 'Если сигнал слишком предсказуемый, он почти мёртв. Мне нужен тот, который ломает неопределённость.',
    },
    signal: {
      status: 'Focused',
      text: 'Редкость сама по себе не билет внутрь. Ценный сигнал ещё должен пережить стоимость перехвата и ICE risk.',
    },
    entropy: {
      status: 'Nervous',
      text: 'Канал можно спрятать двумя способами: сделать его скучным как heartbeat или шумным как дождь на стекле.',
    },
    l2: {
      status: 'Focused',
      text: 'KuroData не прячет данные. Они прячут связи между ними.',
    },
    l3: {
      status: 'Breach Mode',
      text: 'CBC, random IV, EDE. Без этого ICE увидит паттерн и сожжёт туннель.',
    },
    final: {
      status: 'Overheated',
      text: 'BurnICE почти на физическом канале. Один заход. Четыре замка. Потом Core или темнота.',
    },
    win: {
      status: 'Calm',
      text: 'Сигнал прошёл. Иногда город молчит не потому, что пустой, а потому что наконец понял.',
    },
  };

  function Portrait({ compact }) {
    const [ok, setOk] = React.useState(true);
    const src = React.useMemo(() => `assets/hero-portrait.png?v=${Date.now()}`, []);
    return (
      <div className={`hero-portrait ${compact ? 'compact' : ''}`}>
        {ok ? (
          <img src={src} alt="Rook portrait" onError={() => setOk(false)} />
        ) : (
          <div className="portrait-fallback" aria-label="portrait placeholder">
            <span className="portrait-head" />
            <span className="portrait-shoulders" />
            <span className="portrait-glitch g1" />
            <span className="portrait-glitch g2" />
          </div>
        )}
      </div>
    );
  }

  function StoryPanel({ cue, status, text, compact }) {
    const phrase = cue ? PHRASES[cue] : null;
    const resolvedStatus = status || (phrase && phrase.status) || 'Calm';
    const resolvedText = text || (phrase && phrase.text) || PHRASES.boot.text;
    return (
      <div className={`story-panel ${compact ? 'compact' : ''}`}>
        <Portrait compact={compact} />
        <div className="story-copy">
          <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
            <span className="kicker">{window.HERO_NAME || 'Rook'} // Hero Monologue</span>
            <span className={`chip ${resolvedStatus === 'Overheated' || resolvedStatus === 'Nervous' ? 'pink' : resolvedStatus === 'Breach Mode' ? 'green' : ''}`}>
              {resolvedStatus}
            </span>
          </div>
          <p className="body">{resolvedText}</p>
        </div>
      </div>
    );
  }

  Object.assign(window, { StoryPanel });
})();
