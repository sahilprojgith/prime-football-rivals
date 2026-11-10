
import { useEffect, useState } from "react";
import "./MatchScreen.css";
import { simulateMatch } from "./matchEngine";

export default function MatchScreen({
  homePlayers,
  awayPlayers,
  homeTeam = "Prime FC",
  awayTeam = "Rival FC",
  difficulty = "normal",
  onBack,
}) {
  const [match, setMatch] = useState(null);
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!playing || finished) return;

    const timer = setInterval(() => {
      setMinute((current) => {
        if (current >= 90) {
          setPlaying(false);
          setFinished(true);
          return 90;
        }

        return current + 1;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [playing, finished]);

  useEffect(() => {
    if (!match || minute === 0) return;

    // Match events are generated before the match begins.
    // This effect only advances the displayed match clock.
  }, [match, minute]);

  const startMatch = () => {
    const result = simulateMatch({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
      difficulty,
    });

    setMatch(result);
    setMinute(0);
    setFinished(false);
    setPlaying(true);
  };

  const resetMatch = () => {
    setMatch(null);
    setMinute(0);
    setPlaying(false);
    setFinished(false);
  };

  const visibleEvents = match
    ? match.events.filter((event) => event.minute <= minute)
    : [];

  const latestEvent = visibleEvents[visibleEvents.length - 1];

  return (
    <div className="match-screen">
      <header className="match-header">
        <div>
          <p className="eyebrow">MATCH DAY</p>
          <h1>{finished ? "FULL TIME" : "MATCH CENTRE"}</h1>
        </div>

        <button className="secondary-button" onClick={onBack}>
          ← BACK
        </button>
      </header>

      {!match ? (
        <section className="match-preview">
          <div className="match-team">
            <h2>{homeTeam}</h2>
            <p>{homePlayers?.length || 0} players</p>
          </div>

          <div className="match-vs">VS</div>

          <div className="match-team">
            <h2>{awayTeam}</h2>
            <p>{awayPlayers?.length || 0} players</p>
          </div>

          <button
            className="primary-button"
            onClick={startMatch}
            disabled={
              homePlayers?.length !== 11 ||
              awayPlayers?.length !== 11
            }
          >
            KICK OFF
          </button>
        </section>
      ) : (
        <>
          <section className="scoreboard">
            <div className="score-team">
              <h2>{match.homeTeam}</h2>
              <span>{match.homeRating} OVR</span>
            </div>

            <div className="score">
              <strong>
                {match.homeGoals} - {match.awayGoals}
              </strong>
              <span>{finished ? "FT" : `${minute}'`}</span>
            </div>

            <div className="score-team">
              <h2>{match.awayTeam}</h2>
              <span>{match.awayRating} OVR</span>
            </div>
          </section>

          <section className="match-stats">
            <h2>Match Statistics</h2>

            <div className="stat-row">
              <span>{match.homePossession}%</span>
              <span>Possession</span>
              <span>{match.awayPossession}%</span>
            </div>

            <div className="stat-row">
              <span>{match.homeShots}</span>
              <span>Shots</span>
              <span>{match.awayShots}</span>
            </div>

            <div className="stat-row">
              <span>{match.homeShotsOnTarget}</span>
              <span>Shots on Target</span>
              <span>{match.awayShotsOnTarget}</span>
            </div>
          </section>

          <section className="commentary">
            <h2>Match Commentary</h2>

            {latestEvent ? (
              <p className="latest-event">
                {latestEvent.minute}' — {latestEvent.message}
              </p>
            ) : (
              <p>Kickoff! The match is underway.</p>
            )}

            <div className="event-list">
              {visibleEvents
                .slice()
                .reverse()
                .map((event) => (
                  <div key={event.id} className="event-item">
                    <span>{event.minute}'</span>
                    <p>{event.message}</p>
                  </div>
                ))}
            </div>
          </section>

          <div className="match-controls">
            {!finished ? (
              <button
                className="primary-button"
                onClick={() => setPlaying((current) => !current)}
              >
                {playing ? "PAUSE MATCH" : "RESUME MATCH"}
              </button>
            ) : (
              <button
                className="primary-button"
                onClick={resetMatch}
              >
                PLAY AGAIN
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
