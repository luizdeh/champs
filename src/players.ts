import { v4 as uuidv4 } from 'uuid';
import {
  dbTeams,
  Team,
  Player,
  dbPlayers,
  savePlayer,
  formSubmit,
  emptyMessage,
} from './app';
import { listTeams, getTeamName, getTeamAbbr } from './teams';
import { position, positionIndex, colors, teamsPalette } from './appConfig';

const players = document.getElementById('players');

const playerForm = document.createElement('form');
const playerInput = document.createElement('input');
const positionInput = document.createElement('input');
const playerSubmit = document.createElement('button');
const playersList = document.createElement('div');

playerForm.classList.add('teamForm');
playerInput.classList.add('teamInput');
positionInput.classList.add('positionInput');
playerSubmit.classList.add('teamSubmit');

playerForm.id = 'playerForm';
playerInput.id = 'playerInput';
positionInput.id = 'positionInput';
positionInput.classList.add('hidden');
playerSubmit.id = 'playerSubmit';
playersList.id = 'playersList';

playerForm.setAttribute('method', 'post');

playerInput.setAttribute('type', 'text');
playerInput.setAttribute('placeholder', 'search or add new player');
playerInput.setAttribute('autocomplete', 'off');

positionInput.setAttribute('placeholder', '');
positionInput.setAttribute('readonly', '');

playerSubmit.setAttribute('value', 'Submit');
playerSubmit.innerText = `save`;

if (players) {
  playerForm.appendChild(playerInput);
  playerForm.appendChild(positionInput);
  playerForm.appendChild(playerSubmit);
  players.appendChild(playerForm);
  players.appendChild(playersList);
}

if (playerForm) playerForm.onsubmit = formSubmit; // e.preventDefault();
if (playerForm && playerSubmit) {
  playerSubmit.addEventListener('click', () => openPositionModal());
}

let playersDB = dbPlayers();

const resetPlayersList = () => {
  playersDB = dbPlayers();
};

const filterPlayers = (e: any) => {
  let value = e.target.value.trim(); // value of input

  playersDB = dbPlayers().filter((player: Player) => {
    const name = player.name.toLowerCase();

    if (name.includes(value.toLowerCase())) {
      return player;
    }
  });

  listPlayers();
};

playerInput.addEventListener('keyup', filterPlayers);

function addPlayer(name: string, position: string) {
  const playerInput = document.getElementById(
    'playerInput',
  ) as HTMLInputElement;
  
  const id = uuidv4();

  const posIndex = positionIndex.positionIndex[position];

  if (name !== '') {
    const newDB = dbPlayers();
    newDB.push({ id, position, name, teamId: '', posIndex});
    savePlayer(newDB);
    playerInput.value = '';
  }

  listPlayers();
}

function currentPlayer(id: string) {
  return dbPlayers().findIndex((item: Player) => item.id === id);
}

function hasTeam(id: string) {
  const currPlayer = currentPlayer(id);
  const teamId = dbPlayers()[currPlayer].teamId;
  const team = dbTeams().find((team: Team) => team.id === teamId);
  if (team) {
    return true;
  } else {
    return false;
  }
}

function removePlayer(id: string) {
  const result = dbPlayers().filter((player: Player) => player.id !== id);
  savePlayer(result);
  listPlayers();
}

function removePlayerFromTeam(id: string) {
  const players = dbPlayers();
  const currPlayer = currentPlayer(id);
  players[currPlayer].teamId = '';
  savePlayer(players);
  listPlayers();
}

function renderPlayerContainer(id: string) {
  const currPlayer = currentPlayer(id);
  const player = dbPlayers()[currPlayer];

  const teamAbbr = getTeamAbbr(player.teamId);

  const playerContainer = document.createElement('div');
  const playerPosition = document.createElement('div');
  const playerName = document.createElement('div');
  const playerTeam = document.createElement('div');

  playerContainer.classList.add('playerContainer');
  playerPosition.classList.add('playerPosition');
  playerName.classList.add('playerName');
  playerTeam.classList.add('playerTeam');

  playerPosition.innerHTML = `${player.position}`;
  playerPosition.style.backgroundColor = colors.playerPosition[player.position];

  playerName.innerHTML = `${player.name.toUpperCase()}`;

  if (hasTeam(id)) {
    playerTeam.innerHTML = `${teamAbbr.toUpperCase()}`;
  } else {
    playerTeam.innerHTML = `-`;
  }

  let colorsExists = Object.values(teamsPalette).includes(teamAbbr);
  if (colorsExists) {
    playerTeam.style.color = colors.teamsPalette[teamAbbr].primary;
    playerTeam.style.backgroundColor = colors.teamsPalette[teamAbbr].secondary;
  }

  playerContainer.appendChild(playerPosition);
  playerContainer.appendChild(playerName);
  playerContainer.appendChild(playerTeam);

  return playerContainer;
}

function renderPlayerControl(id: string) {
  const playerControl = document.createElement('div');
  const playerRemove = document.createElement('button');
  const playerAddToTeam = document.createElement('button');
  const playerRemoveFromTeam = document.createElement('button');

  playerControl.classList.add('playerControl');
  playerRemove.classList.add('controlButton');
  playerAddToTeam.classList.add('controlButton');
  playerRemoveFromTeam.classList.add('controlButton');

  playerRemove.innerText = `[ remove ]`;
  playerAddToTeam.innerText = `[ add to team ]`;
  playerRemoveFromTeam.innerText = `[ release ]`;
  playerRemoveFromTeam.onclick = () => removePlayerFromTeam(id);
  playerRemoveFromTeam.disabled = true;

  playerControl.appendChild(playerRemove);
  playerControl.appendChild(playerAddToTeam);
  playerControl.appendChild(playerRemoveFromTeam);

  if (playerRemove) playerRemove.onclick = () => removePlayer(id);
  if (playerAddToTeam) playerAddToTeam.onclick = () => openPlayerModal(id);

  if (hasTeam(id)) playerRemove.disabled = true;
  if (hasTeam(id)) playerAddToTeam.disabled = true;
  if (hasTeam(id)) playerRemoveFromTeam.disabled = false;

  return playerControl;
}

function populatePlayersList() {
  playersDB.sort((a: Player, b: Player) => {
    return a.name.localeCompare(b.name);
  });

  playersDB.forEach((player: Player) => {
    const playersList = document.getElementById('playersList');

    let container = renderPlayerContainer(player.id);
    let control = renderPlayerControl(player.id);

    const playerContainerControl = document.createElement('div');
    playerContainerControl.classList.add('playerContainerControl');
    playerContainerControl.id = player.id;
    playerContainerControl.appendChild(container);
    playerContainerControl.appendChild(control);
    if (playersList) playersList.appendChild(playerContainerControl);
  });
}

// DUDU LIST
// 1. One input field where the user can search for a player, OR add a new player
// 2. Dropdowns to help user search for players:
//      - by position
//      - by team

function listPlayers() {
  if (playersList) playersList.innerHTML = '';

  const empty = () => dbPlayers().length === 0 || undefined;

  // Append the empty message if there's no content
  if (playersList && empty()) {
    emptyMessage(playersList);
  }

  if (playersList && !empty()) {
    populatePlayersList();
    resetPlayersList();
    listTeams();
  }
}

function findDuplicatePlayers(name: string, position: string) {
  // find duplicate players
  const result = dbPlayers().find((player) => (player.name.trim() === name.trim()) && (player.position === position));

  if (result) {
    alert('NOT AUTHORIZED [ duplicate entry ]');
  }
  
  return result;

  // Update the list view
  // playersList.innerHTML = '';
  // resetPlayersList();
  // listPlayers();

  // return true or false
}

const modal = document.createElement('div');
modal.id = 'modal';
modal.classList.add('modal');
modal.classList.add('hidden');

const modalContainer = document.createElement('div');
modalContainer.classList.add('modalContent');

const closeModal = document.createElement('a');
closeModal.id = 'closeModal';
closeModal.innerHTML = `X`
closeModal.classList.add('closeModal');
closeModal.href = '#';
closeModal.onclick = (e) => {
  console.log(e);
  handleCloseModal(e);
}

const playerModal = document.createElement('div');
playerModal.id = 'playerModal';
playerModal.classList.add('hidden');

const positionModal = document.createElement('div');
positionModal.id = 'positionModal';
positionModal.classList.add('hidden');

document.body.appendChild(modal);
// outra div que vai ter a classe modelContent
// postion/player e a closeModal vão ficar dentro dela
modal.appendChild(modalContainer);
modalContainer.appendChild(closeModal);
modalContainer.appendChild(positionModal);
modalContainer.appendChild(playerModal);

function openPlayerModal(id: string) {
  const modal = document.getElementById('modal');
  const playerModal = document.getElementById('playerModal');

  playerModal!.innerHTML = '';

  modal!.classList.remove('hidden');
  playerModal!.classList.remove('hidden');

  const teams = dbTeams();

  teams.forEach((team: Team) => {
    const eachTeam = document.createElement('p');
    eachTeam.innerHTML = `${team.name}`;
    eachTeam.id = team.id;
    eachTeam.classList.add('eachTeam');
    playerModal!.appendChild(eachTeam);
    eachTeam.addEventListener('click', () => pushToTeam(team.id));
  });

  const players = dbPlayers();

  const playerId = id;

  const currentPlayer = players.findIndex(
    (item: Player) => item.id === playerId,
  );

  function pushToTeam(id: string) {
    players[currentPlayer].teamId = id;
    savePlayer(players);
    playerModal!.innerHTML = '';
    playerModal!.classList.add('hidden');
    modal!.classList.add('hidden');
    listPlayers();
  }

  modalCloseEvent();
}

function openPositionModal() {
  const modalContainer = document.getElementById('modal');

  const positionModal = document.getElementById('positionModal');
  positionModal!.innerHTML = '';

  modalContainer!.classList.remove('hidden');
  positionModal!.classList.remove('hidden');

  for (const pos in position) {
    const showEach = document.createElement('div');
    showEach.innerHTML = `${pos}`;
    showEach.classList.add('playerPositionModal');
    showEach.style.backgroundColor = colors.playerPosition[pos];
    positionModal!.appendChild(showEach);
    showEach.addEventListener('click', () => chooseAndClose(pos));
  }

  function chooseAndClose(position: string) {
    if (!findDuplicatePlayers(playerInput.value, position)) {
      addPlayer(playerInput.value, position);
    }
    
    positionModal!.classList.add('hidden');
    modalContainer!.classList.add('hidden');
    listPlayers();
  }

  modalCloseEvent();
}

function handleCloseModal(event: Event) {
  const modalContainer = document.getElementById('modal');
  
  if (event.target === modalContainer || event.target === closeModal) {
    modalContainer!.classList.add('hidden');
  }
}

function modalCloseEvent(): void {
  window.addEventListener('click', handleCloseModal);
}

listPlayers();
