import { shuffleTeams, db, saveToDB } from "./app";
import { v4 as uuidv4 } from "uuid";

export type Game = {home: {id: string, name: string}, away: {id: string, name: string}};

// This method is just to prevent the default of the <Form /> that we are using in the HTML
function formSubmit(event: SubmitEvent) {
    event.preventDefault();
}

function addGame(gameId: string) {
    const gameContainer = document.getElementById(gameId)
    const homeGoal = gameContainer?.getElementsByClassName("homescore")[0] as HTMLInputElement
    const awayGoal = gameContainer?.getElementsByClassName("awayscore")[0] as HTMLInputElement
    const scoreBtn = gameContainer?.getElementsByClassName("scoreBtn")[0] as HTMLButtonElement

    // Depois de salvar o resultado do jogo, desabilitar o botão de salvar
    scoreBtn.disabled = true;

    if (homeGoal.value && awayGoal.value) {
        const newDB = db(); // copia do db
        const currentGame = newDB.games.findIndex((game) => game.id === gameId); // achei o index do jogo que eu quero alterar

        newDB.games[currentGame].result = {home: homeGoal.value, away: awayGoal.value}; // coloco o resultado no jogo

        saveToDB(newDB)
    }
}

export function createEdition() {
    // function that generates the games table => MAKE IT ASK FOR 'TURNO' AND 'RETURNO', fix function to accomodate single or double round robin
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
            playerIndexes.push(playerIndexes.shift()!);
            tournamentPairings.push(roundPairings);
        }
        return tournamentPairings;
    }

    // shuffle the teams to make each champs unique
    let shuffled = shuffleTeams();

    // use the shuffled list to create the games table
    let games = genGamesTable(shuffled);

    // start the HTML
    const Table = document.getElementById("Teams") as HTMLElement;

    // 'global' acting as a counter for the games
    let gc = 1;

    // set a single id for each champs
    const id = uuidv4();
    let editionId = id;

    // generate the items on the page based on each game divided by rounds
    games.forEach((round, index) => {
        let rc = index + 1;
        let roundContainer = document.createElement("div");
        let roundCount = document.createElement("span");

        roundContainer.classList.add("roundcontainer");
        roundCount.classList.add("roundcount");
        roundCount.innerHTML = "RODADA " + rc; // pode ser também ${rc++} se deixar rc=index / rc++ = rc+1

        Table.append(roundCount);

        round.forEach((game: Game) => {
            if (game.home && game.away) {
                let gameId = uuidv4();

                let container = document.createElement("div");
                let gcontainer = document.createElement("div");
                let home = document.createElement("span");
                let scores = document.createElement("form");
                let homescore = document.createElement("input");
                let awayscore = document.createElement("input");
                let away = document.createElement("span");
                let x = document.createElement("span");
                let gamecount = document.createElement("span");
                let scoreBtn = document.createElement('button');

                container.id = gameId;

                container.classList.add("container");
                gcontainer.classList.add("gcontainer");
                home.classList.add("home");
                away.classList.add("away");
                homescore.classList.add("homescore");
                awayscore.classList.add("awayscore");
                x.classList.add("x");
                gamecount.classList.add("gamecount");
                scoreBtn.classList.add("scoreBtn");
                scores.classList.add("scores")

                home.innerHTML = game.home.name;
                away.innerHTML = game.away.name;
                x.innerHTML = " x ";
                gamecount.innerHTML = `${gc}`; // print current value of gc
                gc++ // add 1 to gc
                scoreBtn.innerHTML = "save"

                // Add event listener to button only if it and the input form both exists
                if (scores) scores.onsubmit = formSubmit;
                if (scoreBtn) scoreBtn.addEventListener("click", () => addGame(gameId));

                scores.appendChild(home);
                scores.appendChild(homescore);
                scores.appendChild(x);
                scores.appendChild(awayscore);
                scores.appendChild(away);
                scores.appendChild(scoreBtn)
                container.appendChild(gamecount);
                gcontainer.appendChild(scores);
                container.appendChild(gcontainer);
                roundContainer.appendChild(container);

                let newDB = db();
                let homeId = game.home.id
                let awayId = game.away.id

                if (newDB.games) {
                    newDB.games.push({
                        id: gameId,
                        edition: {
                            id: editionId,
                            round: rc,
                            game: gc,
                        },
                        teams: {
                            home: homeId,
                            away: awayId
                        },
                        result: {
                            home: null,
                            away: null
                        }
                    });
                    saveToDB(newDB);
                }
            }
        });
        Table.appendChild(roundContainer);
    });
}

