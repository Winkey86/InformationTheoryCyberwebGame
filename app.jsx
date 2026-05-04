/* ============================================================
   Top-level app: routes between menu / levels / finale
   ============================================================ */

function App() {
  const [booted, setBooted] = useState(false);
  const [screen, setScreen] = useState('menu');
  const [completed, setCompleted] = useState({ menu: false, l1: false, l2: false, l3: false, finale: false });

  const markComplete = (id) => {
    setCompleted(c => ({ ...c, [id]: true }));
    // auto advance: after l1 -> l2, l2 -> l3, l3 -> finale
    const next = id === 'l1' ? 'l2' : id === 'l2' ? 'l3' : 'finale';
    setTimeout(() => setScreen(next), 600);
  };

  const levelOf = screen === 'l1' ? 1 : screen === 'l2' ? 2 : screen === 'l3' ? 3 : screen === 'finale' ? 3 : 0;
  const statusBlurb = (
    screen === 'menu'   ? 'ожидание :: досье открыто' :
    screen === 'l1'     ? 'оп-01 :: колыбель шеннона :: в работе' :
    screen === 'l2'     ? 'оп-02 :: решётка взаимности :: в работе' :
    screen === 'l3'     ? 'оп-03 :: лом чёрного льда :: в работе' :
                          'эвакуация :: сертификат готов'
  );

  if (!booted) {
    return <BootSequence onDone={() => setBooted(true)} />;
  }

  return (
    <div className="app">
      <World />
      <TopBar level={levelOf} totalLevels={3} />
      <NavRail screen={screen} setScreen={setScreen} completed={completed} />
      <div className="main">
        {screen === 'menu'   && <MainMenu setScreen={setScreen} completed={completed} />}
        {screen === 'l1'     && <Level1 onComplete={() => markComplete('l1')} />}
        {screen === 'l2'     && <Level2 onComplete={() => markComplete('l2')} />}
        {screen === 'l3'     && <Level3 onComplete={() => markComplete('l3')} />}
        {screen === 'finale' && <Finale completed={completed} setScreen={setScreen} />}
      </div>
      <StatusBar>{statusBlurb}</StatusBar>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
