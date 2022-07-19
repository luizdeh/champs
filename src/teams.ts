import { v4 as uuidv4 } from 'uuid';
import {
  dbPlayers,
  Player,
  dbGames,
  Game,
  dbTeams,
  Team,
  saveTeam,
  formSubmit,
  emptyMessage,
} from './app';
import { generateTeamsList, enableNewEditionButton } from './editions';
import { colors, teamsPalette } from './appConfig';

const teams = document.getElementById('teams');

// Set form to add teams
const teamForm = document.createElement('form');
const teamInput = document.createElement('input');
const abbrInput = document.createElement('input');
const teamSubmit = document.createElement('button');
const teamsList = document.createElement('div');

teamForm.classList.add('teamForm');
teamInput.classList.add('teamInput');
abbrInput.classList.add('teamInput');
teamSubmit.classList.add('teamSubmit');
teamsList.classList.add('teamsList');

teamForm.id = 'teamForm';
teamInput.id = 'teamInput';
abbrInput.id = 'abbrInput';
teamSubmit.id = 'teamSubmit';
teamsList.id = 'teamsList';

teamForm.setAttribute('method', 'post');

teamInput.setAttribute('type', 'text');
teamInput.setAttribute('placeholder', '+ add team');
teamInput.setAttribute('required', 'please enter only letters');
// teamInput.setAttribute('maxlength', '45')
teamInput.setAttribute('pattern', '[a-zA-z]{3,45}');
teamInput.setAttribute('autocomplete', 'off');

abbrInput.setAttribute('type', 'text');
abbrInput.setAttribute('placeholder', 'three letter abbreviation');
abbrInput.setAttribute('name', 'acronym');
abbrInput.setAttribute('required', 'please enter three letters');
abbrInput.setAttribute('minlength', '3');
abbrInput.setAttribute('maxlength', '3');
abbrInput.setAttribute('pattern', '[a-zA-z]{3}');
teamInput.setAttribute('autocomplete', 'off');

teamSubmit.setAttribute('value', 'Submit');
teamSubmit.innerText = `save`;

teamForm.appendChild(teamInput);
teamForm.appendChild(abbrInput);
teamForm.appendChild(teamSubmit);
if (teams) teams.appendChild(teamForm);
if (teams) teams.appendChild(teamsList);

if (teamForm) teamForm.onsubmit = formSubmit;
if (teamInput && teamSubmit)
  teamSubmit.addEventListener('click', () =>
    addTeam(teamInput.value, abbrInput.value),
  );

function renderTeamContainer(id: string) {
  const teamObject = dbTeams().filter((team: Team) => team.id === id);

  const teamContainer = document.createElement('div');
  const teamName = document.createElement('p');
  const teamAbbr = document.createElement('p');

  teamContainer.classList.add('teamContainer');
  teamName.classList.add('teamName');
  teamAbbr.classList.add('teamAbbr');

  teamName.innerHTML = `${teamObject[0].name}`;
  teamAbbr.innerHTML = `${teamObject[0].abbr}`;

  let colorsExists = Object.values(teamsPalette).includes(teamObject[0].abbr);
  if (colorsExists) {
    teamAbbr.style.color = colors.teamsPalette[teamObject[0].abbr].primary;
    teamAbbr.style.backgroundColor =
      colors.teamsPalette[teamObject[0].abbr].secondary;
  }

  teamName.addEventListener('click', () => toggleTeamRoster(id));

  teamContainer.appendChild(teamName);
  teamContainer.appendChild(teamAbbr);

  return teamContainer;
}

function renderTeamControl(id: string) {
  const teamControl = document.createElement('div');
  const listTeamRemove = document.createElement('button');
  const listTeamAdd = document.createElement('button');

  teamControl.classList.add('teamControl');
  listTeamRemove.classList.add('controlButton');
  listTeamAdd.classList.add('controlButton');

  listTeamRemove.innerText = `[ remove ]`;
  listTeamAdd.innerText = `[ add to next edition ]`;

  teamControl.appendChild(listTeamRemove);
  teamControl.appendChild(listTeamAdd);

  if (checkRoster(id)) listTeamRemove.disabled = true;
  if (listTeamRemove) listTeamRemove.onclick = () => removeTeam(id);
  if (listTeamAdd) listTeamAdd.onclick = () => generateTeamsList(id);

  return teamControl;
}

// make the teamContainerControl div clearer when roster is open
function renderTeamRoster(id: string) {
  const roster = getRoster(id);

  console.log(roster)

  const teamRoster = document.createElement('div');
  teamRoster.classList.add('teamRoster');
  teamRoster.dataset.id = id;
  teamRoster.classList.add('hidden');
  
  roster.forEach((player: Player) => {
    const rosterPlayerContainer = document.createElement('div');
    const rosterPlayerName = document.createElement('div');
    const rosterPlayerPosition = document.createElement('div');

    rosterPlayerContainer.classList.add('rosterPlayerContainer');
    rosterPlayerPosition.classList.add('rosterPlayerPosition');
    rosterPlayerName.classList.add('rosterPlayerName');

    rosterPlayerPosition.innerHTML = `${player.position}`;
    rosterPlayerPosition.style.backgroundColor =
      colors.playerPosition[player.position];

    rosterPlayerName.innerHTML = `${player.name.toUpperCase()}`;

    rosterPlayerContainer.appendChild(rosterPlayerPosition);
    rosterPlayerContainer.appendChild(rosterPlayerName);
    teamRoster.appendChild(rosterPlayerContainer);
  });
  return teamRoster;
}

function getRoster(id: string) {
    const teamId = id;
    const roster = dbPlayers().filter((player: Player) => player.teamId === teamId);

    roster.sort((a,b) => { return b.positionIndex - a.positionIndex });

    return roster;

}

function toggleTeamRoster(id: string) {
  const teamRoster = document.querySelector(`.teamRoster[data-id="${id}"]`);

  if (teamRoster) {
    if (teamRoster.classList.contains('hidden')) {
      teamRoster.classList.remove('hidden');
    } else {
      teamRoster.classList.add('hidden');
    }
  }
}
function populateTeamsList() {
  const teams = dbTeams();
  teams.sort((a: Team, b: Team) => a.name.localeCompare(b.name));
  teamsList.innerHTML = '';
  teams.forEach((team: Team) => {
    const teamsList = document.getElementById('teamsList');

    let container = renderTeamContainer(team.id);
    let control = renderTeamControl(team.id);
    let roster = renderTeamRoster(team.id);

    const teamContainerControl = document.createElement('div');
    teamContainerControl.classList.add('teamContainerControl');
    teamContainerControl.id = team.id;
    teamContainerControl.appendChild(container);
    teamContainerControl.appendChild(control);
    if (teamsList) teamsList.appendChild(teamContainerControl);
    if (teamsList) teamsList.appendChild(roster);
  });
}

export function getTeamName(id: string) {
  return dbTeams()
    .filter((team: Team) => team.id === id)
    .map((name: Team) => name.name)[0];
}
export function getTeamAbbr(id: string) {
  return dbTeams()
    .filter((team: Team) => team.id === id)
    .map((name: Team) => name.abbr)[0];
}

//list team
export function listTeams() {
  if (teamsList) teamsList.innerHTML = '';

  const empty = () => dbTeams().length === 0 || undefined;

  if (teamsList && empty()) {
    emptyMessage(teamsList);
  }

  if (teamsList && !empty()) {
    populateTeamsList();
    findDuplicateTeams();
  }
  enableNewEditionButton();
}

function findDuplicateTeams() {
  const newDB = dbTeams();

  if (teamsList) {
    const unique = new Set(newDB.map((team: Team) => team.name));

    if (unique.size < newDB.length) {
      let duplicates = newDB
        .map((item: string) => item['name'])
        .map(
          (item: string, index: number, final: string) =>
            final.indexOf(item) !== index && index,
        )
        .filter((obj: string) => newDB[obj])
        .map((item: string) => newDB[item]['id']);

      let uniques = newDB.filter((obj: Team) => !duplicates.includes(obj.id));

      saveTeam(uniques);

      alert('NOT AUTHORIZED [ duplicate entry ]');

      // Update the list view
      teamsList.innerHTML = '';
      listTeams();
    }
  }
}
// add team
function addTeam(name: string, abbr: string) {
  const teamInput = document.getElementById('teamInput') as HTMLInputElement;
  const abbrInput = document.getElementById('abbrInput') as HTMLInputElement;
  const id = uuidv4();
  if (name !== '') {
    const newDB = dbTeams();
    if (abbrInput.value) {
      newDB.push({ id: id, name: name, abbr: abbr });
      saveTeam(newDB);
    }
  }
  teamInput.value = '';
  abbrInput.value = '';
  listTeams();
}
// remove team
function removeTeam(id: string) {
  const result = dbTeams().filter((item: Team) => item.id !== id);
  saveTeam(result);
  listTeams();
}

function checkRoster(id: string) {
  const teamId = id;
  const player = dbPlayers().filter(
    (player: Player) => player.teamId === teamId,
  );
  if (player.length > 0) {
    return true;
  } else {
    return false;
  }
}

listTeams();
