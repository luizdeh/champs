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

const TeamsDB = "teams";
const PlayersDB = "players";
const GamesDB = "games";

export const dbTeams = () => JSON.parse(localStorage.getItem(TeamsDB) || "[]");

export const dbPlayers = () =>
    JSON.parse(localStorage.getItem(PlayersDB) || "[]");

export const dbGames = () => JSON.parse(localStorage.getItem(GamesDB) || "[]");

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

const navButtons = document.querySelectorAll('.navButton')
const showStuff = document.querySelectorAll('.showstuff')

const getStuff = (navButton: HTMLButtonElement) => navButton.dataset.showstuff

const hide = (element: HTMLDivElement) => element.classList.add('hidden')

for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener('click', () => {
        let change = 0
        while (change < navButtons.length) {
            navButtons[change++].className = 'navButton'
        }
        navButtons[i].classList.toggle('navActive')
        let target = document.getElementById(getStuff(navButtons[i]))
        showStuff.forEach(hide)
        target.classList.remove('hidden')
    })
}

const dash = document.getElementById('showDash')

dash.innerHTML =
`
criar mercado para proposição de trocas<br>
revisar criação de campeonato visando montar tabelas que não se perdem no refresh
`

