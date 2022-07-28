import { v4 as uuidv4 } from 'uuid';
import {
  dbPlayers,
  Player,
  dbTeams,
  Team,
  saveTeam,
  formSubmit,
  emptyMessage,
} from './app';
import { generateTeamsList, toggleNewEditionButton } from './editions';
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
if (teamInput && teamSubmit) teamSubmit.addEventListener('click', () => addTeam(teamInput.value, abbrInput.value));

listTeams()

function renderTeamContainer(id: string) {
  const teamObject = dbTeams().filter((team: Team) => team.id === id);

  const teamContainer = document.createElement('div');
  const teamName = document.createElement('p');
  const teamAbbr = document.createElement('p');

  teamContainer.classList.add('teamContainer');
  teamName.classList.add('teamName');
  teamAbbr.classList.add('teamAbbr');

  teamName.innerHTML = `${teamObject[0].name.toUpperCase()}`;
  teamAbbr.innerHTML = `${teamObject[0].abbr.toUpperCase()}`;

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
  const teamRemove = document.createElement('button');
  const teamAddToEdition = document.createElement('button');

  teamControl.classList.add('teamControl');
  teamRemove.classList.add('controlButton');
  teamAddToEdition.classList.add('controlButton');

  // teamRemove.innerHTML = `  `;
  teamRemove.innerText = `[ remove ]`;
  teamAddToEdition.innerText = `[ add to next edition ]`;

  teamControl.appendChild(teamRemove);
  teamControl.appendChild(teamAddToEdition);

  if (checkRoster(id)) teamRemove.disabled = true;
  if (teamRemove) teamRemove.onclick = () => removeTeam(id);
  if (teamAddToEdition) teamAddToEdition.onclick = () => generateTeamsList(id);

  return teamControl;
}

// make the teamContainerControl div clearer when roster is open
function renderTeamRoster(id: string) {
  const roster = getRoster(id);

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
    rosterPlayerPosition.style.backgroundColor = colors.playerPosition[player.position];

    rosterPlayerName.innerHTML = `${player.name.toUpperCase()}`;

    rosterPlayerContainer.appendChild(rosterPlayerPosition);
    rosterPlayerContainer.appendChild(rosterPlayerName);
    teamRoster.appendChild(rosterPlayerContainer);
  });
  return teamRoster;
}

export function getRoster(id: string) {
  const teamId = id;
  const roster = dbPlayers().filter(
    (player: Player) => player.teamId === teamId,
  );

  roster.sort((a, b) => {
    return b.positionIndex - a.positionIndex;
  });

  return roster;
}

function toggleTeamRoster(id: string) {
  const teamRoster = document.querySelector(`.teamRoster[data-id="${id}"]`);
  const teamContainer = document.getElementById(id);
  // const teamName = teamContainer.getElementsByClassName('teamContainer')[0] as HTMLElement;

  if (teamRoster) {
    if (teamRoster.classList.contains('hidden')) {
      teamRoster.classList.remove('hidden');
    } else {
      teamRoster.classList.add('hidden');
    }

  if (teamRoster) {
    if (!teamRoster.classList.contains('hidden')) {
        teamContainer?.classList.add('showingTeamRoster')
    } else {
        teamContainer?.classList.remove('showingTeamRoster')
    }
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
    toggleNewEditionButton();
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
