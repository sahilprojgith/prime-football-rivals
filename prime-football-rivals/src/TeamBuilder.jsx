
import { useState } from "react";
import { formations } from "./formations";
import "./TeamBuilder.css";

function TeamBuilder({ squad, onBack, onStartMatch }) {
  const [formationName, setFormationName] = useState("4-3-3");
  const [lineup, setLineup] = useState(
    Array(11).fill(null)
  );

  const formation = formations[formationName];

  const assignedPlayerIds = lineup
    .filter(Boolean)
    .map((player) => player.id);

  const availablePlayers = squad.filter(
    (player) => !assignedPlayerIds.includes(player.id)
  );

  const assignPlayer = (slotIndex, playerId) => {
    const player = squad.find(
      (item) => item.id === Number(playerId)
    );

    if (!player) return;

    setLineup((currentLineup) => {
      const updatedLineup = [...currentLineup];

      // Remove this player from any previous position.
      const previousIndex = updatedLineup.findIndex(
        (item) => item?.id === player.id
      );

      if (previousIndex !== -1) {
        updatedLineup[previousIndex] = null;
      }

      updatedLineup[slotIndex] = player;

      return updatedLineup;
    });
  };

  const removePlayerFromSlot = (slotIndex) => {
    setLineup((currentLineup) => {
      const updatedLineup = [...currentLineup];
      updatedLineup[slotIndex] = null;
      return updatedLineup;
    });
  };

  const selectedCount = lineup.filter(Boolean).length;

  const teamRating =
    selectedCount === 0
      ? 0
      : Math.round(
          lineup
            .filter(Boolean)
            .reduce((total, player) => total + player.rating, 0) /
            selectedCount
        );

  return (
    <main className="team-builder-page">
      <header className="team-builder-header">
        <div>
          <p className="eyebrow">SQUAD MANAGEMENT</p>
          <h1>BUILD YOUR STARTING XI</h1>
          <p>
            Select your formation and assign players to the pitch.
          </p>
        </div>

        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
      </header>

      <section className="team-builder-controls">
        <label>
          FORMATION

          <select
            value={formationName}
            onChange={(event) => {
              setFormationName(event.target.value);
              setLineup(Array(11).fill(null));
            }}
          >
            {Object.keys(formations).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="team-rating">
          <span>TEAM RATING</span>
          <strong>{teamRating}</strong>
        </div>

        <div className="players-count">
          {selectedCount} / 11 PLAYERS
        </div>
      </section>

      <div className="team-builder-layout">
        <section className="football-pitch">
          <div className="pitch-halfway-line" />
          <div className="pitch-center-circle" />
          <div className="pitch-center-dot" />

          <div className="pitch-penalty-area pitch-top">
            <div className="pitch-goal" />
          </div>

          <div className="pitch-penalty-area pitch-bottom">
            <div className="pitch-goal" />
          </div>

          {formation.map((slot, index) => {
            const player = lineup[index];

            return (
              <div
                className="formation-slot"
                key={`${formationName}-${index}`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                }}
              >
                <div className="player-position">
                  {slot.position}
                </div>

                <select
                  value={player?.id ?? ""}
                  onChange={(event) =>
                    assignPlayer(index, event.target.value)
                  }
                  aria-label={`Select player for ${slot.position}`}
                >
                  <option value="">Choose player</option>

                  {squad.map((squadPlayer) => (
                    <option
                      key={squadPlayer.id}
                      value={squadPlayer.id}
                      disabled={
                        assignedPlayerIds.includes(squadPlayer.id) &&
                        player?.id !== squadPlayer.id
                      }
                    >
                      {squadPlayer.name} ({squadPlayer.rating})
                    </option>
                  ))}
                </select>

                {player && (
                  <div className="pitch-player-card">
                    <strong>{player.rating}</strong>
                    <span>{player.name}</span>

                    <button
                      onClick={() => removePlayerFromSlot(index)}
                      aria-label={`Remove ${player.name}`}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <aside className="team-builder-sidebar">
          <h2>Your Squad</h2>

          <p>
            {availablePlayers.length} players available
          </p>

          {squad.length === 0 ? (
            <p>
              Your squad is empty. Go back and add players first.
            </p>
          ) : (
            <div className="squad-list">
              {squad.map((player) => {
                const isAssigned = assignedPlayerIds.includes(
                  player.id
                );

                return (
                  <div
                    className={`squad-list-player ${
                      isAssigned ? "assigned" : ""
                    }`}
                    key={player.id}
                  >
                    <div>
                      <strong>{player.name}</strong>
                      <span>
                        {player.position} · {player.rating}
                      </span>
                    </div>

                    <span>
                      {isAssigned ? "ON PITCH" : "AVAILABLE"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

            <div className="start-match-action">
        <button
          className="primary-button"
          disabled={selectedCount !== 11}
          onClick={() => onStartMatch(lineup)}
        >
          START MATCH →
        </button>

        <p>
          {selectedCount !== 11
            ? `Assign ${11 - selectedCount} more player(s) to your Starting XI.`
            : "Your Starting XI is ready. Kick off!"}
        </p>
      </div>
      
    </main>
  );
}

export default TeamBuilder;
