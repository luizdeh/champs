// Type for the team object
export type Team = {
  id: string;
  name: string;
  abbr: string;
};

export type Player = {
  id: string;
  position: string;
  name: string;
  teamId: string;
  positionIndex: number;
};

export type Game = {
  id: string;
  edition: {
    id: string;
    round: number;
    game: number;
  };
  teams: {
    home: {
      id: string;
      name: string;
      goals: number;
      whoScored: string;
      whoAssisted: string;
    };
    away: {
      id: string;
      name: string;
      goals: number;
      whoScored: string;
      whoAssisted: string;
    };
  };
};

export type EditionList = {
  id: string;
  name: string;
};

// export type currentState = {
//     id:
// }
// example: save current editionlist and wipe when edition is created

const TeamsDB = 'teams';
const PlayersDB = 'players';
const GamesDB = 'games';

export const dbTeams = () => JSON.parse(localStorage.getItem(TeamsDB) || '[]');

export const dbPlayers = () =>
  JSON.parse(localStorage.getItem(PlayersDB) || '[]');

export const dbGames = () => JSON.parse(localStorage.getItem(GamesDB) || '[]');

export function saveTeam(content: Team) {
  return localStorage.setItem(TeamsDB, JSON.stringify(content));
}

export function savePlayer(content: Player) {
  return localStorage.setItem(PlayersDB, JSON.stringify(content));
}

export function saveGame(content: Game) {
  return localStorage.setItem(GamesDB, JSON.stringify(content));
}

export function formSubmit(event: SubmitEvent) {
  event.preventDefault();
}

export function emptyMessage(div: HTMLElement) {
  const emptyMessage = document.createElement('p');
  emptyMessage.innerText = `There are currently NO TEAMS registered!`;
  div.appendChild(emptyMessage);
}

const navButtons = document.querySelectorAll('.navButton');
const getPagesQuery = document.querySelectorAll('.page');

const getPageId = (navButton: HTMLElement) => navButton.dataset.pagename;

const hide = (element: Element) => element.classList.add('hidden');

Object.keys(navButtons).forEach((key) => {
   
  navButtons[key].addEventListener('click', (e) => {
    e.preventDefault();

    Object.keys(navButtons).forEach((key) => {
      navButtons[key].classList.remove('navActive');
    });

    navButtons[key].classList.add('navActive');

    const elementId = getPageId(navButtons[key]);
    
    let target = elementId
      ? document.getElementById(elementId)
      : console.error('[Error] navButtons list is empty!');

    getPagesQuery.forEach(hide);
    target?.classList.remove('hidden');
  });
});

const dash = document.getElementById('dash');

if (dash)
  dash.innerHTML = `
criar mercado para proposição de trocas<br>
revisar criação de campeonato visando montar tabelas que não se perdem no refresh
`;
