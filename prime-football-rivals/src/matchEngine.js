
const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const randomBetween = (min, max) =>
  Math.random() * (max - min) + min;

const choose = (items) =>
  items[Math.floor(Math.random() * items.length)];

const getTeamRating = (players) => {
  if (!players?.length) return 0;

  const total = players.reduce(
    (sum, player) => sum + Number(player.rating || 0),
    0
  );

  return Math.round(total / players.length);
};

const getRandomPlayer = (players, position = null) => {
  const eligible = position
    ? players.filter((player) => player.position === position)
    : players;

  return choose(eligible.length ? eligible : players);
};

const createEvent = (minute, type, message, team, player = null) => ({
  id: `${minute}-${type}-${Math.random()}`,
  minute,
  type,
  message,
  team,
  player,
});

export function simulateMatch({
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  difficulty = "normal",
}) {
  const homeRating = getTeamRating(homePlayers);
  const awayRating = getTeamRating(awayPlayers);

  const difficultyMultiplier = {
    easy: 0.85,
    normal: 1,
    hard: 1.15,
  }[difficulty] || 1;

  const homeStrength = homeRating;
  const awayStrength = awayRating * difficultyMultiplier;

  let homeGoals = 0;
  let awayGoals = 0;

  let homeShots = 0;
  let awayShots = 0;

  let homeShotsOnTarget = 0;
  let awayShotsOnTarget = 0;

  let homePossession = 50;

  const events = [];

  for (let minute = 1; minute <= 90; minute++) {
    // Possession changes slightly throughout the match.
    homePossession = clamp(
      homePossession + randomBetween(-5, 5),
      25,
      75
    );

    const homeHasBall = Math.random() < homePossession / 100;

    const attackingTeam = homeHasBall
      ? homeTeam
      : awayTeam;

    const attackingPlayers = homeHasBall
      ? homePlayers
      : awayPlayers;

    const defendingPlayers = homeHasBall
      ? awayPlayers
      : homePlayers;

    const attackRating = homeHasBall
      ? homeStrength
      : awayStrength;

    const defendingRating = homeHasBall
      ? awayStrength
      : homeStrength;

    // Each minute has a chance of producing a shot.
    const shotChance = 0.12 + (attackRating - defendingRating) * 0.002;

    if (Math.random() > clamp(shotChance, 0.08, 0.24)) {
      continue;
    }

    const shooter = getRandomPlayer(attackingPlayers, "FWD");

    if (homeHasBall) {
      homeShots++;
    } else {
      awayShots++;
    }

    events.push(
      createEvent(
        minute,
        "shot",
        `${shooter.name} takes a shot for ${attackingTeam}.`,
        attackingTeam,
        shooter
      )
    );

    // A shot has a chance of being on target.
    const onTargetChance = clamp(
      0.35 + (Number(shooter.rating || 70) - 75) * 0.01,
      0.2,
      0.7
    );

    if (Math.random() > onTargetChance) {
      events.push(
        createEvent(
          minute,
          "miss",
          `${shooter.name} misses the target.`,
          attackingTeam,
          shooter
        )
      );
      continue;
    }

    if (homeHasBall) {
      homeShotsOnTarget++;
    } else {
      awayShotsOnTarget++;
    }

    const goalkeeper = getRandomPlayer(defendingPlayers, "GK");

    // Better shooters and weaker goalkeepers increase scoring chance.
    const scoringChance = clamp(
      0.25 +
        (Number(shooter.rating || 70) - Number(goalkeeper.rating || 70)) *
          0.015,
      0.08,
      0.65
    );

    if (Math.random() < scoringChance) {
      if (homeHasBall) {
        homeGoals++;
      } else {
        awayGoals++;
      }

      events.push(
        createEvent(
          minute,
          "goal",
          `GOAL! ${shooter.name} scores for ${attackingTeam}!`,
          attackingTeam,
          shooter
        )
      );
    } else {
      events.push(
        createEvent(
          minute,
          "save",
          `${goalkeeper.name} makes a save!`,
          homeHasBall ? awayTeam : homeTeam,
          goalkeeper
        )
      );
    }
  }

  // Keep events in chronological order.
  events.sort((a, b) => a.minute - b.minute);

  return {
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    homeRating,
    awayRating,
    homeShots,
    awayShots,
    homeShotsOnTarget,
    awayShotsOnTarget,
    homePossession: Math.round(homePossession),
    awayPossession: 100 - Math.round(homePossession),
    events,
  };
}
