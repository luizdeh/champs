import { shuffleTeams, db, saveToDB } from "./app";
import { v4 as uuidv4 } from "uuid";

export function createEdition() {

    function genGamesTable(players: any[]) {
        if (players.length % 2 == 1) {
            players.push(null);
        }

        const playerCount = players.length;
        const rounds = playerCount - 1;
        const half = playerCount / 2;

        const tournamentPairings: any[] = [];
        const playerIndexes = players.map((_, i) => i).slice(1);

        for (let round = 0; round < rounds; round++) {
            const roundPairings: any[] = [];

            const newPlayerIndexes: any[] = [0].concat(playerIndexes);

            const firstHalf = newPlayerIndexes.slice(0, half);
            const secondHalf = newPlayerIndexes
                .slice(half, playerCount)
                .reverse();

            for (let i = 0; i < firstHalf.length; i++) {
                roundPairings.push({
                    home: players[firstHalf[i]],
                    away: players[secondHalf[i]],
                });
            }
            // rotating the array
            playerIndexes.push(playerIndexes.shift());
            tournamentPairings.push(roundPairings);
        }
        return tournamentPairings;
    }

    let shuffled = shuffleTeams();

    let games = genGamesTable(shuffled);

    // starting the HTML
    const Table = document.getElementById("Teams") as HTMLElement;

    let gc = 0;

    const id = uuidv4();

    const newDB = db();

    let editionId = id

    // generate the items on the page based on each game divided by rounds
    games.forEach((round, index) => {
        let rc = index + 1;
        let roundContainer = document.createElement("div");
        let roundCount = document.createElement("span");

        roundContainer.classList.add("roundcontainer");
        roundCount.classList.add("roundcount");
        roundCount.innerHTML = "RODADA " + rc; // pode ser também ${rc++} se deixar rc=index / rc++ = rc+1

        Table.append(roundCount);

        round.forEach((game: Array<any>) => {
            if (game.home && game.away) {
                let container = document.createElement("div");
                let gcontainer = document.createElement("div");
                let home = document.createElement("span");
                let away = document.createElement("span");
                let homescore = document.createElement("input");
                let awayscore = document.createElement("input");
                let gamecount = document.createElement("span");

                container.classList.add("container");
                gcontainer.classList.add("gcontainer");
                home.classList.add("home");
                away.classList.add("away");
                homescore.classList.add("homescore");
                awayscore.classList.add("awayscore");
                gamecount.classList.add("gamecount");

                home.innerHTML = game.home;
                away.innerHTML = game.away;
                gamecount.innerHTML = gc++;

                container.appendChild(gamecount);
                gcontainer.appendChild(home);
                gcontainer.appendChild(homescore);
                gcontainer.appendChild(awayscore);
                gcontainer.appendChild(away);
                container.appendChild(gcontainer);
                roundContainer.appendChild(container);

                let gameId = uuidv4();

                newDB.games.push({editionId: editionId, gameId: gameId, round: rc, game: gc, home: game.home, away: game.away });

                saveToDB(newDB);
            }
        });
        Table.appendChild(roundContainer);
    });
}
