import { Game, dbGames, dbEditions, Edition, createElement, dbPlayers, Player, isComplete } from './app';
import { getTeamName, getTeamAbbr, loadLogo } from './teams';

// function checkEditionComplete(id: string) {
//   const games = dbGames().filter((game: Game) => game.edition.id === id);
//   let complete = true;
//   games.forEach((game: Game) => {
//     if (!game.teams.home.goals || !game.teams.away.goals) {
//       complete = false;
//     }
//   });
//   return complete;
// }

// check if the game is saved with goals pushed to the DB
// function gameComplete(id: string) {
//   const game = findGame(id);
//   if (game.teams.away.goals && game.teams.home.goals) {
//     return true;
//   } else {
//     return false;
//   }
// };

// find teams in an edition
export function findTeamsInEdition(id: string) {
  const edition = dbEditions().find((item: Edition) => item.id === id).editionTeams;
  let teams: string[] = [];
  edition.forEach((team: any) => {
    teams.push(team.teamId);
  });
  return teams;
}

// find the game object using the game's ID
// function findGame(id: string) {
//   return dbGames().find((game: Game) => game.id === id);
// }

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
    RankingPoints: 0,
    Champion: 0,
    TopScorer: 0,
    Participation: 1
  };

  return result;
};

export function editionTable(id: string) {
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
  results.forEach((item,index) => {
    if (index === 0) {
      item.RankingPoints = results.length + 1
      item.Champion = 1
    } else {
      item.RankingPoints = results.length - index
    }
  })
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
  colgroups.setAttribute('span', '12');
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

  team.setAttribute('colspan', '3')

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
    const logo = createElement({ tag: 'td', classes: 'edition-result-logo'})
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

    const abbr = getTeamAbbr(team.teamId).toUpperCase()

    item.appendChild(place);
    item.appendChild(logo)
    logo.appendChild(loadLogo(abbr))
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
    name.innerText = `${getTeamName(team.teamId).toUpperCase()}`
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

export function getPlayerName(id: string) {
  const players = dbPlayers().find((player: Player) => player.id === id);
  let name = players ? players.name : 'OWN GOAL'
  return name
}

function goalScorers(id: string) {
  const edition = getEditionResults(id)
  if (!edition) return ''
  let scorers: any[] = [];
  edition.forEach((game: any) => {
    game.HomeScorers.forEach((scorer: any) => {
      scorers.push(scorer.goal);
    })
    game.AwayScorers.forEach((scorer: any) => {
      scorers.push(scorer.goal);
    })
  })
  let count = scorers.reduce((acc, curr) => {
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
  const sorted = topScorers.sort((a: any, b: any) => b.count - a.count)
  sorted.forEach((item) => {
    const teamName = getPlayerEditionTeam(id, item.name)
    item.teamName = teamName
  })
  return sorted;
}

// let scorersObj = () => {
//   const ed = dbEditions()
//   ed.forEach((item:Edition) => {
//     const scores = goalScorers(item.id)
//     return scores 
//       ? addTeamToGoalScorer(item.id) 
//       : null
//   })
//   console.log(ed)
//   return ed
// }
// scorersObj()

// function addTeamToGoalScorer(id:string) {
  // const scores = goalScorers(id)
  // return scores.forEach((item) => {
  //   let teamId = ''
  //   item.name === 'own goal'
  //     ? teamId = ''
  //     : teamId = getPlayerEditionTeam(id, item.name)
  //   return item = {...item, teamId }
  // })
// }


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
function getPlayerEditionTeam(editionId: string, playerId: string) {
  const edition = dbEditions().find((edition: Edition) => edition.id === editionId)
  const teams = edition.editionTeams
  let name: string
  teams.forEach((team: any) => {
    let teamId = team.teamId
    team.roster.forEach((player: Edition) => {
      if (player.id === playerId) {
        return name = teamId
      }
    })
  })
  return name
  }

function createPlayerStatsTable(type: string) {
  const table = createElement({ tag: 'table', classes: 'edition-player-stats-table' });
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

  stat.innerText = type === 'G' ? `GOALS` : `ASSISTS`

  return table
}

export function renderPlayerStats(id: string) {

  const container = createElement({ tag: 'div', classes: 'playerStatsContainer'});
  container.classList.add('hidden')
  const goalContainer = createElement({ tag: 'div', classes: 'goalContainer'});
  const goalsTable = createPlayerStatsTable('G');
  const assistContainer = createElement({ tag: 'div', classes: 'assistContainer'});
  const assistsTable = createPlayerStatsTable('A');
  const goals = goalScorers(id) 
  const assists = goalAssisters(id);
  if (goals) {
  goals.forEach((goal, index) => { 
    if (index <= 9) {
      const playerGoalContainer = createElement({ tag: 'tr', classes: 'playerStatContainer'});
      const idx = createElement({ tag: 'td', classes: 'playerStatIndex'});
      const name = createElement({ tag: 'td', classes: 'playerStatName'});
      const team = createElement({ tag: 'td', classes: 'playerStatTeam'});
      const count = createElement({ tag: 'td', classes: 'playerStatCount'});
      const playerName = getPlayerName(goal.name)
      const playerTeam = getTeamAbbr(getPlayerEditionTeam(id,goal.name))
      idx.innerText = `${index+1}.`;
      if (playerName) name.innerText = `${playerName.toUpperCase()}`;
      if (playerTeam) team.innerText = `( ${playerTeam.toUpperCase()} )`;
      count.innerText = `${goal.count}`;
      playerGoalContainer.appendChild(idx);
      playerGoalContainer.appendChild(name);
      playerGoalContainer.appendChild(team);
      playerGoalContainer.appendChild(count);
      goalsTable.appendChild(playerGoalContainer);
    }
  })
  assists.forEach((assist, index) => {
    if (assist.name !== '') {
      if (index <= 10) {
        const playerAssistContainer = createElement({ tag: 'tr', classes: 'playerStatContainer'});
        const idx = createElement({ tag: 'td', classes: 'playerStatIndex'});
        const name = createElement({ tag: 'td', classes: 'playerStatName'});
        const team = createElement({ tag: 'td', classes: 'playerStatTeam'});
        const count = createElement({ tag: 'td', classes: 'playerStatCount'});
        const playerName = getPlayerName(assist.name)
        const playerTeam = getTeamAbbr(getPlayerEditionTeam(id,assist.name))
        idx.innerText = `${index+1}.`;
        if (playerName) name.innerText = `${playerName.toUpperCase()}`;
        if (playerTeam) team.innerText = `( ${playerTeam.toUpperCase()} )`;
        count.innerText = `${assist.count}`;
        playerAssistContainer.appendChild(idx);
        playerAssistContainer.appendChild(name);
        playerAssistContainer.appendChild(team);
        playerAssistContainer.appendChild(count);
        assistsTable.appendChild(playerAssistContainer);
      }
    }
  })
  }
  goalContainer.appendChild(goalsTable);
  assistContainer.appendChild(assistsTable);
  container.appendChild(goalContainer);
  container.appendChild(assistContainer);
  return container;
}
