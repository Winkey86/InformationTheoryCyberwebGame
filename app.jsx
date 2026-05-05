/* ============================================================
   Top-level app: routes between menu / levels / finale
   ============================================================ */

function App() {
  const [booted, setBooted] = useState(false);
  const [screen, setScreen] = useState('menu');
  const { gameState, gameActions } = useNetrunnerGame();
  const completed = gameState.completed;

  const markComplete = (id) => {
    const next = id === 'l1' ? 'l2' : id === 'l2' ? 'l3' : id === 'l3' ? 'finale' : 'finale';
    const checkpoint = id === 'l1' ? 'OP-01 / Shannon cradle'
      : id === 'l2' ? 'OP-02 / Matrix breach'
      : id === 'l3' ? 'OP-03 / Cipher tunnel'
      : 'OBSIDIAN / Breach complete';
    gameActions.completeMission(id, checkpoint, next);
    setTimeout(() => setScreen(next), 600);
  };

  useEffect(() => {
    const mission = screen === 'l1' ? 'OP-01 / Shannon cradle'
      : screen === 'l2' ? 'OP-02 / Matrix breach'
      : screen === 'l3' ? 'OP-03 / Cipher tunnel'
      : screen === 'finale' ? 'OBSIDIAN / Core'
      : 'dossier';
    gameActions.setMission(mission);
  }, [screen]);

  const levelOf = screen === 'l1' ? 1 : screen === 'l2' ? 2 : screen === 'l3' ? 3 : screen === 'finale' ? 4 : 0;
  const statusBlurb = (
    screen === 'menu'   ? 'dossier открыт :: выбери node' :
    screen === 'l1'     ? 'OP-01 :: signal value / entropy lock' :
    screen === 'l2'     ? 'OP-02 :: matrix breach' :
    screen === 'l3'     ? 'OP-03 :: cipher tunnel' :
                          'OBSIDIAN CORE :: final breach'
  );

  if (!booted) {
    return <BootSequence onDone={() => setBooted(true)} />;
  }

  if (!gameState.difficultyChosen) {
    return <DifficultyGate gameActions={gameActions} />;
  }

  if (gameState.defeated) {
    return <DefeatScreen gameState={gameState} gameActions={gameActions} setScreen={setScreen} />;
  }

  return (
    <div className="app">
      <World />
      <TopBar level={levelOf} totalLevels={4} gameState={gameState} />
      <NavRail screen={screen} setScreen={setScreen} completed={completed} gameState={gameState} />
      <GlobalStoryPulse gameState={gameState} gameActions={gameActions} />
      <div className="main">
        {screen === 'menu'   && <MainMenu setScreen={setScreen} completed={completed} gameState={gameState} gameActions={gameActions} />}
        {screen === 'l1'     && <Level1 onComplete={() => markComplete('l1')} gameState={gameState} gameActions={gameActions} />}
        {screen === 'l2'     && <Level2 onComplete={() => markComplete('l2')} gameState={gameState} gameActions={gameActions} />}
        {screen === 'l3'     && <Level3 onComplete={() => markComplete('l3')} gameState={gameState} gameActions={gameActions} />}
        {screen === 'finale' && <Finale completed={completed} setScreen={setScreen} gameState={gameState} gameActions={gameActions} />}
      </div>
      <RunDock gameState={gameState} gameActions={gameActions} setScreen={setScreen} />
      <StatusBar>{statusBlurb}</StatusBar>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
