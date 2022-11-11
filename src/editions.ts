import { v4 as uuidv4 } from 'uuid';
import {
  formSubmit,
  Game,
  dbGames,
  saveGame,
  saveEditionList,
  saveEdition,
  dbEditions,
  Player,
  Edition,
  TeamPairings,
  createElement,
  isComplete,
  emptyMessage,
} from './app';
import { listTeams, getTeamName, getRoster } from './teams';
import { renderEditionResults, renderPlayerStats, editionTable } from './results'

// TODO make sure nothing else happens when an edition is created and is active ( create active and inactive state of editions )
// TODO create a 'pause edition' function that will disable the edition and make it inactive
// TODO make sure no teams can transfer players and no players or team can be deleted, but teams/players can be created
// TODO make sure users can input a drawn game with no goals

// make a randomized list from selected teams
let editionList: string[] = [];

export function generateTeamsList(id: string) {
  editionList.push(id);
  toggleNextEditionButton(id);
  toggleNewEditionButton();
  saveEditionList(editionList);
  return editionList;
}

// function that generates the games table
function genGamesTable() {
  editionList.sort(() => Math.random() - 0.5);

  if (editionList.length % 2 == 1) {
    editionList.push(null!);
  }

  const playerCount = editionList.length;
  const rounds = playerCount - 1;
  const half = playerCount / 2;

  const tournamentPairings: TeamPairings[][] = [];
  const playerIndexes = editionList.map((_, i) => i).slice(1);

  const checkbox = document.getElementById(
    'checkboxDoubleRound',
  ) as HTMLInputElement;

  for (let round = 0; round < rounds; round++) {
    const roundPairings: TeamPairings[] = [];

    const newPlayerIndexes: number[] = [0].concat(playerIndexes);

    const firstHalf = newPlayerIndexes.slice(0, half);
    const secondHalf = newPlayerIndexes.slice(half, playerCount).reverse();

    for (let i = 0; i < firstHalf.length; i++) {
      roundPairings.push({
        home: editionList[firstHalf[i]],
        away: editionList[secondHalf[i]],
      });
    }
    // rotating the array
    playerIndexes.push(playerIndexes.shift()!);
    tournamentPairings.push(roundPairings);
  }

  if (checkbox.checked) {
    for (let round = 0; round < rounds; round++) {
      const secondRound: TeamPairings[] = [];

      const newPlayerIndexes: number[] = [0].concat(playerIndexes);

      const firstHalf = newPlayerIndexes.slice(0, half);
      const secondHalf = newPlayerIndexes.slice(half, playerCount).reverse();

      for (let i = 0; i < firstHalf.length; i++) {
        secondRound.push({
          home: editionList[secondHalf[i]],
          away: editionList[firstHalf[i]],
        });
      }
      // rotating the array
      playerIndexes.push(playerIndexes.shift()!);
      tournamentPairings.push(secondRound);
    }
  }
  return tournamentPairings;
}

// function to generate the games from the edition and push to the games DB
function populateGamesDB(id: string) {
  let editionId = id;
  // use the sorted list to create the games table
  let games = genGamesTable();
  // games: TeamPairings[][]
  // round: TeamPairings[]
  // generate the games and push to the games DB with empty values
  games.forEach((round, index) => {
    let rc = index + 1;
    let gc = 1;
    round.forEach((game: TeamPairings) => {
      if (game.home && game.away) {
        let gameId = uuidv4();

        let newDB = dbGames();

        if (newDB) {
          newDB.push({
            id: gameId,
            edition: {
              id: editionId,
              round: rc,
              game: gc++,
            },
            teams: {
              home: {
                id: game.home,
                goals: null,
                whoScored: null,
                whoAssisted: null,
              },
              away: {
                id: game.away,
                goals: null,
                whoScored: null,
                whoAssisted: null,
              },
            },
          });
          saveGame(newDB);
        }
      }
    });
  });
}

// function to set date of new edition
function dateOfEdition() {
  const today = new Date();
  const dayOfChamps =
    today.getFullYear() +
    '.' +
    ('0' + (today.getMonth() + 1)).slice(-2) +
    '.' +
    ('0' + today.getDate()).slice(-2);
  return dayOfChamps;
}

// estabilish truth to check if an edition was successfuly created
let editionCreated = false;

// generate schedule table based on the games DB
function createEdition() {
  // get edition name
  const inputName = document.getElementById(
    'inputEditionName',
  ) as HTMLInputElement;
  const checkboxDouble = document.getElementById(
    'checkboxDoubleRound',
  ) as HTMLInputElement;

  const editionName = inputName.value;

  if (editionName.length >= 3) {
    // clear modal
  closeModalCreateEdition();
    // disable the new edition button
    toggleNewEditionButton();
    // clear control buttons
    listTeams();
    // set a single id for each champs
    let editionId = uuidv4();
    // get date of edition creation
    const date = dateOfEdition();
    // populate current edition database
    let currentEdition = dbEditions();
    // create empty array of objects
    let editionTeams: { teamId: string; roster: [] }[] = [];
    // iterate of edition list, get the team roster and push to editionTeams
    for (let i = 0; i < editionList.length; i++) {
      let roster = getRoster(editionList[i]);
      editionTeams.push({ teamId: editionList[i], roster });
    }
    // push created edition to DB
    currentEdition.push({ id: editionId, date, editionName, editionTeams, complete: false });
    saveEdition(currentEdition);
    // populate the games database
    populateGamesDB(editionId);
    // empty the editionList
    editionList = [];
    saveEditionList(editionList);
    // cry out in joy
    alert(`EDITION ${editionName} CREATED`);
    // clear edition name from the input and disable the button
    inputName.value = '';
    checkboxDouble.checked = false;
    toggleNewEditionButton();
    // edition is created
    editionCreated = true;
  } else {
    // make sure input has at least 3 characters
    alert('enter a name with at least 3 characters');
  }
}

// find edition ID by using the game's ID
function findEditionId(gameId: string) {
  return dbGames().filter((game: Game) => game.id === gameId)[0].edition.id;
}

// find edition date by edition ID
function findEditionDate(id: string) {
  const editions = dbEditions();
  for (let i = 0; i < editions.length; i++) {
    if (editions[i].id === id) {
      return editions[i].date;
    }
  }
}
// find edition name by edition ID
function findEditionName(id: string) {
  const editions = dbEditions();
  for (let i = 0; i < editions.length; i++) {
    if (editions[i].id === id) {
      return editions[i].editionName.toUpperCase();
    }
  }
}

// function to find roster
const findRoster = (id: string, field: string) => {
  let game = dbGames().find((game: Game) => game.id === id);
  let gameEditionId = game.edition.id;
  let gameEdition = dbEditions().find(
    (edition: Edition) => edition.id === gameEditionId,
  );
  let roster: any[] = [];
  if (field === 'home') {
    let team = game.teams.home.id;
    gameEdition.editionTeams.forEach((item: any) => {
      if (item.teamId === team) {
        roster = item.roster;
      }
    });
    return roster;
  }
  if (field === 'away') {
    let team = game.teams.away.id;
    gameEdition.editionTeams.forEach((item: any) => {
      if (item.teamId === team) {
        roster = item.roster;
      }
    });
    return roster;
  }
};

// ALL THE RENDER(ERS)

// function that renders the game container
function renderGameContainer(gameId: string, game: Game) {

  let container = createElement({ tag: 'div', classes: 'container', id: gameId });
  let gameContainer = createElement({ tag: 'div', classes: 'gameContainer' });
  let homeTeam = createElement({ tag: 'span', classes: 'homeTeam' });
  let scores = createElement({ tag: 'form', classes: 'scores' });
  let homeGoals = createElement({ tag: 'input', classes: 'gameContainerHomeGoals' }) as HTMLInputElement;
  let awayGoals = createElement({ tag: 'input', classes: 'gameContainerAwayGoals' }) as HTMLInputElement;
  let awayTeam = createElement({ tag: 'span', classes: 'awayTeam' });
  let x = createElement({ tag: 'span', classes: 'x' });
  let gameCounter = createElement({ tag: 'div', classes: 'gameCounter' });
  let gameRound = createElement({ tag: 'span', classes: 'gameRound' });
  let gameNumber = createElement({ tag: 'span', classes: 'gameNumber' });
  let scoreButton = createElement({ tag: 'button', classes: 'scoreButton' }) as HTMLButtonElement;
  let gameRosters = createElement({ tag: 'div', classes: 'gameContainerRosters' })
  let homeTeamRoster = createElement({ tag: 'div', classes: 'gameContainerHomeRoster' })
  let awayTeamRoster = createElement({ tag: 'div', classes: 'gameContainerAwayRoster' });

  gameCounter.appendChild(gameRound);
  gameCounter.appendChild(gameNumber);
  gameContainer.appendChild(gameCounter);

  homeTeamRoster.classList.add('hidden');
  awayTeamRoster.classList.add('hidden');
  gameRosters.classList.add('hidden');

  scores.appendChild(homeTeam);
  scores.appendChild(homeGoals);
  scores.appendChild(x);
  scores.appendChild(awayGoals);
  scores.appendChild(awayTeam);
  scores.appendChild(scoreButton);
  gameContainer.appendChild(scores);

  container.appendChild(gameContainer);

  gameRosters.appendChild(homeTeamRoster);
  gameRosters.appendChild(awayTeamRoster);
  container.appendChild(gameRosters);

  homeTeam.innerHTML = getTeamName(game.teams.home.id || '').toUpperCase();
  awayTeam.innerHTML = getTeamName(game.teams.away.id || '').toUpperCase();
  x.innerHTML = ' x ';
  gameRound.innerHTML = `R${game.edition.round}`;
  gameNumber.innerHTML = `GAME ${game.edition.game}`;
  scoreButton.innerText = `SAVE`;

  // Add event listener to button only if it and the input form both exists
  if (scores) scores.onsubmit = formSubmit;
  if (scoreButton) scoreButton.addEventListener('click', () => addGame(gameId));

  if (game.teams.home.goals) {
    homeGoals.value = game.teams.home.goals.toString();
  }
  if (game.teams.away.goals) {
    awayGoals.value = game.teams.away.goals.toString();
  }
  if (game.teams.home.goals && game.teams.away.goals) {
    gameContainer.style.backgroundColor = '#eeeeee';
    scoreButton.disabled = true;
  }

  gameContainer.addEventListener('click', (event) => toggleTeamRoster(event, game.id));

  return container;
}

// function to toggle the rosters of the teams in a game container (calls the renderer)
function toggleTeamRoster(event, id: string) {
  const container = document.getElementById(id);
  const gameRosters = container?.getElementsByClassName(
    'gameContainerRosters',
  )[0];
  const homeTeamRoster = gameRosters?.getElementsByClassName(
    'gameContainerHomeRoster',
  )[0];
  const awayTeamRoster = gameRosters?.getElementsByClassName(
    'gameContainerAwayRoster',
  )[0];
  const gameContainerAwayGoals = container?.getElementsByClassName('gameContainerAwayGoals')[0];
  const gameContainerHomeGoals = container?.getElementsByClassName('gameContainerHomeGoals')[0];
  const scoreButton = container?.getElementsByClassName('scoreButton')[0];

  // salvar o conteudo do home e do away (os jogadores que fizeram o gol ou deram assistencia) numa variavel (aka state)
  // quando a div é escondida e depois re-colocada, colocar o conteudo da variavel no home e no away

  if (gameRosters) {
    renderGameRoster(id);

    if (gameRosters.classList.contains('hidden') && event.target !== scoreButton) {
      gameRosters.classList.remove('hidden');
      homeTeamRoster?.classList.remove('hidden');
      awayTeamRoster?.classList.remove('hidden');
    } else if (event.target !== gameContainerAwayGoals && event.target !== gameContainerHomeGoals && event.target !== scoreButton && !gameRosters?.classList.contains('hidden')) {
      gameRosters.classList.add('hidden');
      homeTeamRoster?.classList.add('hidden');
      awayTeamRoster?.classList.add('hidden');
    }
  }
}

// function to render the rosters of the teams in a game container
function renderGameRoster(id: string) {
  let homefield = 'home';
  let awayfield = 'away';

  const home = findRoster(id, homefield);
  const away = findRoster(id, awayfield);

  home!.sort((a, b) => b.posIndex - a.posIndex);
  away!.sort((a, b) => b.posIndex - a.posIndex);

  const container = document.getElementById(id);
  const gameRosters = container?.getElementsByClassName('gameContainerRosters')[0] as HTMLElement;
  const homeTeamRoster = gameRosters?.getElementsByClassName('gameContainerHomeRoster')[0] as HTMLElement;
  const awayTeamRoster = gameRosters?.getElementsByClassName('gameContainerAwayRoster')[0] as HTMLElement;

  const homeGoals = container?.getElementsByClassName('gameContainerHomeGoals')[0] as HTMLInputElement;
  const awayGoals = container?.getElementsByClassName('gameContainerAwayGoals')[0] as HTMLInputElement;

  let homeScore = 0;
  let awayScore = 0;

  const homers = createElement({ tag: 'ol', classes: 'homeList' }) as Element;
  const outsiders = createElement({ tag: 'ol', classes: 'awayList' }) as Element;

  const renderSelectOptions = (id: string, name: string) => {
    const playerSelectOption = document.createElement('option');
    playerSelectOption.value = id;
    playerSelectOption.innerText = `${name.toUpperCase()}`;
    return playerSelectOption;
  };

  const renderPlayer = (field: string) => {
    const playerGoalSelectionId = uuidv4();
    const playerAssistSelectionId = uuidv4();

    const emptyPlayerSelection = document.createElement('option');
    emptyPlayerSelection.innerText = `select player`;
    emptyPlayerSelection.value = ``;
    emptyPlayerSelection.selected = true;
    emptyPlayerSelection.disabled = true;

    const emptyAssistSelection = document.createElement('option');
    emptyAssistSelection.innerText = `add assist`;
    emptyAssistSelection.value = ``;
    emptyAssistSelection.selected = true;
    emptyAssistSelection.disabled = true;

    const ownGoalSelection = document.createElement('option');
    ownGoalSelection.innerText = `own goal`;
    ownGoalSelection.value = `own goal`;

    const listNumbers = document.createElement('li');
    listNumbers.classList.add('listNumbers');

    let playerGoal = document.createElement('select');
    playerGoal.classList.add('playerStatsSelect');
    playerGoal.dataset.playerGoalSelect = playerGoalSelectionId;

    let playerAssist = document.createElement('select');
    playerAssist.classList.add('playerStatSelect');
    playerAssist.dataset.playerAssistSelect = playerAssistSelectionId;
    playerAssist.disabled = true;

    playerGoal.appendChild(emptyPlayerSelection);
    playerAssist.appendChild(emptyAssistSelection);

    if (field === homefield) {
      Object.values(home!).forEach((player: Player) => {
        playerGoal.appendChild(
          renderSelectOptions(player.id, player.name)
        );
      });
      if (playerGoal) {
        playerGoal.onchange = (e: any) => {
          const goalScorerId = e.target.value;
          playerAssist.innerHTML = '';
          playerAssist.appendChild(emptyAssistSelection);
          Object.values(home!).forEach((player: Player) => {
            if (goalScorerId !== player.id) {
              playerAssist.appendChild(
                renderSelectOptions(player.id, player.name),
              );
            }
          });
          playerAssist.disabled = false;
        };
      }
      playerGoal.appendChild(ownGoalSelection);
      listNumbers?.appendChild(playerGoal);
      listNumbers?.appendChild(playerAssist);
      return listNumbers;
    }

    if (field === awayfield) {
      Object.values(away!).forEach((player: Player) => {
        playerGoal.appendChild(
          renderSelectOptions(player.id, player.name),
        );
      });
      if (playerGoal) {
        playerGoal.onchange = (e: any) => {
          const goalScorerId = e.target.value;
          playerAssist.innerHTML = '';
          playerAssist.appendChild(emptyAssistSelection);
          Object.values(away!).forEach((player: Player) => {
            if (goalScorerId !== player.id) {
              playerAssist.appendChild(
                renderSelectOptions(player.id, player.name),
              );
            }
            playerAssist.disabled = false;
          });
        };
      }
      playerGoal.appendChild(ownGoalSelection);
      listNumbers?.appendChild(playerGoal);
      listNumbers?.appendChild(playerAssist);
      return listNumbers;
    }
  };
  // 
  // colocar um listener no onKeyUp para sempre renderizar o conteudo do homeRoster ou away Roster
  homeGoals.onkeyup = (e: any) => {
    homeScore = e.target.value;

    homeTeamRoster.innerHTML = '';
    homers.innerHTML = ''

    for (let index = 1; index <= homeScore; index++) {
      let homePlayers = renderPlayer(homefield);
      homers.appendChild(homePlayers!);
    }
    homeTeamRoster.appendChild(homers);
  };
  awayGoals.onkeyup = (e: any) => {
    awayScore = e.target.value;

    awayTeamRoster.classList.remove('hidden');

    awayTeamRoster.innerHTML = '';
    outsiders.innerHTML = '';

    for (let index = 1; index <= awayScore; index++) {
      let awayPlayers = renderPlayer(awayfield);
      outsiders.appendChild(awayPlayers!);
    }
    awayTeamRoster.appendChild(outsiders);
  };
}

// render the edition's title (name and date)
function renderEditionTitle(id: string) {
  const editionDate = findEditionDate(id);
  const editionName = findEditionName(id);

  const title = createElement({ tag: 'div', classes: 'title' });
  const champsName = createElement({ tag: 'span', classes: 'champsName' });
  const champsDate = createElement({ tag: 'span', classes: 'champsDate' });

  champsName.innerHTML = `TAÇA ${editionName}`;
  champsDate.innerHTML = `${editionDate}`;

  title.appendChild(champsName);
  title.appendChild(champsDate);

  // title.classList.add('sticky')

  return title;
}

// render the games from any given edition using the edition's ID
function renderEdition(id: string) {

  // showHideEditionList()

  const editionShown = document.getElementById('editionShown') as HTMLElement;

  editionShown.innerHTML = '';

  editionShown.appendChild(renderEditionTitle(id));

  editionShown.appendChild(renderEditionResults(id));

  editionShown.appendChild(renderPlayerStats(id));

  const games = dbGames();

  const gamesFromEdition = games.filter((game: Game) => game.edition.id === id);

  gamesFromEdition.forEach((game: Game) => {
    let container = renderGameContainer(game.id, game);

    editionShown.appendChild(container);

    return container;
  });

  if (isComplete(id)) {
    const db = dbEditions()
    const index = db.findIndex((item:Edition) => item.id === id)
    if (db[index].complete === false) {
      db[index].complete = true
      saveEdition(db)
      location.reload()
    } else {
      return
    }
  }

}

// save game result to the database
function addGame(gameId: string) {
  const container = document.getElementById(gameId);
  const homeGoal = container?.getElementsByClassName('gameContainerHomeGoals')[0] as HTMLInputElement;
  const awayGoal = container?.getElementsByClassName('gameContainerAwayGoals')[0] as HTMLInputElement;
  const scoreButton = container?.getElementsByClassName('scoreButton')[0] as HTMLButtonElement;
  const homeList = container?.getElementsByClassName('homeList')[0] as HTMLOListElement;
  const awayList = container?.getElementsByClassName('awayList')[0] as HTMLOListElement;

  // const rosters = container?.getElementsByClassName('gameContainerRosters')[0] as HTMLElement

  const homeGoalScorer = Array.from(homeList?.querySelectorAll(`.playerStatsSelect[data-player-goal-select]`) as NodeListOf<HTMLSelectElement>);
  const homeGoalAssister = Array.from(homeList?.querySelectorAll(`.playerStatSelect[data-player-assist-select]`) as NodeListOf<HTMLSelectElement>);

  const awayGoalScorer = Array.from(awayList?.querySelectorAll(`.playerStatsSelect[data-player-goal-select]`) as NodeListOf<HTMLSelectElement>);
  const awayGoalAssister = Array.from(awayList?.querySelectorAll(`.playerStatSelect[data-player-assist-select]`) as NodeListOf<HTMLSelectElement>);
  
  let homeScorers: string[] = [];
  homeGoalScorer.forEach((item) => {
    if (item.options[item.selectedIndex].value !== '0') {
      let goalScorerId = item.selectedOptions[0].value;
      if (goalScorerId.length) {
        homeScorers.push(goalScorerId);
      }
    }
  });
  
  let homeAssisters: string[] = [];
  homeGoalAssister.forEach((item) => {
    let assistId = item.selectedOptions[0].value;
    homeAssisters.push(assistId);
  });

  let awayScorers: string[] = [];
  awayGoalScorer.forEach((item) => {
    if (item.options[item.selectedIndex].value !== '0') {
      let goalScorerId = item.selectedOptions[0].value;
      if (goalScorerId.length) {
        awayScorers.push(goalScorerId);
      }
    }
  });

  let awayAssisters: string[] = [];
  awayGoalAssister.forEach((item) => {
    let assistId = item.selectedOptions[0].value;
    awayAssisters.push(assistId);
  });

  const checkLength = (homeArray: string[], awayArray: string[]) => {
    if (homeArray.length !== awayArray.length) {
      return false;
    } else {
      return true;
    }
  };

  if (homeGoal.value && awayGoal.value) {
    const newDB = dbGames(); // copia do db
    const currentGame = newDB.findIndex((game: Game) => game.id === gameId); // achei o index do jogo que eu quero alterar

    if (
      checkLength(homeScorers, homeAssisters) &&
      checkLength(awayScorers, awayAssisters)
    ) {
      newDB[currentGame].teams.home.goals = homeGoal.value;
      newDB[currentGame].teams.home.whoScored = homeScorers;
      newDB[currentGame].teams.home.whoAssisted = homeAssisters;

      newDB[currentGame].teams.away.goals = awayGoal.value;
      newDB[currentGame].teams.away.whoScored = awayScorers;
      newDB[currentGame].teams.away.whoAssisted = awayAssisters;

      saveGame(newDB);

      // Depois de salvar o resultado do jogo, desabilitar o botão de salvar
      scoreButton.disabled = true;

      // re-render the edition to let CSS do its thing
      renderEdition(findEditionId(gameId));

      // update the info for the dashboard
      getOverallStats()

      // hide rosters div
      // toggleTeamRoster(event, gameId)

    } else {
      alert('Must select all goal scorers');
    }
  }
}

// click on the 'champs' navbutton
function clickOnChamps() {
  const champs = document.getElementById('navChamps');
  champs?.click();
}
// function to create the new edition and render the correct games table
function goChampsCreateEdition() {
  createEdition();

  if (editionCreated) {
    clickOnChamps();
    showHideEditionList();

    const list = document.getElementById('listOfEditions');
    const thisEdition = list?.lastElementChild as HTMLButtonElement;

    if (list) thisEdition.click();
  }
}

// render the modal that creates a new edition
function renderModalCreateEdition() {
  const modalEditionName = document.getElementById('modalEditionName');
  if (modalEditionName) modalEditionName.style.display = 'block';
}

// hide the modal that creates a new edition
function closeModalCreateEdition() {
  const modalEditionName = document.getElementById('modalEditionName');
  if (modalEditionName) modalEditionName.style.display = 'none';
}

// function to render the list of editions
function renderEditionList() {
  const editions = dbEditions();

  if (editions.length > 0) {
    for (let i = 0; i < editions.length; i++) {
      const editionButton = document.createElement('button');
      const editionDate = document.createElement('span');
      const editionName = document.createElement('span');
      editionButton.classList.add('editionButton');
      editionDate.classList.add('editionButtonDate');
      editionName.classList.add('editionButtonName');
      editionButton.appendChild(editionDate);
      editionButton.appendChild(editionName);
      editionDate.innerHTML = `${editions[i].date}`;
      editionName.innerHTML = `TAÇA ${editions[i].editionName.toUpperCase()}`;
      editionButton.id = editions[i].id;
      editionButton.onclick = () => renderEditionHideList(editions[i].id);
      listOfEditions?.appendChild(editionButton);
    }
  } else {
    emptyMessage(listOfEditions, 'No champs have been played!')
  }
}

// function to hide the list of editions after an edition is clicked
function renderEditionHideList(id: string) {
  const edition = document.getElementById('editionShown')
  if (edition.childNodes.length === 0) { 
    return renderEdition(id);
  } else {
    return edition.innerHTML = ''
  }
}

//function to toggle the list of editions
const showHideEditionList = () => {
  const list = document.getElementById('listOfEditions') as HTMLElement;
  const toggleListOfEditions = document.getElementById('toggleListOfEditions') as HTMLElement
  list.innerHTML = '';
  if (list) {
    if (list.classList.contains('hidden')) {
      list.classList.remove('hidden');
      renderEditionList();
      toggleListOfEditions.innerHTML = 'HIDE List of Editions'
    } else {
      list.classList.add('hidden');
      toggleListOfEditions.innerHTML = 'SHOW List of Editions'
    }
  }
};

// function to remove a team for the edition list (in case of misclick or whatever)
function removeFromEditionList(id: string) {
  if (editionList.includes(id)) {
    editionList.splice(editionList.indexOf(id), 1);

    const teamContainerControl = document.getElementById(id);
    const addToEditionButton = teamContainerControl?.getElementsByClassName(
      'controlButton',
    )[1] as HTMLButtonElement;

    addToEditionButton.classList.remove('removeFromEditionButton');
    addToEditionButton.innerText = `[ add to next edition ]`;
    addToEditionButton.onclick = () => {
      generateTeamsList(id);
    };
  }
  saveEditionList(editionList);
  toggleNewEditionButton();
}

// function to toggle the availability of the add/remove to next edition button
function toggleNextEditionButton(id: string) {
  const teamContainerControl = document.getElementById(id);
  const addToEditionButton = teamContainerControl?.getElementsByClassName(
    'controlButton',
  )[1] as HTMLButtonElement;

  addToEditionButton.classList.add('removeFromEditionButton');
  addToEditionButton.innerText = `[ remove from next edition ]`;
  addToEditionButton.onclick = () => removeFromEditionList(id);
}

// function to enable the button to create a new edition if editionList has 3 or more teams
export function toggleNewEditionButton() {
  if (editionList.length >= 3) {
    newEditionButton.disabled = false;
    newEditionButton.addEventListener('click', () =>
      renderModalCreateEdition(),
    );
  } else {
    newEditionButton.disabled = true;
  }
}

// estabilish important constants
const champs = document.getElementById('champs');
const teams = document.getElementById('teams');

// add the button element to create new editions
const newEditionButton = document.createElement('button');
newEditionButton.classList.add('newEditionButton');
newEditionButton.innerHTML = '';
newEditionButton.disabled = true;
teams?.appendChild(newEditionButton);

// create a modal element to get input of edition name
const modalEditionName = document.createElement('div');
modalEditionName.classList.add('modalEditionName');
modalEditionName.id = 'modalEditionName';

// create a form element for the modal
const formEditionName = document.createElement('form');
formEditionName.classList.add('formEditionName');
formEditionName.id = 'formEditionName';
formEditionName.setAttribute('method', 'post');

// create an input element for the form
const inputEditionName = document.createElement('input');
inputEditionName.classList.add('inputEditionName');
inputEditionName.setAttribute('id', 'inputEditionName');
inputEditionName.setAttribute('type', 'text');
inputEditionName.setAttribute('placeholder', 'enter edition name');
inputEditionName.setAttribute('required', '');
inputEditionName.setAttribute('pattern', '[a-zA-z]{3,45}');
inputEditionName.setAttribute('autocomplete', 'off');

// create label and checkbox elements for double round robin
const checkboxDoubleRoundLabel = document.createElement('label');
checkboxDoubleRoundLabel.setAttribute('for', 'checkboxDoubleRound');
checkboxDoubleRoundLabel.classList.add('checkboxDoubleRoundLabel');
checkboxDoubleRoundLabel.innerHTML = 'double round robin';

const checkboxDoubleRound = document.createElement('input');
checkboxDoubleRound.classList.add('checkboxDoubleRound');
checkboxDoubleRound.setAttribute('id', 'checkboxDoubleRound');
checkboxDoubleRound.setAttribute('type', 'checkbox');
checkboxDoubleRound.setAttribute('value', 'double');
checkboxDoubleRound.setAttribute('name', 'round');
// checkboxDoubleRound.setAttribute('checked', 'false');

// create a button to submit input for the form
const submitEditionName = document.createElement('button');
submitEditionName.classList.add('submitEditionName');
submitEditionName.innerText = `CREATE EDITION`;
submitEditionName.id = 'submitEditionName';
submitEditionName.setAttribute('value', 'Submit');
submitEditionName.addEventListener('click', () => goChampsCreateEdition());

// create a button to close the modal
const closeEditionName = document.createElement('button');
closeEditionName.classList.add('closeEditionName');
closeEditionName.innerText = `CLOSE`;
closeEditionName.id = 'closeEditionName';
closeEditionName.addEventListener('click', () => closeModalCreateEdition());

// append the elements that compose the modal
formEditionName.appendChild(inputEditionName);
formEditionName.appendChild(checkboxDoubleRound);
formEditionName.appendChild(checkboxDoubleRoundLabel);
formEditionName.appendChild(submitEditionName);
formEditionName.appendChild(closeEditionName);
modalEditionName.appendChild(formEditionName);
teams?.appendChild(modalEditionName);

// submit the form preventing default
if (formEditionName) formEditionName.onsubmit = formSubmit;

// champsIcon.addEventListener('click', () => showHideEditionList())

const toggleListOfEditions = createElement({tag:'p',classes:'toggleListOfEditions'}) as HTMLElement
toggleListOfEditions.innerHTML = 'SHOW List of Editions'
toggleListOfEditions.id = 'toggleListOfEditions'
toggleListOfEditions.addEventListener('click', () => showHideEditionList())

// append the icon to the page
const editionsToggle = createElement({tag:'div',classes:'editionsToggle'}) as HTMLDivElement
editionsToggle.appendChild(toggleListOfEditions)
// editionsToggle.appendChild(champsIcon);
champs?.appendChild(editionsToggle);

// create the div that contains the list of editions
const listOfEditions = document.createElement('div');
listOfEditions.classList.add('listOfEditions');
listOfEditions.classList.add('hidden');
listOfEditions.id = 'listOfEditions';
listOfEditions.innerHTML = '';
champs?.appendChild(listOfEditions);

// create the div that renders the title and table of games
const editionShown = document.createElement('div');
editionShown.classList.add('editionShown');
editionShown.id = 'editionShown';
champs?.appendChild(editionShown);


export let editionsArray: any[] = []

dbEditions().forEach((item:Edition) => {
  const complete = isComplete(item.id)
  if (complete) {
    const results = editionTable(item.id)
    const editionName = item.editionName.toUpperCase()
    return editionsArray.push({id: item.id, date: item.date, name: editionName, results})
  }
})
if (editionsArray.length >= 2) editionsArray.sort((a,b) => b.date.localeCompare(a.date))

const getEditionResults = () => editionsArray.map(item => item.results)
getEditionResults()
// console.log(editionsArray)

export let overallStats: any[] = []

export function getOverallStats() {

  let arr: any[] = []
  for (const edition of editionsArray) arr.push(...edition.results)

  let res: any[] = []
  res = arr.map((item) => { 
    return { 
      teamId: item.teamId,
      points: item.Points,
      games: item.Games,
      wins: item.Wins,
      draws: item.Draws,
      defeats: item.Defeats,
      goalsScored: item.GoalsScored,
      goalsAgainst: item.GoalsAgainst,
      netGoals: item.NetGoals,
      pointsPercentage: 0,
      rankingPoints: item.RankingPoints,
      champion: item.Champion,
      participation: item.Participation
    }
  })

  const result = res.reduce((acc, current) => {
    const index = acc.findIndex((item:any) => item.teamId === current.teamId)
    index > -1 
      ? ( 
         acc[index].points += current.points, 
           acc[index].games += current.games,
           acc[index].wins += current.wins,
           acc[index].draws += current.draws, 
           acc[index].defeats += current.defeats,
           acc[index].goalsScored += current.goalsScored,
           acc[index].goalsAgainst += current.goalsAgainst, 
           acc[index].netGoals += current.netGoals,
           acc[index].rankingPoints += current.rankingPoints,
           acc[index].champion += current.champion,
           acc[index].participation += current.participation
        )
          : acc.push({...current})
          return acc
  },[])

  result.forEach((item:any) => item.pointsPercentage = Number((item.points / (item.games * 3)).toFixed(4)))

  result.sort((a:any,b:any) => b.rankingPoints - a.rankingPoints || b.pointsPercentage - a.pointsPercentage)

  overallStats = result

  console.log(result)
  return overallStats
}
