import { v4 as uuidv4 } from 'uuid';
import { formSubmit, Game, dbGames, saveGame, saveEditionList, saveEdition, dbEditions, Player, dbPlayers, Edition, TeamPairings } from './app';
import { listTeams, getTeamName, getRoster } from './teams';

// TODO when editionList is ready, add the list to saveState and generate the games table, but don't render it yet
// TODO make sure nothing else happens when an edition is created and is active ( create active and inactive state of editions )
// TODO create a 'pause edition' function that will disable the edition and make it inactive
// TODO make sure no teams can transfer players and no players or team can be deleted, but teams/players can be created

// transform this variable to a state through localstorage
// make a randomized list from selected teams
let editionList: string[] = [];

export function generateTeamsList(id: string) {
  editionList.push(id);
  toggleNextEditionButton(id);
  toggleNewEditionButton();
  saveEditionList(editionList);
  return editionList;
}

// function that generates the games table => MAKE IT ASK FOR 'TURNO' AND 'RETURNO', fix function to accomodate single or double round robin
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
let editionCreated = false

// generate schedule table based on the games DB
function createEdition() {
    // get edition name
    const inputName = document.getElementById('inputEditionName') as HTMLInputElement
    const editionName = inputName.value

    if (editionName.length >= 3) {
        // clear modal
        closeModalCreateEdition()
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
        currentEdition.push({ id: editionId, date, editionName, editionTeams });
        saveEdition(currentEdition);
        // populate the games database
        populateGamesDB(editionId);
        // empty the editionList
        editionList = [];
        saveEditionList(editionList);
        // cry out in joy
        alert(`EDITION ${editionName} CREATED`)
        // clear edition name from the input and disable the button
        inputName.value=''
        toggleNewEditionButton()
        // edition is created
        editionCreated = true
    } else {
        // make sure input has at least 3 characters
        alert('enter a name with at least 3 characters')
    }
}

// find the game object using the game's ID
const findGame = (id: string) => dbGames().filter((game: Game) => game.id === id);

// check if the game is saved with goals pushed to the DB
const gameComplete = (id: string) => {
  const game = findGame(id);
  if ((game[0].teams.away.goals) && (game[0].teams.home.goals)) {
    return true;
  }
};

// find edition ID by using the game's ID
function findEditionId(gameId: string) {
  return dbGames().filter((game: Game) => game.id === gameId)[0].edition.id
}

// find edition date by edition ID
function findEditionDate(id: string) {
    const editions = dbEditions()
    for (let i = 0; i < editions.length; i++) {
      if (editions[i].id === id) {
        return editions[i].date;
      }
    }
}

// find edition name by edition ID
function findEditionName(id: string) {
    const editions = dbEditions()
    for (let i = 0; i < editions.length; i++) {
      if (editions[i].id === id) {
        return editions[i].editionName.toUpperCase();
      }
    }
}

// function to find the roster of the home team
function findHomeRoster(id: string) {
    let game = dbGames().filter((game: Game) => game.id === id);
    let team = game[0].teams.home.id;
    let gameEditionId = game[0].edition.id;
    let gameEdition = dbEditions().filter((edition: Edition) => edition.id === gameEditionId);
    let roster = [];
    gameEdition[0].editionTeams.forEach((item: any) => {
    if (item.teamId === team) {
        roster = item.roster;
    }
  });
    return roster;
}

// function to find the roster of the away team
function findAwayRoster(id: string) {
  let game = dbGames().filter((game: Game) => game.id === id);
  let team = game[0].teams.away.id;
  let gameEditionId = game[0].edition.id;
  let gameEdition = dbEditions().filter((edition: Edition) => edition.id === gameEditionId);
  let roster = [];
  gameEdition[0].editionTeams.forEach((item: any) => {
    if (item.teamId === team) {
      roster = item.roster;
    }
  });
  return roster;
}
// function to find player's name using his ID
function getPlayerName(id: string) {
  let player = dbPlayers().filter((player: Player) => player.id === id);
  return player[0].name;
}

// ALL THE RENDER(ERS)

// function that renders the game container
function renderGameContainer(gameId: string, game: Game) {
  let container = document.createElement('div');
  let gameContainer = document.createElement('div');
  let homeTeam = document.createElement('span');
  let scores = document.createElement('form');
  let homeGoals = document.createElement('input');
  let awayGoals = document.createElement('input');
  let awayTeam = document.createElement('span');
  let x = document.createElement('span');
  let gameCounter = document.createElement('span');
  let scoreButton = document.createElement('button');
  let gameRosters = document.createElement('div');
  let homeTeamRoster = document.createElement('div');
  let awayTeamRoster = document.createElement('div');

  container.id = gameId;

  container.classList.add('container');
  gameContainer.classList.add('gameContainer');
  homeTeam.classList.add('homeTeam');
  awayTeam.classList.add('awayTeam');
  homeGoals.classList.add('gameContainerHomeGoals');
  awayGoals.classList.add('gameContainerAwayGoals');
  x.classList.add('x');
  gameCounter.classList.add('gameCounter');
  scoreButton.classList.add('scoreButton');
  scores.classList.add('scores');
  gameRosters.classList.add('gameContainerRosters');
  gameRosters.classList.add('hidden');
  homeTeamRoster.classList.add('gameContainerHomeRoster');
  awayTeamRoster.classList.add('gameContainerAwayRoster');

  homeTeam.innerHTML = getTeamName(game.teams.home.id || '');
  awayTeam.innerHTML = getTeamName(game.teams.away.id || '');
  x.innerHTML = ' x ';
  gameCounter.innerHTML = `Round ${game.edition.round} | Game ${game.edition.game}`; // print current value of gc
  scoreButton.innerText = `save`;

  homeGoals.disabled = true;
  awayGoals.disabled = true;

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

  if (gameContainer)
    gameContainer.addEventListener('click', () => toggleTeamRoster(game.id));

  scores.appendChild(gameCounter);
  scores.appendChild(homeTeam);
  scores.appendChild(homeGoals);
  scores.appendChild(x);
  scores.appendChild(awayGoals);
  scores.appendChild(awayTeam);
  scores.appendChild(scoreButton);
  gameContainer.appendChild(scores);
  gameRosters.appendChild(homeTeamRoster);
  gameRosters.appendChild(awayTeamRoster);
  container.appendChild(gameContainer);
  container.appendChild(gameRosters);

  return container;
}

// function to toggle the rosters of the teams in a game container (calls the renderer)
function toggleTeamRoster(id: string) {
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

  if (gameRosters) {
    if (gameRosters.classList.contains('hidden')) {
      gameRosters.classList.remove('hidden');
      renderGameRoster(id);
    } else {
      if (homeTeamRoster) homeTeamRoster.innerHTML = '';
      if (awayTeamRoster) awayTeamRoster.innerHTML = '';
      gameRosters.classList.add('hidden');
    }
  }
}


// function to render the rosters of the teams in a game container
function renderGameRoster(id: string) {
  const home = findHomeRoster(id);
  const away = findAwayRoster(id);

  const container = document.getElementById(id);
  const gameRosters = container?.getElementsByClassName('gameContainerRosters')[0];
  const homeTeamRoster = gameRosters?.getElementsByClassName('gameContainerHomeRoster')[0];
  const awayTeamRoster = gameRosters?.getElementsByClassName('gameContainerAwayRoster')[0];

  const homeGoals = container?.getElementsByClassName('gameContainerHomeGoals')[0] as HTMLInputElement;
  const awayGoals = container?.getElementsByClassName('gameContainerAwayGoals')[0] as HTMLInputElement;

  if (gameComplete(id)) {
    if (homeTeamRoster) homeTeamRoster.innerHTML = '';
    if (awayTeamRoster) awayTeamRoster.innerHTML = '';
  } else {
    home.forEach((player: any) => {
      let playerName = getPlayerName(player.id);
      let playerId = player.id;
      let playerElement = document.createElement('div');
      playerElement.classList.add('playerElement');
      playerElement.dataset.id = playerId;

      const playerNameHome = document.createElement('span');
      playerNameHome.innerHTML = playerName.toUpperCase();
      playerNameHome.classList.add('playerNameHome');

      const addGoal = document.createElement('button');
      const removeGoal = document.createElement('button');
      const goals = document.createElement('span');
      addGoal.innerText = '+';
      removeGoal.innerText = '-';
      goals.innerText = `0`;
      addGoal.classList.add('addRemoveGoal');
      removeGoal.classList.add('addRemoveGoal');
      goals.classList.add('goals');
    
      addGoal.onclick = () => {
        goals.innerText = `${parseInt(goals.innerText) + 1}`;
        homeGoals.value = goals.innerText;
      };
      removeGoal.onclick = () => {
        goals.innerText = `${parseInt(goals.innerText) - 1}`;
        homeGoals.value = goals.innerText;
      };

      playerElement.appendChild(playerNameHome);
      playerElement.appendChild(removeGoal);
      playerElement.appendChild(goals);
      playerElement.appendChild(addGoal);
      homeTeamRoster?.appendChild(playerElement);
    });
    away.forEach((player: any) => {
      let playerName = getPlayerName(player.id);
      let playerId = player.id;
      let playerElement = document.createElement('div');
      playerElement.classList.add('playerElement');
      playerElement.dataset.id = playerId;

      const playerNameAway = document.createElement('span');
      playerNameAway.innerHTML = playerName.toUpperCase();
      playerNameAway.classList.add('playerNameAway');

      const addGoal = document.createElement('button');
      const removeGoal = document.createElement('button');
      const goals = document.createElement('span');
      addGoal.innerText = '+';
      removeGoal.innerText = '-';
      goals.innerText = `0`;
      addGoal.classList.add('addRemoveGoal');
      removeGoal.classList.add('addRemoveGoal');
      goals.classList.add('goals');

      addGoal.onclick = () => {
        goals.innerText = `${parseInt(goals.innerText) + 1}`;
        awayGoals.value = goals.innerText;
      };
      removeGoal.onclick = () => {
        goals.innerText = `${parseInt(goals.innerText) - 1}`;
        awayGoals.value = goals.innerText;
      };

      playerElement.appendChild(addGoal);
      playerElement.appendChild(goals);
      playerElement.appendChild(removeGoal);
      playerElement.appendChild(playerNameAway);
      awayTeamRoster?.appendChild(playerElement);
    });
  }
}

// render the edition's title (name and date)
function renderEditionTitle(id: string) {
  const editionDate = findEditionDate(id);
  const editionName = findEditionName(id)

  const title = document.createElement('div');
  const champsName = document.createElement('span');
  const champsDate = document.createElement('span');

  title.classList.add('title');
  champsName.classList.add('champsName');
  champsDate.classList.add('champsDate');
  champsName.innerHTML = `TAÇA ${editionName}`;
  champsDate.innerHTML = `${editionDate}`;

  title.appendChild(champsName);
  title.appendChild(champsDate);

  return title;
}

// render the games from any given edition using the edition's ID
function renderEdition(id: string) {
  const editionShown = document.getElementById('editionShown') as HTMLElement;

  editionShown.innerHTML = '';

  editionShown.appendChild(renderEditionTitle(id));

  getEditionResults(id);

  const games = dbGames();

  const gamesFromEdition = games.filter((game: Game) => game.edition.id === id);

  gamesFromEdition.forEach((game: Game) => {
    let container = renderGameContainer(game.id, game);

    editionShown.appendChild(container);
    
    return container;
  });
}

// save game result to the database
function addGame(gameId: string) {
    const container = document.getElementById(gameId);
    const homeGoal = container?.getElementsByClassName('gameContainerHomeGoals')[0] as HTMLInputElement;
    const awayGoal = container?.getElementsByClassName('gameContainerAwayGoals')[0] as HTMLInputElement;
    const scoreButton = container?.getElementsByClassName('scoreButton')[0] as HTMLButtonElement;

  // Depois de salvar o resultado do jogo, desabilitar o botão de salvar
  scoreButton.disabled = true;
  
  if (homeGoal.value && awayGoal.value) {
    const newDB = dbGames(); // copia do db
    const currentGame = newDB.findIndex((game: Game) => game.id === gameId); // achei o index do jogo que eu quero alterar

    newDB[currentGame].teams.home.goals = homeGoal.value;
    newDB[currentGame].teams.away.goals = awayGoal.value;

    newDB[currentGame].teams.home.whoScored = 
    newDB[currentGame].teams.away.whoScored = 

    saveGame(newDB);

  }
    // whoScored(gameId)
    // re-render the edition to let CSS do its thing
    renderEdition(findEditionId(gameId))

}
// TODO I'm right here thinking how to best gather all this information to make a results table
// function to gather all the results from the games of the edition
function getEditionResults(id: string) {
  const edition = dbGames().filter((game: Game) => game.edition.id === id);

  let stats: {
    gameId: string;
    editionRound: string;
    gameNumber: string;
    homeTeam: string;
    homeGoals: string;
    homeScorer: string;
    homeAssister: string;
    awayTeam: string;
    awayGoals: string;
    awayScorer: string;
    awayAssister: string;
  }[] = [];

  for (let i = 0; i < edition.length; i++) {
    let gameId = edition[i].id;
    let gameNumber = edition[i].edition.game;
    let editionRound = edition[i].edition.round;
    let homeTeam = edition[i].teams.home.id;
    let awayTeam = edition[i].teams.away.id;
    let homeGoals = edition[i].teams.home.goals;
    let awayGoals = edition[i].teams.away.goals;
    let homeScorer = edition[i].teams.home.whoScored;
    let awayScorer = edition[i].teams.away.whoScored;
    let homeAssister = edition[i].teams.home.whoAssisted;
    let awayAssister = edition[i].teams.away.whoAssisted;
    stats.push({
      gameId,
      editionRound,
      gameNumber,
      homeTeam,
      homeGoals,
      homeScorer,
      homeAssister,
      awayTeam,
      awayGoals,
      awayScorer,
      awayAssister,
    });
  }
}

// generate a list to select players that either scored or assisted on goals
// function whoScored(gameId: string, playerId: string) {

//     const newDB = dbGames()
//     const currentGame = newDB.findIndex((game: Game) => game.id === gameId)

//     newDB[currentGame].teams.home.whoScored = [playerId, howMany(playerId)]

// }

// click on the 'champs' navbutton
function clickOnChamps() {
  const champs = document.getElementById('navChamps');
  champs?.click();
}
// function to create the new edition and render the correct games table
function goChampsCreateEdition() {
    createEdition()

    if (editionCreated) {
        clickOnChamps()
        showHideEditionList()

        const list = document.getElementById('listOfEditions')
        const thisEdition = list?.lastElementChild as HTMLButtonElement

        if (list) thisEdition.click()
    }
}

// render the modal that creates a new edition
function renderModalCreateEdition() {
    const modalEditionName = document.getElementById('modalEditionName')
    if (modalEditionName) modalEditionName.style.display = 'block'
}

// hide the modal that creates a new edition
function closeModalCreateEdition() {
    const modalEditionName = document.getElementById('modalEditionName')
    if (modalEditionName) modalEditionName.style.display = 'none'
}

// function to render the list of editions
function renderEditionList() {
  const editions = dbEditions();

  if (editions.length > 0) {
    for (let i = 0; i < editions.length; i++) {
        const editionButton = document.createElement('button');
        const editionDate = document.createElement('span')
        const editionName = document.createElement('span')
        editionButton.classList.add('editionButton');
        editionDate.classList.add('editionButtonDate')
        editionName.classList.add('editionButtonName')
        editionButton.appendChild(editionDate)
        editionButton.appendChild(editionName)
        editionDate.innerHTML = `${editions[i].date}`
        editionName.innerHTML = `TAÇA ${editions[i].editionName.toUpperCase()}`;
        editionButton.id = editions[i].id;
        editionButton.onclick = () => renderEditionHideList(editions[i].id);
        listOfEditions?.appendChild(editionButton);
    }
  }
}

// function to hide the list of editions after an edition is clicked
function renderEditionHideList(id: string) {
    renderEdition(id)
    showHideEditionList()
}

//function to toggle the list of editions
const showHideEditionList = () => {
  const list = document.getElementById('listOfEditions') as HTMLElement;
  list.innerHTML = '';
  if (list) {
    if (list.classList.contains('hidden')) {
      list.classList.remove('hidden');
      renderEditionList();
    } else {
      list.classList.add('hidden');
    }
  }
};

// function to remove a team for the edition list (in case of misclick or whatever)
function removeFromEditionList(id: string) {
  if (editionList.includes(id)) {
    editionList.splice(editionList.indexOf(id), 1);

    const teamContainerControl = document.getElementById(id);
    const addToEditionButton = teamContainerControl?.getElementsByClassName('controlButton')[1] as HTMLButtonElement;

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
    newEditionButton.addEventListener('click', () => renderModalCreateEdition());
  } else {
    newEditionButton.disabled = true;
  }
}

// estabilish important constants
const champs = document.getElementById('champs');
const teams = document.getElementById('teams')

// add the button element to create new editions
const newEditionButton = document.createElement('button');
newEditionButton.classList.add('newEditionButton');
newEditionButton.innerHTML = '';
newEditionButton.disabled = true;
document.body.appendChild(newEditionButton);

// create a modal element to get input of edition name
const modalEditionName = document.createElement('div')
modalEditionName.classList.add('modalEditionName')
modalEditionName.id = 'modalEditionName'

// create a form element for the modal
const formEditionName = document.createElement('form')
formEditionName.classList.add('formEditionName')
formEditionName.id = 'formEditionName'
formEditionName.setAttribute('method', 'post')

// create an input element for the form
const inputEditionName = document.createElement('input')
inputEditionName.classList.add('inputEditionName')
inputEditionName.setAttribute('id', 'inputEditionName')
inputEditionName.setAttribute('type', 'text')
inputEditionName.setAttribute('placeholder', 'enter edition name')
inputEditionName.setAttribute('required','')
inputEditionName.setAttribute('pattern', '[a-zA-z]{3,45}')
inputEditionName.setAttribute('autocomplete', 'off')

// create a button to submit input for the form
const submitEditionName = document.createElement('button')
submitEditionName.classList.add('submitEditionName')
submitEditionName.innerText = `CREATE EDITION`
submitEditionName.id = 'submitEditionName'
submitEditionName.setAttribute('value', 'Submit')
submitEditionName.addEventListener('click', () => goChampsCreateEdition())

// create a button to close the modal
const closeEditionName = document.createElement('button')
closeEditionName.classList.add('closeEditionName')
closeEditionName.innerText = `CLOSE`
closeEditionName.id = 'closeEditionName'
closeEditionName.addEventListener('click', () => closeModalCreateEdition())

// append the elements that compose the modal
formEditionName.appendChild(inputEditionName)
formEditionName.appendChild(submitEditionName)
formEditionName.appendChild(closeEditionName)
modalEditionName.appendChild(formEditionName)
teams?.appendChild(modalEditionName)

// submit the form preventing default
if (formEditionName) formEditionName.onsubmit = formSubmit

// create the clickable 'banner' that renders the list of editions
const toggleEditionList = document.createElement('button');
toggleEditionList.classList.add('toggleEditionList');
toggleEditionList.innerHTML = `LIST OF CHAMPS`;
toggleEditionList.id = 'toggleEditionList';
toggleEditionList.addEventListener('click', () => showHideEditionList());
champs?.appendChild(toggleEditionList);

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

// don't know if i'll need these again

// function removeEmptyTeamFromEdition() {
//   const edition = dbEditions();

//   for (let i = 0; i < edition.length; i++) {
//     if (edition[i].id === null) {
//       edition.splice(i, 1);
//     }
//   }
//   saveEdition(edition);
// }

// function removeEditionWithNoTeams() {
//   const edition = dbEditions();

//   for (let i = 0; i < edition.length; i++) {
//     if (edition[i].editionTeams.length === 0) {
//       edition.splice(i, 1);
//     }
//   }
//   saveEdition(edition);
// }
