  import { useState } from "react";
  import "./App.css";
  import { players } from "./players";
  import TeamBuilder from "./TeamBuilder";
  //import MatchScreen from "./MatchScreen";

  function generateOpponentXI(allPlayers, userStartingXI) {
  // Exclude players already selected by the user.
  const userPlayerIds = new Set(
    userStartingXI.map((player) => player.id)
  );

  const availablePlayers = allPlayers.filter(
    (player) => !userPlayerIds.has(player.id)
  );

  // Shuffle players so the opponent lineup can vary.
  const shuffledPlayers = [...availablePlayers].sort(
    () => Math.random() - 0.5
  );

  // Pick players by position.
  const goalkeeper = shuffledPlayers.find(
    (player) => player.position === "GK"
  );

  const defenders = shuffledPlayers
    .filter((player) => player.position === "DEF")
    .slice(0, 4);

  const midfielders = shuffledPlayers
    .filter((player) => player.position === "MID")
    .slice(0, 3);

  const forwards = shuffledPlayers
    .filter((player) => player.position === "FWD")
    .slice(0, 3);

  // Combine the players into a 4-3-3 lineup.
  return [
    goalkeeper,
    ...defenders,
    ...midfielders,
    ...forwards,
  ].filter(Boolean);
}

  const gameModes = [
    {
      id: "quick",
      title: "Quick Match",
      description: "Jump straight into a match.",
      icon: "⚽",
    },
    {
      id: "rivalry",
      title: "2 Player Rivalry",
      description: "Challenge your brother or a friend.",
      icon: "🔥",
    },
    {
      id: "manager",
      title: "Manager Mode",
      description: "Build your team and outsmart the AI.",
      icon: "🧠",
    },
    {
      id: "tournament",
      title: "Tournament",
      description: "Compete for the ultimate trophy.",
      icon: "🏆",
    },
  ];


  function createPlayerMatchStats(homeXI, awayXI) {
  const matchStats = {};

  homeXI.forEach((player) => {
    matchStats[player.id] = {
      player,
      team: "home",
      goals: 0,
      shots: 0,
      saves: 0,
      impact: 6,
    };
  });

  awayXI.forEach((player) => {
    matchStats[player.id] = {
      player,
      team: "away",
      goals: 0,
      shots: 0,
      saves: 0,
      impact: 6,
    };
  });

  return matchStats;
}

  function App() {

      const [screen, setScreen] = useState("home");


      const [selectedPlayers, setSelectedPlayers] = useState([]);

      const [searchTerm, setSearchTerm] = useState("");

      const [positionFilter, setPositionFilter] = useState("ALL");

      const [selectedMode, setSelectedMode] = useState("quick");

  // const [startingXI, setStartingXI] = useState([]);
  // const [opponentPlayers, setOpponentPlayers] = useState([]);
  // const [opponentName, setOpponentName] = useState("Rival FC");
  // const [difficulty, setDifficulty] = useState("normal");
  const [startingXI, setStartingXI] = useState([]);
  const [opponentPlayers, setOpponentPlayers] = useState([]);
  const [opponentName, setOpponentName] = useState("Rival FC");
  const [difficulty, setDifficulty] = useState("normal");

  // Identifies whether the match came from Quick Match or Team Builder.
  const [matchType, setMatchType] = useState("quick");

const [homeTeamName, setHomeTeamName] = useState("My FC");
const [awayTeamName, setAwayTeamName] = useState("Rival FC");

  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [tactic, setTactic] = useState("balanced");
  const [commentary, setCommentary] = useState(
  "The referee is ready. Let's get this match started!"
);

const [commentaryLog, setCommentaryLog] = useState([
  "The referee is ready. Let's get this match started!",
]);
  const [matchOver, setMatchOver] = useState(false);
  const [playerMatchStats, setPlayerMatchStats] = useState({});

    const handleModeClick = (modeId) => {
      setSelectedMode(modeId);

      if (modeId === "quick") {
        setScreen("quick-setup");
      } else {
        alert("This game mode will be added in a future step!");
      }
    };


    const [stats, setStats] = useState({
    homeShots: 0,
    awayShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homePossession: 50,
    awayPossession: 50,
    homeCorners: 0,
    awayCorners: 0,
    homeFouls: 0,
    awayFouls: 0,
  });

  const simulateMatchChunk = () => {
    if (matchOver) return;

    const minutesToSimulate = Math.floor(Math.random() * 6) + 5;
    const finalMinute = Math.min(minute + minutesToSimulate, 90);

    let newHomeScore = homeScore;
    let newAwayScore = awayScore;

   const newStats = { ...stats };
const newPlayerMatchStats = { ...playerMatchStats };
const matchEvents = [];

    // Use player ratings when this match comes from Team Builder.
    const homeRating =
      matchType === "team-builder" && startingXI.length > 0
        ? startingXI.reduce((total, player) => total + player.rating, 0) /
          startingXI.length
        : 70;

    const awayRating =
      matchType === "team-builder" && opponentPlayers.length > 0
        ? opponentPlayers.reduce((total, player) => total + player.rating, 0) /
          opponentPlayers.length
        : 70;

    // Convert team ratings into a small advantage.
    const ratingDifference = (homeRating - awayRating) / 100;

    // Get a player from a position group.
    const getPlayer = (team, positions) => {
      const candidates = team.filter((player) =>
        positions.includes(player.position)
      );

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }

      if (team.length > 0) {
        return team[Math.floor(Math.random() * team.length)];
      }

      return null;
    };

    const homeScorer = () =>
      getPlayer(startingXI, ["FWD", "MID"]);

    const awayScorer = () =>
      getPlayer(opponentPlayers, ["FWD", "MID"]);

    const homeGoalkeeper = () =>
      getPlayer(startingXI, ["GK"]);

    const awayGoalkeeper = () =>
      getPlayer(opponentPlayers, ["GK"]);

    for (
      let currentMinute = minute + 1;
      currentMinute <= finalMinute;
      currentMinute++
    ) {
      let randomEvent = Math.random();

      // Tactical influence.
      if (tactic === "attacking") {
        randomEvent -= 0.04;
      } else if (tactic === "defensive") {
        randomEvent += 0.04;
      }

      // Better home players slightly improve home attacking chances.
      if (matchType === "team-builder") {
        randomEvent -= ratingDifference * 0.08;
      }

      randomEvent = Math.max(0, Math.min(1, randomEvent));

      // HOME TEAM ATTACK.
      if (randomEvent < 0.12) {
        const scorer = homeScorer();
        const goalkeeper = awayGoalkeeper();

        newStats.homeShots++;

        if (scorer && newPlayerMatchStats[scorer.id]) {
          newPlayerMatchStats[scorer.id].shots++;
        }

        const homeAttackRating = scorer?.rating ?? homeRating;
        const awayKeeperRating = goalkeeper?.rating ?? awayRating;

        const shotOnTargetChance = Math.min(
          0.8,
          Math.max(0.3, 0.55 + (homeAttackRating - 70) / 200)
        );

        if (Math.random() < shotOnTargetChance) {
          newStats.homeShotsOnTarget++;

          const goalChance = Math.min(
            0.55,
            Math.max(
              0.08,
              0.25 +
                (homeAttackRating - 70) / 250 -
                (awayKeeperRating - 70) / 300
            )
          );

          if (Math.random() < goalChance) {
            newHomeScore++;
            if (scorer && newPlayerMatchStats[scorer.id]) {
  newPlayerMatchStats[scorer.id].goals++;
  newPlayerMatchStats[scorer.id].impact += 3;
}

            matchEvents.push(
              `⚽ ${currentMinute}' — GOAL! ${
                scorer?.name ?? homeTeamName
              } scores for ${homeTeamName}!`
            );
          } else {
            if (goalkeeper && newPlayerMatchStats[goalkeeper.id]) {
  newPlayerMatchStats[goalkeeper.id].saves++;
  newPlayerMatchStats[goalkeeper.id].impact += 0.5;
}
            matchEvents.push(
              `🧤 ${currentMinute}' — ${
                goalkeeper?.name ?? "The goalkeeper"
              } saves a shot from ${
                scorer?.name ?? homeTeamName
              }!`
            );
          }
        } else {
          matchEvents.push(
            `🚀 ${currentMinute}' — ${
              scorer?.name ?? homeTeamName
            } shoots wide!`
          );
        }

        if (Math.random() < 0.25) {
          newStats.homeCorners++;
        }
      }

      // AWAY TEAM ATTACK.
      else if (randomEvent < 0.24) {
        const scorer = awayScorer();
        const goalkeeper = homeGoalkeeper();

        newStats.awayShots++;

        if (scorer && newPlayerMatchStats[scorer.id]) {
          newPlayerMatchStats[scorer.id].shots++;
        }

        const awayAttackRating = scorer?.rating ?? awayRating;
        const homeKeeperRating = goalkeeper?.rating ?? homeRating;

        const shotOnTargetChance = Math.min(
          0.8,
          Math.max(0.3, 0.55 + (awayAttackRating - 70) / 200)
        );

        if (Math.random() < shotOnTargetChance) {
          newStats.awayShotsOnTarget++;

          const goalChance = Math.min(
            0.55,
            Math.max(
              0.08,
              0.25 +
                (awayAttackRating - 70) / 250 -
                (homeKeeperRating - 70) / 300
            )
          );

          if (Math.random() < goalChance) {
            newAwayScore++;
            if (scorer && newPlayerMatchStats[scorer.id]) {
  newPlayerMatchStats[scorer.id].goals++;
  newPlayerMatchStats[scorer.id].impact += 3;
}

            matchEvents.push(
              `⚽ ${currentMinute}' — GOAL! ${
                scorer?.name ?? awayTeamName
              } scores for ${awayTeamName}!`
            );
          } else {
            if (goalkeeper && newPlayerMatchStats[goalkeeper.id]) {
  newPlayerMatchStats[goalkeeper.id].saves++;
  newPlayerMatchStats[goalkeeper.id].impact += 0.5;
}
            matchEvents.push(
              `🧤 ${currentMinute}' — ${
                goalkeeper?.name ?? "The goalkeeper"
              } saves a shot from ${
                scorer?.name ?? awayTeamName
              }!`
            );
          }
        } else {
          matchEvents.push(
            `🚀 ${currentMinute}' — ${
              scorer?.name ?? awayTeamName
            } shoots wide!`
          );
        }

        if (Math.random() < 0.25) {
          newStats.awayCorners++;
        }
      }

      // FOULS.
      else if (randomEvent < 0.30) {
        if (Math.random() < 0.5) {
          newStats.homeFouls++;

          matchEvents.push(
            `🟨 ${currentMinute}' — ${awayTeamName} commits a foul!`
          );
        } else {
          newStats.awayFouls++;

          matchEvents.push(
            `🟨 ${currentMinute}' — ${homeTeamName} commits a foul!`
          );
        }
      }
    }

    // Generate possession.
    const homePossessionForChunk = Math.floor(
      Math.random() * 31 + 35
    );

    newStats.homePossession = Math.round(
      (stats.homePossession + homePossessionForChunk) / 2
    );

    newStats.awayPossession = 100 - newStats.homePossession;

    // Update match state.
    setMinute(finalMinute);
    setHomeScore(newHomeScore);
    setAwayScore(newAwayScore);
    setStats(newStats);
    setPlayerMatchStats(newPlayerMatchStats);

    if (finalMinute >= 90) {
  setMatchOver(true);

  const fullTimeMessage =
    `🏁 FULL TIME! ${homeTeamName} ${newHomeScore} - ${newAwayScore} ${awayTeamName}`;

  setCommentary(fullTimeMessage);

  setCommentaryLog((currentLog) => [
    ...currentLog,
    ...matchEvents,
    fullTimeMessage,
  ]);
} else {
  const chunkMessage =
    matchEvents.length > 0
      ? matchEvents
      : [`⏱️ ${minute}'–${finalMinute}' — Both teams battle for possession.`];

  setCommentary(chunkMessage[chunkMessage.length - 1]);

  setCommentaryLog((currentLog) => [
    ...currentLog,
    ...chunkMessage,
  ]);
}
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesPosition =
      positionFilter === "ALL" ||
      player.position === positionFilter;

    return matchesSearch && matchesPosition;
  });

  const addPlayer = (player) => {
    setSelectedPlayers((currentPlayers) => {
      const alreadySelected = currentPlayers.some(
        (selectedPlayer) => selectedPlayer.id === player.id
      );

      if (alreadySelected) {
        return currentPlayers;
      }

      return [...currentPlayers, player];
    });
  };

  const removePlayer = (playerId) => {
    setSelectedPlayers((currentPlayers) =>
      currentPlayers.filter((player) => player.id !== playerId)
    );
  };

    return (
      <div className="app">
        {screen === "home" && (
          <>
            <header className="topbar">
              <div className="brand">
                <span className="brand-icon">⚽</span>
                <span>PRIME FOOTBALL RIVALS</span>
              </div>

              <div className="topbar-right">
                <span className="online-status">● SYSTEM ONLINE</span>
              </div>
            </header>

            <main className="home-page">
              <section className="hero">
                <div className="hero-content">
                  <p className="eyebrow">THE ULTIMATE FOOTBALL EXPERIENCE</p>

                  <h1>
                    YOUR RIVAL.
                    <br />
                    YOUR <span>LEGACY.</span>
                  </h1>

                  <p className="hero-description">
                    Build your dream team. Make tactical decisions.
                    <br />
                    Prove who rules the pitch.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="primary-button"
                      onClick={() => setScreen("quick-setup")}
                    >
                      PLAY QUICK MATCH →
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setScreen("players")}
                    >
                      CHOOSE PLAYERS →
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="hero-ball">⚽</div>
                  <div className="hero-glow"></div>
                </div>
              </section>

              <section className="modes-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">CHOOSE YOUR BATTLE</p>
                    <h2>GAME MODES</h2>
                  </div>
                </div>

                <div className="mode-grid">
                  {gameModes.map((mode) => (
                    <button
                      key={mode.id}
                      className={`mode-card ${
                        selectedMode === mode.id ? "selected" : ""
                      }`}
                      onClick={() => handleModeClick(mode.id)}
                    >
                      <div className="mode-icon">{mode.icon}</div>
                      <h3>{mode.title}</h3>
                      <p>{mode.description}</p>
                      <span className="mode-arrow">→</span>
                    </button>
                  ))}
                </div>
              </section>
            </main>
          </>
        )}

        {screen === "quick-setup" && (
          <main className="setup-page">
          <button
    className="back-button"
    onClick={() => setScreen("home")}
  >
    Back to Home
  </button>

            <div className="setup-heading">
              <p className="eyebrow">MATCH CONFIGURATION</p>
              <h1>QUICK MATCH</h1>
              <p>Set up your battle before stepping onto the pitch.</p>
            </div>

            <section className="setup-card">
              <div className="team-selection">
               <div className="team-panel">
        <p className="team-label">HOME TEAM</p>
        <div className="team-badge">🔵</div>

        <input
          type="text"
          value={homeTeamName}
          onChange={(event) => setHomeTeamName(event.target.value)}
          placeholder="Your team name"
          maxLength={24}
        />

        <p className="team-description">Your team</p>
      </div>

                <div className="versus">VS</div>

                <div className="team-panel">
  <p className="team-label">AWAY TEAM</p>
  <div className="team-badge">🔴</div>

  <input
    type="text"
    value={awayTeamName}
    onChange={(event) => setAwayTeamName(event.target.value)}
    placeholder="Opponent team name"
    maxLength={24}
  />

  <p className="team-description">Opponent</p>
</div>
              </div>

              <div className="setup-divider"></div>

              <div className="match-settings">
                <div className="setting-item">
                  <label htmlFor="match-duration">MATCH DURATION</label>
                  <select id="match-duration">
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label htmlFor="difficulty">DIFFICULTY</label>
                  <select id="difficulty">
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <button
                className="primary-button start-match-button"
                          onClick={() => {
    setMinute(0);
    setHomeScore(0);
    setAwayScore(0);
    setMatchOver(false);
    setCommentary("The referee blows the whistle. Kick-off!");
    setCommentaryLog([
  "The referee blows the whistle. Kick-off!",
]);
    setStats({
    homeShots: 0,
    awayShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homePossession: 50,
    awayPossession: 50,
    homeCorners: 0,
    awayCorners: 0,
    homeFouls: 0,
    awayFouls: 0,
  });
    // Generate real player lineups for Quick Match.
// Generate real player lineups for Quick Match.
const quickHomeXI = generateOpponentXI(players, []);
const quickAwayXI = generateOpponentXI(players, quickHomeXI);

setStartingXI(quickHomeXI);
setOpponentPlayers(quickAwayXI);

setPlayerMatchStats(
  createPlayerMatchStats(quickHomeXI, quickAwayXI)
);

// Keep the chosen team names.
setOpponentName(awayTeamName);

setMatchType("quick");
setScreen("match");
  }}
              >
                START MATCH →
              </button>
            </section>
          </main>
        )}

        {screen === "players" && (
          <main className="players-screen">
            <div className="players-header">

              <div className="build-team-action">
    <button
      className="primary-button"
      onClick={() => setScreen("team-builder")}
      disabled={selectedPlayers.length < 11}
    >
      BUILD STARTING XI →
    </button>

    <p>
      {selectedPlayers.length < 11
        ? `Select ${11 - selectedPlayers.length} more player(s) to build your Starting XI.`
        : "Your squad is ready. Build your Starting XI!"}
    </p>
  </div>

              <div>
                <p className="eyebrow">BUILD YOUR DREAM TEAM</p>
                <h1>PLAYER SELECTION</h1>
                <p>Search, filter, and add players to your squad.</p>
              </div>

              <div className="selected-counter">
                {selectedPlayers.length} PLAYERS SELECTED
              </div>
            </div>

            <div className="player-filters">
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <select
                value={positionFilter}
                onChange={(event) => setPositionFilter(event.target.value)}
              >
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DEF">Defenders</option>
                <option value="MID">Midfielders</option>
                <option value="FWD">Forwards</option>
              </select>
            </div>

            <div className="players-layout">
              <section className="players-grid">
                {filteredPlayers.map((player) => {
                  const isSelected = selectedPlayers.some(
                    (selectedPlayer) => selectedPlayer.id === player.id
                  );

                  return (
                    <article className="player-card" key={player.id}>
                      <div className="player-rating">{player.rating}</div>

                      <div className="player-info">
                        <h3>{player.name}</h3>
                        <p>
                          {player.position} • {player.nation}
                        </p>
                      </div>

                      <button
                        className={isSelected ? "selected-button" : ""}
                        onClick={() =>
                          isSelected
                            ? removePlayer(player.id)
                            : addPlayer(player)
                        }
                      >
                        {isSelected ? "REMOVE FROM SQUAD" : "ADD TO SQUAD"}
                      </button>
                    </article>
                  );
                })}

                {filteredPlayers.length === 0 && (
                  <p className="no-players">No players match your search.</p>
                )}
              </section>

              <aside className="selected-squad">
                <h2>YOUR SQUAD</h2>
                <p>{selectedPlayers.length} players selected</p>

                {selectedPlayers.length === 0 ? (
                  <p className="empty-squad">No players selected yet.</p>
                ) : (
                  selectedPlayers.map((player) => (
                    <div className="selected-player" key={player.id}>
                      <div>
                        <strong>{player.name}</strong>
                        <span>
                          {player.position} • {player.rating}
                        </span>
                      </div>

                      <button
                        onClick={() => removePlayer(player.id)}
                        aria-label={`Remove ${player.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}

                <button
                  className="back-button"
                  onClick={() => setScreen("home")}
                >
                  ← BACK TO HOME
                </button>
              </aside>
            </div>
          </main>
        )}

      {screen === "team-builder" && (
    <TeamBuilder
      squad={selectedPlayers}
      onBack={() => setScreen("players")}
      onStartMatch={(xi) => {
        if (xi.length !== 11) {
          alert("Please assign all 11 players before starting.");
          return;
        }

        setStartingXI(xi);

        const generatedOpponent = generateOpponentXI(players, xi);

        if (generatedOpponent.length !== 11) {
          alert("Could not generate a complete opponent lineup.");
          return;
        }

        setOpponentPlayers(generatedOpponent);
        setPlayerMatchStats(
  createPlayerMatchStats(xi, generatedOpponent)
);
        setOpponentName("Rival FC");
                setMatchType("team-builder");

        // Reset match state.
        setMinute(0);
        setHomeScore(0);
        setAwayScore(0);
        setMatchOver(false);
        setTactic("balanced");

        setCommentary("The referee blows the whistle. Kick-off!");
        setCommentaryLog([
  "The referee blows the whistle. Kick-off!",
]);

        setStats({
          homeShots: 0,
          awayShots: 0,
          homeShotsOnTarget: 0,
          awayShotsOnTarget: 0,
          homePossession: 50,
          awayPossession: 50,
          homeCorners: 0,
          awayCorners: 0,
          homeFouls: 0,
          awayFouls: 0,
        });

        setScreen("match");
      }}
    />
  )}
  {/* 
  {screen === "match" && (
    <MatchScreen
      homePlayers={startingXI}
      awayPlayers={opponentPlayers}
      homeTeam="Prime FC"
      awayTeam={opponentName}
      difficulty={difficulty}
      onBack={() => setScreen("team-builder")}
    />
  )} */}

        {screen === "match" && (
    <main className="match-page">
      <div className="match-header">
        <p className="eyebrow">PRIME FOOTBALL RIVALS</p>
        <h1>LIVE MATCH</h1>
      </div>

      <section className="match-scoreboard">
        <div className="match-team">
          <div className="match-team-icon">🔵</div>
          <h2>{homeTeamName}</h2>
        </div>

        <div className="score-display">
          <div className="score">
            {homeScore} <span>:</span> {awayScore}
          </div>

          <p className="match-clock">
            {matchOver ? "FULL TIME" : `${minute}'`}
          </p>
        </div>

        <div className="match-team">
          <div className="match-team-icon">🔴</div>
          <h2>{awayTeamName}</h2>
        </div>
      </section>

      <section className="lineups-panel">
  <div className="lineup-team">
    <h3>🔵 {homeTeamName} — Starting XI</h3>

    {startingXI.length === 0 ? (
      <p>No lineup available.</p>
    ) : (
      <div className="lineup-list">
        {startingXI.map((player, index) => (
          <div className="lineup-player" key={player.id}>
            <span className="lineup-number">{index + 1}</span>

            <span className="lineup-player-name">
              {player.name}
            </span>

            <span className="lineup-position">
              {player.position}
            </span>

            <span className="lineup-rating">
              {player.rating}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="lineup-team">
    <h3>🔴 {awayTeamName} — Starting XI</h3>

    {opponentPlayers.length === 0 ? (
      <p>No lineup available.</p>
    ) : (
      <div className="lineup-list">
        {opponentPlayers.map((player, index) => (
          <div className="lineup-player" key={player.id}>
            <span className="lineup-number">{index + 1}</span>

            <span className="lineup-player-name">
              {player.name}
            </span>

            <span className="lineup-position">
              {player.position}
            </span>

            <span className="lineup-rating">
              {player.rating}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
</section>

      <section className="tactics-panel">
    <p className="eyebrow">YOUR TACTICS — {homeTeamName}</p>

    <div className="tactics-buttons">
      <button
        className={`tactic-button ${
          tactic === "attacking" ? "active" : ""
        }`}
        onClick={() => setTactic("attacking")}
      >
        ⚔️ ATTACKING
      </button>

      <button
        className={`tactic-button ${
          tactic === "balanced" ? "active" : ""
        }`}
        onClick={() => setTactic("balanced")}
      >
        ⚖️ BALANCED
      </button>

      <button
        className={`tactic-button ${
          tactic === "defensive" ? "active" : ""
        }`}
        onClick={() => setTactic("defensive")}
      >
        🛡️ DEFENSIVE
      </button>
    </div>

    <p className="tactic-description">
      Current approach: {tactic.toUpperCase()}
    </p>
  </section>

  <section className="stats-panel">
    <div className="stats-heading">
      <p className="eyebrow">MATCH STATISTICS</p>
      <span>{homeTeamName} — {awayTeamName}</span>
    </div>

    <div className="stat-row">
      <span>{stats.homeShots}</span>
      <span className="stat-label">Shots</span>
      <span>{stats.awayShots}</span>
    </div>

    <div className="stat-row">
      <span>{stats.homeShotsOnTarget}</span>
      <span className="stat-label">Shots on target</span>
      <span>{stats.awayShotsOnTarget}</span>
    </div>

    <div className="stat-row">
      <span>{stats.homePossession}%</span>
      <span className="stat-label">Possession</span>
      <span>{stats.awayPossession}%</span>
    </div>

    <div className="stat-row">
      <span>{stats.homeCorners}</span>
      <span className="stat-label">Corners</span>
      <span>{stats.awayCorners}</span>
    </div>

    <div className="stat-row">
      <span>{stats.homeFouls}</span>
      <span className="stat-label">Fouls</span>
      <span>{stats.awayFouls}</span>
    </div>
  </section>

      <section className="commentary-panel">
  <p className="eyebrow">MATCH COMMENTARY</p>

  <div className="commentary-log">
    {commentaryLog.map((event, index) => (
      <p key={index} className="commentary-event">
        {event}
      </p>
    ))}
  </div>
</section>

      {matchOver && (
        <section className="full-time-report">
          <div className="report-heading">
            <p className="eyebrow">MATCH COMPLETE</p>
            <h2>FULL-TIME REPORT</h2>
          </div>

          <div className="report-result">
            <p>
              {homeScore > awayScore
                ? `${homeTeamName} WIN`
                : awayScore > homeScore
                  ? `${awayTeamName} WIN`
                  : "MATCH DRAWN"}
            </p>
            <strong>{homeScore} — {awayScore}</strong>
            <span>{homeTeamName} vs {awayTeamName}</span>
          </div>

          {Object.values(playerMatchStats).length > 0 && (() => {
            const rankedPlayers = Object.values(playerMatchStats).sort(
              (a, b) => b.impact - a.impact
            );
            const manOfTheMatch = rankedPlayers[0];
            const goalScorers = rankedPlayers.filter((item) => item.goals > 0);

            return (
              <>
                <div className="man-of-the-match">
                  <span className="report-kicker">⭐ MAN OF THE MATCH</span>
                  <h3>{manOfTheMatch.player.name}</h3>
                  <p>
                    {manOfTheMatch.team === "home" ? homeTeamName : awayTeamName}
                    {" · "}
                    Rating {Math.min(10, manOfTheMatch.impact).toFixed(1)}/10
                  </p>
                </div>

                <div className="report-section">
                  <h3>GOALSCORERS</h3>
                  {goalScorers.length > 0 ? (
                    <ul className="report-goals-list">
                      {goalScorers.map((item) => (
                        <li key={item.player.id}>
                          <span>{item.player.name}</span>
                          <strong>{item.goals} {item.goals === 1 ? "goal" : "goals"}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No goals scored in this match.</p>
                  )}
                </div>

                <div className="report-section">
                  <h3>PLAYER RATINGS</h3>
                  <div className="player-ratings-list">
                    {rankedPlayers.map((item) => (
                      <div className="report-player-rating" key={item.player.id}>
                        <span>{item.player.name}</span>
                        <small>
                          {item.team === "home" ? homeTeamName : awayTeamName}
                        </small>
                        <strong>{Math.min(10, item.impact).toFixed(1)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}

          <div className="report-section">
            <h3>FINAL MATCH STATISTICS</h3>
            <div className="stat-row">
              <span>{stats.homeShots}</span>
              <span className="stat-label">Shots</span>
              <span>{stats.awayShots}</span>
            </div>
            <div className="stat-row">
              <span>{stats.homeShotsOnTarget}</span>
              <span className="stat-label">Shots on target</span>
              <span>{stats.awayShotsOnTarget}</span>
            </div>
            <div className="stat-row">
              <span>{stats.homePossession}%</span>
              <span className="stat-label">Possession</span>
              <span>{stats.awayPossession}%</span>
            </div>
            <div className="stat-row">
              <span>{stats.homeCorners}</span>
              <span className="stat-label">Corners</span>
              <span>{stats.awayCorners}</span>
            </div>
            <div className="stat-row">
              <span>{stats.homeFouls}</span>
              <span className="stat-label">Fouls</span>
              <span>{stats.awayFouls}</span>
            </div>
          </div>
        </section>
      )}

      <div className="match-controls">
        {!matchOver ? (
          <button
            className="primary-button"
            onClick={simulateMatchChunk}
          >
            SIMULATE 5–10 MINUTES →
          </button>
        ) : (
          <button
            className="primary-button"
            onClick={() => setScreen("home")}
          >
            RETURN TO HOME →
          </button>
        )}
      </div>
    </main>
  )}

      </div>
    );
  }

  export default App;