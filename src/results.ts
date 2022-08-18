import { Game, dbGames, dbEditions, Edition, createElement, dbPlayers, Player } from './app';
import { getTeamName, getTeamAbbr } from './teams';

const c = console.log.bind(console);

const ed = '8a7b308b-53ac-4b92-8ff3-aa2cfd0efa6b';
const ed1 = '8d6a57a9-9702-4fd6-b40f-c8b757a4e92c'
const ed2 = '629e4448-e671-4746-bc87-5aaacf0fc2ae'
const team1 = "c18c11d6-3a72-4868-9e13-9f5cca029be4"
const team2 = "44359fe0-bd0a-4240-a9a2-0d842c14bf1c"
const team3 = "053da6dd-1ea0-4404-929e-7cb0e1bf5c43"
const team4 = "df2c0a96-e1b2-44db-8e1d-86de50618ebe"



function checkEditionComplete(id: string) {
  const games = dbGames().filter((game: Game) => game.edition.id === id);
  let complete = true;
  games.forEach((game: Game) => {
    if (!game.teams.home.goals || !game.teams.away.goals) {
      complete = false;
    }
  });
  return complete;
}

// check if the game is saved with goals pushed to the DB
function gameComplete(id: string) {
  const game = findGame(id);
  if (game.teams.away.goals && game.teams.home.goals) {
    return true;
  } else {
    return false;
  }
};

// find teams in an edition
function findTeamsInEdition(id: string) {
  const edition = dbEditions().find(
    (item: Edition) => item.id === id,
  ).editionTeams;
  let teams: string[] = [];
  edition.forEach((team: any) => {
    teams.push(team.teamId);
  });
  return teams;
}

// find the game object using the game's ID
function findGame(id: string) {
  const game = dbGames().find((game: Game) => game.id === id);
  return game;
}

function getEditionResults(id: string) {
  const results: any[] = [];

  const games = dbGames().filter((game: Game) => game.edition.id === id);

  games.forEach((game: Game) => {
    if (game.teams.home.goals && game.teams.away.goals) {
      const gameId = game.id;
      const edition = game.edition.id;
      const home = game.teams.home.id;
      const away = game.teams.away.id;
      const homegoals = game.teams.home.goals;
      const awaygoals = game.teams.away.goals;
      const homescorer = game.teams.home.whoScored || [];
      const homeassister = game.teams.home.whoAssisted || [];
      const awayscorer = game.teams.away.whoScored || [];
      const awayassister = game.teams.away.whoAssisted || [];

      let homeGoalMen: { goal: string; assist: string }[] = [];
      let awayGoalMen: { goal: string; assist: string }[] = [];
      if (homescorer) {
        for (let i = 0; i < homescorer.length; i++) {
          let homeGoaler = '';
          let homeAssister = '';
          if (homeassister[i]) {
            homeGoaler = homescorer[i];
            homeAssister = homeassister[i];
          }
          if (!homeassister[i]) {
            homeGoaler = homescorer[i];
          }
          homeGoalMen.push({ goal: homeGoaler, assist: homeAssister });
        }
      }
      if (awayscorer) {
        for (let i = 0; i < awayscorer.length; i++) {
          let awayGoaler = '';
          let awayAssister = '';
          if (awayassister[i]) {
            awayGoaler = awayscorer[i];
            awayAssister = awayassister[i];
          }
          if (!awayassister[i]) {
            awayGoaler = awayscorer[i];
          }
          awayGoalMen.push({ goal: awayGoaler, assist: awayAssister });
        }
      }
      results.push({
        Edition: edition,
        Game: gameId,
        HomeTeam: home,
        HomeGoals: homegoals,
        HomeScorers: homeGoalMen,
        AwayTeam: away,
        AwayGoals: awaygoals,
        AwayScorers: awayGoalMen,
      });
    }
  });
  return results;
}




function teamResults(id: string, editionId: string) {
  const results = getEditionResults(editionId);

  const teamHome = results.filter((item) => item.HomeTeam === id);
  const homeGames = teamHome.filter((goal) => goal.HomeGoals !== null);
  const homeGamesPlayed = homeGames.length;
  const homeGoals = teamHome.map((x) => x.HomeGoals).reduce((a, b) => a + parseInt(b), 0);
  const homeGoalsAllowed = teamHome.map((x) => x.AwayGoals).reduce((a, b) => a + parseInt(b), 0);
  const homeWins = homeGames.filter((item) => item.HomeGoals > item.AwayGoals).length;
  const homeLoss = homeGames.filter((item) => item.HomeGoals < item.AwayGoals).length;
  const homeDraw = homeGames.filter((item) => item.HomeGoals === item.AwayGoals).length;

  const teamAway = results.filter((item) => item.AwayTeam === id);
  const awayGames = teamAway.filter((goal) => goal.AwayGoals !== null);
  const awayGamesPlayed = teamAway.length;
  const awayGoals = teamAway.map((x) => x.AwayGoals).reduce((a, b) => a + parseInt(b), 0);
  const awayGoalsAllowed = teamAway.map((x) => x.HomeGoals).reduce((a, b) => a + parseInt(b), 0);
  const awayWins = awayGames.filter((item) => item.AwayGoals > item.HomeGoals).length;
  const awayLoss = awayGames.filter((item) => item.HomeGoals > item.AwayGoals).length;
  const awayDraw = awayGames.filter((item) => item.HomeGoals === item.AwayGoals).length;

  const gamesPlayed = homeGamesPlayed + awayGamesPlayed;
  const possiblePoints = gamesPlayed * 3
  const wins = homeWins + awayWins;
  const draws = homeDraw + awayDraw;
  const defeats = homeLoss + awayLoss;
  const goals = homeGoals + awayGoals;
  const goalsAllowed = homeGoalsAllowed + awayGoalsAllowed;
  const netGoals = goals - goalsAllowed;
  const points = wins * 3 + draws;
  const percentage = Math.round((points / possiblePoints) * 100) || 0;

  const result = {
    teamId: id,
    Points: points,
    Games: gamesPlayed,
    Wins: wins,
    Draws: draws,
    Defeats: defeats,
    GoalsScored: goals,
    GoalsAgainst: goalsAllowed,
    NetGoals: netGoals,
    PointsPercentage: percentage,
    Tiebreaker: 0,
  };

  return result;
};

function editionTable(id: string) {
  const edition = findTeamsInEdition(id)
  const results: any[] = [];
  edition.forEach((team: string) => {
    let result = teamResults(team, id)
    results.push(result)
  })
  results.sort((a, b) => b.Points - a.Points || b.Wins - a.Wins || b.NetGoals - a.NetGoals)
  let team1: string
  let team2: string
  let breaker: string
  results.forEach((item,index) => {
    if (results[index + 1]) {
      if (item.Points === results[index + 1].Points) {
        team1 = item.teamId
        team2 = results[index + 1].teamId
        breaker = tiebreaker(id,team1,team2)
        if (breaker === team1) {
          item.Tiebreaker = 1
        } else {
          results[index + 1].Tiebreaker = 1
        }
      }
    }
  })
  results.sort((a, b) => b.Points - a.Points || b.Tiebreaker - a.Tiebreaker || b.Wins - a.Wins || b.NetGoals - a.NetGoals)
  return results
}

function tiebreaker(editionId: string, team1: string, team2: string) {
  const games = dbGames().filter((game: Game) => game.edition.id === editionId)
  const matches = games.filter((game: Game) => ((game.teams.home.id === team1 && game.teams.away.id === team2) || (game.teams.home.id === team2 && game.teams.away.id === team1)))
  let results: any[] = [];
  for (let i = 0; i < matches.length; i++) {
    const home = matches[i].teams.home.id;
    const away = matches[i].teams.away.id;
    const homegoals = matches[i].teams.home.goals;
    const awaygoals = matches[i].teams.away.goals;
    if (homegoals > awaygoals) {
      results.push({
        Winner: home,
        netGoals: homegoals - awaygoals,
      });
    } else {
      results.push({
        Winner: away,
        netGoals: awaygoals - homegoals,
      });
    }
  }
  results.sort((a, b) => b.netGoals - a.netGoals)
  return results[0].Winner
}

function createResultsTable() {
  const table = createElement({ tag: 'table', classes: 'table'});
  const colgroups = createElement({ tag: 'colgroup', classes: 'results-table-colgroup'});
  colgroups.setAttribute('span', '11');
  const headerRow = createElement({ tag: 'tr', classes: 'table-header'});
  const team = createElement({ tag: 'th', classes: 'table-header-name'});
  const points = createElement({ tag: 'th', classes: 'table-header-items'})
  const games = createElement({ tag: 'th', classes: 'table-header-items'})
  const wins = createElement({ tag: 'th', classes: 'table-header-items'})
  const draws = createElement({ tag: 'th', classes: 'table-header-items'})
  const defeats = createElement({ tag: 'th', classes: 'table-header-items'})
  const goals = createElement({ tag: 'th', classes: 'table-header-items'})
  const goalsAgainst = createElement({ tag: 'th', classes: 'table-header-items'})
  const netGoals = createElement({ tag: 'th', classes: 'table-header-items'})
  const pointsPercentage = createElement({ tag: 'th', classes: 'table-header-items'})
  
  team.innerText = `TEAM`;
  points.innerText = `P`
  games.innerText = `G`
  wins.innerText = `W`
  draws.innerText = `D`
  defeats.innerText = `L`
  goals.innerText = `GP`;
  goalsAgainst.innerText = `GA`;
  netGoals.innerText = `GD`;
  pointsPercentage.innerText = `%`;

  headerRow.appendChild(team);
  headerRow.appendChild(points);
  headerRow.appendChild(games);
  headerRow.appendChild(wins);
  headerRow.appendChild(draws);
  headerRow.appendChild(defeats);
  headerRow.appendChild(goals);
  headerRow.appendChild(goalsAgainst);
  headerRow.appendChild(netGoals);
  headerRow.appendChild(pointsPercentage);
  table.appendChild(headerRow);

  return table
}

export function renderEditionResults(id: string) {
  const tableAndGoals = createElement({ tag: 'div', classes: 'tableContainer'});
  const results = editionTable(id)
  const table = createResultsTable()
  results.forEach((team, index) => {
    const item = createElement({ tag: 'tr', classes: 'listedResult' });
    const place = createElement({ tag: 'td', classes: 'edition-result-index' });
    const name = createElement({ tag: 'td', classes: 'edition-result-name' })
    const points = createElement({ tag: 'td', classes: 'edition-result-line' })
    const games = createElement({ tag: 'td', classes: 'edition-result-line' })
    const wins = createElement({ tag: 'td', classes: 'edition-result-line' })
    const draws = createElement({ tag: 'td', classes: 'edition-result-line' })
    const defeats = createElement({ tag: 'td', classes: 'edition-result-line' })
    const goals = createElement({ tag: 'td', classes: 'edition-result-line' })
    const goalsAllowed = createElement({ tag: 'td', classes: 'edition-result-line' })
    const netGoals = createElement({ tag: 'td', classes: 'edition-result-line' })
    const percentage = createElement({ tag: 'td', classes: 'edition-result-line' })
  
    item.appendChild(place);
    item.appendChild(name)
    item.appendChild(points)
    item.appendChild(games)
    item.appendChild(wins)
    item.appendChild(draws)
    item.appendChild(defeats)
    item.appendChild(goals)
    item.appendChild(goalsAllowed)
    item.appendChild(netGoals)
    item.appendChild(percentage)
    table.appendChild(item)
  
    place.innerText = `${index + 1}.`
    name.innerText = `${getTeamName(team.teamId)}`
    points.innerText = `${team.Points}`
    games.innerText = `${team.Games}`
    wins.innerText = `${team.Wins}`
    draws.innerText = `${team.Draws}`
    defeats.innerText = `${team.Defeats}`
    goals.innerText = `${team.GoalsScored}`
    goalsAllowed.innerText = `${team.GoalsAgainst}`
    netGoals.innerText = `${team.NetGoals}`
    percentage.innerText = `${team.PointsPercentage}%`
  })

  tableAndGoals.appendChild(table)
  return tableAndGoals
}

function getPlayerName(id: string) {
  const players = dbPlayers().find((player: Player) => player.id === id);
  return players.name
}

// function getPlayerTeam(id: string) {
//   const player = 
//   const edition = dbEditions().editionTeams.find((player: Player) => player.id === id)
//   return players.team
// }


function goalScorers(id: string) {
  const edition = getEditionResults(id)
  let scorers: any[] = [];
  edition.forEach((game: any) => {
    game.HomeScorers.forEach((scorer: any) => {
      scorers.push(scorer.goal);
    })
    game.AwayScorers.forEach((scorer: any) => {
      scorers.push(scorer.goal);
    })
  })
  let count = scorers.reduce(function(acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1),
    acc
  } , {})
  let topScorers: any[] = [];
  for (let key in count) {
    topScorers.push({
      name: key,
      count: count[key]
    })
  }
  topScorers.sort((a: any, b: any) => b.count - a.count)
  return topScorers;
}
 
function goalAssisters(id: string) {
  const edition = getEditionResults(id)
  let assisters: any[] = [];
  edition.forEach((game: any) => {
    game.HomeScorers.forEach((scorer: any) => {
      assisters.push(scorer.assist);
    })
    game.AwayScorers.forEach((scorer: any) => {
      assisters.push(scorer.assist);
    })
  }
  )
  let count = assisters.reduce(function(acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1),
    acc
  } , {})
  let topAssisters: any[] = [];
  for (let key in count) {
    topAssisters.push({
      name: key,
      count: count[key]
    })
  }
  topAssisters.sort((a: any, b: any) => b.count - a.count)
  return topAssisters;
}

// function to find player's team in this edition
const getPlayerEditionTeam = (editionId: string, playerId: string) => {
  const edition = dbEditions().find((edition: Edition) => edition.id === editionId)
  const teams = edition.editionTeams
  let name
  teams.forEach((team: any) => {
    let teamId = team.teamId
    team.roster.forEach((player) => {
      if (player.id === playerId) {
        return name = teamId
      }
    })
  })
  return getTeamAbbr(name)
  }

function createPlayerStatsTable(type: string) {
  const table = createElement({ tag: 'table', classes: 'table' });
  const colgroups = createElement({ tag: 'colgroup' });
  colgroups.setAttribute('span', '4')
  const headerRow = createElement({ tag: 'tr', classes: 'edition-player-stats-header' });
  const place = createElement({ tag: 'th', classes: 'edition-player-stats-header-index' });
  const name = createElement({ tag: 'th', classes: 'edition-player-stats-header-name' });
  const team = createElement({ tag: 'th', classes: 'edition-player-stats-header-team' });
  const stat = createElement({ tag: 'th', classes: 'edition-player-stats-header-stat' });
  headerRow.appendChild(place);
  headerRow.appendChild(name);
  headerRow.appendChild(team);
  headerRow.appendChild(stat);
  table.appendChild(headerRow);

  // name.innerText = `PLAYER`
  // team.innerText = `TEAM`
  if (type === 'G') {
    stat.innerText = `GOALS`
  } else {
    stat.innerText = `ASSISTS`
  }

  return table
}


export function renderPlayerStats(id: string) {
  const container = createElement({ tag: 'div', classes: 'playerStatsContainer'});
  const goalContainer = createElement({ tag: 'div', classes: 'goalContainer'});
  const goalsTable = createPlayerStatsTable('G');
  const assistContainer = createElement({ tag: 'div', classes: 'assistContainer'});
  const assistsTable = createPlayerStatsTable('A');
  const goals = goalScorers(id);
  const assists = goalAssisters(id);
  goals.forEach((goal, index) => {
    const playerGoalContainer = createElement({ tag: 'tr', classes: 'playerStatContainer'});
    const idx = createElement({ tag: 'td', classes: 'playerStatIndex'});
    const name = createElement({ tag: 'td', classes: 'playerStatName'});
    const team = createElement({ tag: 'td', classes: 'playerStatTeam'});
    const count = createElement({ tag: 'td', classes: 'playerStatCount'});
    idx.innerText = `${index+1}.`;
    name.innerText = `${getPlayerName(goal.name).toUpperCase()}`;
    team.innerText = `( ${getPlayerEditionTeam(id,goal.name)} )`;
    count.innerText = `${goal.count}`;
    playerGoalContainer.appendChild(idx);
    playerGoalContainer.appendChild(name);
    playerGoalContainer.appendChild(team);
    playerGoalContainer.appendChild(count);
    goalsTable.appendChild(playerGoalContainer);
    })
  assists.forEach((assist, index) => {
    if (assist.name !== '') {
    const playerAssistContainer = createElement({ tag: 'tr', classes: 'playerStatContainer'});
    const idx = createElement({ tag: 'td', classes: 'playerStatIndex'});
    const name = createElement({ tag: 'td', classes: 'playerStatName'});
    const team = createElement({ tag: 'td', classes: 'playerStatTeam'});
    const count = createElement({ tag: 'td', classes: 'playerStatCount'});
    idx.innerText = `${index}.`;
    name.innerText = `${getPlayerName(assist.name).toUpperCase()}`;
    team.innerText = `( ${getPlayerEditionTeam(id,assist.name)} )`;
    count.innerText = `${assist.count}`;
    playerAssistContainer.appendChild(idx);
    playerAssistContainer.appendChild(name);
    playerAssistContainer.appendChild(team);
    playerAssistContainer.appendChild(count);
    assistsTable.appendChild(playerAssistContainer);
    }
  })
  goalContainer.appendChild(goalsTable);
  assistContainer.appendChild(assistsTable);
  container.appendChild(goalContainer);
  container.appendChild(assistContainer);
  return container;
}