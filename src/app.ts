// Type for the team object
export type Team = {
    id: string;
    name: string;
};

export type Player = {
    id: string;
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
            goals: number;
            whoScored: string;
            whoAssisted: string;
        };
        away: {
            id: string;
            goals: number;
            whoScored: string;
            whoAssisted: string;
        };
    };
};

export type EditionList = {
    id: string;
    name: string;
}

const TeamsDB = "teams"
const PlayersDB = "players"
const GamesDB = "games"

export const dbTeams = () => JSON.parse(localStorage.getItem(TeamsDB) || '[]');

export const dbPlayers = () => JSON.parse(localStorage.getItem(PlayersDB) || '[]')

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
