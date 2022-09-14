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
import { listTeams, getTeamAbbr, loadLogo } from './teams';
import { position, positionIndex, colors, teamsPalette } from './appConfig';

const players = document.getElementById('players');

const playerFormFilter = document.createElement('div')
const playerForm = document.createElement('form');
const playerInput = document.createElement('input');
const positionInput = document.createElement('input');
const playerSubmit = document.createElement('button');
const playersList = document.createElement('div');

playerFormFilter.classList.add('playerFormFilter')
playerForm.classList.add('playerForm');
playerInput.classList.add('playerInput');
positionInput.classList.add('positionInput');
playerSubmit.classList.add('playerSubmit');

playerFormFilter.id = 'playerFormFilter'
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

// FILTERS
const playerFilter = document.createElement('div')
playerFilter.classList.add('playerFilter')

const clearFilterValues = () => {
    const positionFilter = document.getElementById('playerFilterPositionSelect') as HTMLSelectElement
    positionFilter.options[0].selected = true
    const teamFilter = document.getElementById('playerFilterTeamSelect') as HTMLSelectElement
    teamFilter.options[0].selected = true
    listPlayers()
}

const playerFilterClear = document.createElement('div')
playerFilterClear.classList.add('playerFilterClear')

const clearFilters = document.createElement('button')
clearFilters.classList.add('clearFilters')
clearFilters.addEventListener('click', clearFilterValues)
clearFilters.innerText = `X`

playerFilterClear.appendChild(clearFilters)

const clearFilterTooltip = document.createElement('span')
clearFilterTooltip.classList.add('tooltip')
clearFilterTooltip.innerText = `CLEAR`

playerFilterClear.appendChild(clearFilterTooltip)

const emptyPositionFilter = document.createElement('option')
emptyPositionFilter.innerText = `filter by position`
emptyPositionFilter.value = ``
emptyPositionFilter.selected = true
emptyPositionFilter.disabled = true

const emptyTeamFilter = document.createElement('option')
emptyTeamFilter.innerText = `filter by team`
emptyTeamFilter.value = ``
emptyTeamFilter.selected = true
emptyTeamFilter.disabled = true

const playerFilterPositionSelect = document.createElement('select')
playerFilterPositionSelect.name = 'playerFilterPosition'
playerFilterPositionSelect.classList.add('playerFilterPosition')
playerFilterPositionSelect.id = 'playerFilterPositionSelect'
playerFilterPositionSelect.appendChild(emptyPositionFilter)

Object.values(position).forEach((pos: string) => {
    const playerFilterPosition = document.createElement('option')
    playerFilterPosition.innerText = `${pos}`
    playerFilterPosition.value = `${pos}`
    playerFilterPositionSelect.appendChild(playerFilterPosition)
})

const playerFilterTeamSelect = document.createElement('select')
playerFilterTeamSelect.name = 'playerFilterTeam'
playerFilterTeamSelect.classList.add('playerFilterTeam')
playerFilterTeamSelect.id = 'playerFilterTeamSelect'
playerFilterTeamSelect.appendChild(emptyTeamFilter)

const freeAgent = document.createElement('option')
freeAgent.innerText = `FREE AGENTS`
freeAgent.value = `freeAgent`
playerFilterTeamSelect.appendChild(freeAgent)

dbTeams().forEach((team: Team) => {
    const playerFilterTeam = document.createElement('option')
    playerFilterTeam.innerText = `${team.name}`
    playerFilterTeam.value = `${team.abbr}`
    playerFilterTeamSelect.appendChild(playerFilterTeam)
})

playerFilter.appendChild(playerFilterPositionSelect)
playerFilter.appendChild(playerFilterTeamSelect)
// END OF FILTERS

if (players) {
  playerForm.appendChild(playerInput);
  playerForm.appendChild(positionInput);
  playerForm.appendChild(playerSubmit);
  playerFormFilter.appendChild(playerForm)
  playerFormFilter.appendChild(playerFilter)
  playerFormFilter.appendChild(playerFilterClear)
  players.appendChild(playerFormFilter);
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

    if (checkTeamFilter()) {
        const teamFilter = document.getElementById('playerFilterTeamSelect') as HTMLSelectElement
        const teamSelected = teamFilter.options[teamFilter.selectedIndex].value
        if (teamSelected === 'freeAgent') {
            playersDB = dbPlayers().filter((player: Player) => player.teamId === '').filter((player: Player) => {
                const name = player.name.toLowerCase()
                if (name.includes((value.toLowerCase()))) {
                    return player
                }
            })
            listPlayers()
        } else {
            playersDB = dbPlayers().filter((player: Player) => {
                const team = getTeamAbbr(player.teamId)
                const name = player.name.toLowerCase()
                if ((teamSelected === team) && (name.includes((value.toLowerCase())))) {
                return player
            }
        })
            listPlayers()
        }
    }
    if (checkPositionFilter()) {
        const positionFilter = document.getElementById('playerFilterPositionSelect') as HTMLSelectElement
        const positionSelected = positionFilter.options[positionFilter.selectedIndex].value
        playersDB = dbPlayers().filter((player: Player) => {
            const position = player.position.toUpperCase()
            const name = player.name.toLowerCase()
            if ((position === positionSelected) && (name.includes((value.toLowerCase())))) {
                return player
            }
        })
        listPlayers()
    }
    if (checkPositionFilter() && checkTeamFilter()) {
        const teamFilter = document.getElementById('playerFilterTeamSelect') as HTMLSelectElement
        const teamSelected = teamFilter.options[teamFilter.selectedIndex].value
        const positionFilter = document.getElementById('playerFilterPositionSelect') as HTMLSelectElement
        const positionSelected = positionFilter.options[positionFilter.selectedIndex].value

        if (teamSelected === 'freeAgent') {
             playersDB = dbPlayers().filter((player: Player) => player.teamId === '').filter((player: Player) => {
                const name = player.name.toLowerCase()
                const position = player.position.toUpperCase()
                if ((position === positionSelected) && name.includes((value.toLowerCase()))) {
                    return player
                }
            })
            listPlayers()
        } else {
            playersDB = dbPlayers().filter((player: Player) => {
                const team = getTeamAbbr(player.teamId)
                const position = player.position.toUpperCase()
                const name = player.name.toLowerCase()
                if ((position === positionSelected) && (team === teamSelected) && (name.includes((value.toLowerCase())))) {
                    return player
                }
            })
            listPlayers()
        }
    }
    if ((!checkTeamFilter()) && (!checkPositionFilter())) {
        playersDB = dbPlayers().filter((player: Player) => {
            const name = player.name.toLowerCase();

            if (name.includes(value.toLowerCase())) {
                return player;
            }
        });
        listPlayers();
    }
}

playerInput.addEventListener('keyup', filterPlayers);

function checkPositionFilter() {

    const positionFilter = document.getElementById('playerFilterPositionSelect') as HTMLSelectElement
    const positionSelected = positionFilter.options[positionFilter.selectedIndex].index
    if (positionSelected !== 0) return true
}
function checkTeamFilter() {

    const teamFilter = document.getElementById('playerFilterTeamSelect') as HTMLSelectElement
    const teamSelected = teamFilter.options[teamFilter.selectedIndex].index
    if (teamSelected !== 0) return true
}

const filterByPosition = (event: any) => {
    let selectedElement = event.target
    let positionSelected = selectedElement.value

    if (checkTeamFilter()) {
        const teamFilter = document.getElementById('playerFilterTeamSelect') as HTMLSelectElement
        const teamSelected = teamFilter.options[teamFilter.selectedIndex].value

        if (teamSelected === 'freeAgent') {
             playersDB = dbPlayers().filter((player: Player) => player.teamId === '').filter((player: Player) => {
                const position = player.position.toUpperCase()
                if (position === positionSelected) {
                    return player
                }
            })
            listPlayers()
        } else {
            playersDB = dbPlayers().filter((player: Player) => {
                const team = getTeamAbbr(player.teamId)
                const position = player.position.toUpperCase()
                if ((position === positionSelected) && (team === teamSelected)) {
                    return player
                }
            })
            listPlayers()
        }
    } else {
        playersDB = dbPlayers().filter((player: Player) => {
            const pos = player.position.toUpperCase()
            if (positionSelected === pos) { return player }
        })
    listPlayers()
    }
}

const filterByTeam = (event: any) => {
    let selectedElement = event.target
    let teamSelected = selectedElement.value

    if (checkPositionFilter()) {
        const positionFilter = document.getElementById('playerFilterPositionSelect') as HTMLSelectElement
        const positionSelected = positionFilter.options[positionFilter.selectedIndex].value

        if (teamSelected === 'freeAgent') {
            playersDB = dbPlayers().filter((player: Player) => player.teamId === '').filter((player: Player) => {
                const position = player.position.toUpperCase()
                if (position === positionSelected) {
                   return player
            }
        })
        listPlayers()
        } else {
            playersDB = dbPlayers().filter((player: Player) => {
                const team = getTeamAbbr(player.teamId)
                const position = player.position.toUpperCase()
                if ((teamSelected === team) && (positionSelected === position)) {
                    return player
                }
        })
        listPlayers()
        }
    } else {

        if (teamSelected === 'freeAgent') {
            playersDB = dbPlayers().filter((player: Player) => player.teamId === '').filter((player: Player) => {
                return player
            })
        listPlayers()
        }

        if (teamSelected !== 'freeAgent') {
            playersDB = dbPlayers().filter((player: Player) => {
                        const team = getTeamAbbr(player.teamId)
                        if (teamSelected === team) {
                            return player
                        }
            })
            listPlayers()
        }
    }
}
playerFilterPositionSelect.addEventListener('change', filterByPosition)
playerFilterTeamSelect.addEventListener('change', filterByTeam)

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
    playerTeam.style.color = colors.teamsPalette[teamAbbr.toUpperCase()].secondary;
    playerTeam.style.backgroundColor = colors.teamsPalette[teamAbbr.toUpperCase()].primary;
  } else {
    playerTeam.innerHTML = `-`;
  }

  // let colorsExists = Object.values(teamsPalette).includes(teamAbbr);
  // console.log(colorsExists);
  // if (colorsExists) {

  // }

  playerContainer.appendChild(playerPosition);
  playerContainer.appendChild(playerName);
  playerContainer.appendChild(playerTeam);
  // if (teamAbbr) playerContainer.appendChild(loadLogo(teamAbbr));

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
    emptyMessage(playersList,'No players found...');
  }

  if (playersList && !empty()) {
    populatePlayersList();
    resetPlayersList();
    listTeams();
  }

}

function findDuplicatePlayers(name: string, position: string) {
  // find duplicate players
  const result = dbPlayers().find((player: Player) => (player.name.trim() === name.trim()) && (player.position === position));

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
    eachTeam.innerHTML = `${team.name.toUpperCase()}`;
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
    playerInput.focus()

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
