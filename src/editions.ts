import { v4 as uuidv4 } from "uuid";
import { Game, dbTeams, dbGames, saveGame, formSubmit,  } from "./app";
import {getTeamName} from "./teams";

const showChamps = document.getElementById('showChamps')

// add the button element to create new editions
const newEdition = document.createElement("div");
newEdition.classList.add("newEdition");
newEdition.id = "newEdition";

const newEditionButton = document.createElement("button");
newEditionButton.classList.add("newEditionButton");
newEditionButton.innerHTML = "create new champs edition";

if (showChamps) showChamps.appendChild(newEdition);
newEdition.appendChild(newEditionButton);
newEditionButton.disabled = true

// enable/disable the button to create new editions
export function enableNewEditionButton() {
    // reference editionlist instead of dbteams
    if (dbTeams().length >= 3) {
        newEditionButton.disabled = false
        newEditionButton.addEventListener("click", () => createEdition());
    } else {
        newEditionButton.disabled = true
    }

}

// make a randomized list from selected teams
// transform this variable to a state through localstorage
let editionList: string[] = [];

export function generateTeamsList(id: string) {
    editionList.push(id);

    if (editionList.length > 0) {
        editionList.sort(() => Math.random() - 0.5);
    }

    const teamContainerControl = document.getElementById(id);
    const listTeamAdded = teamContainerControl?.getElementsByClassName("listTeamAdd")[0] as HTMLButtonElement;
    const listTeamRemoved= teamContainerControl?.getElementsByClassName("listTeamRemove")[0] as HTMLButtonElement;
    listTeamAdded.disabled = true;
    listTeamRemoved.disabled = true;
    // add to database to avoid shithousery
    enableNewEditionButton()

    return editionList;
}

// save game result to the database
function addGame(gameId: string) {
    const gameContainer = document.getElementById(gameId);
    const homeGoal = gameContainer?.getElementsByClassName("homeGoals")[0] as HTMLInputElement;
    const awayGoal = gameContainer?.getElementsByClassName("awayGoals")[0] as HTMLInputElement;
    const scoreButton = gameContainer?.getElementsByClassName("scoreButton")[0] as HTMLButtonElement;

    // Depois de salvar o resultado do jogo, desabilitar o botão de salvar
    scoreButton.disabled = true;

    if (homeGoal.value && awayGoal.value) {
        const newDB = dbGames(); // copia do db
        const currentGame = newDB.findIndex((game: Game) => game.id === gameId); // achei o index do jogo que eu quero alterar

        newDB[currentGame].teams.home.goals = homeGoal.value;
        newDB[currentGame].teams.away.goals = awayGoal.value;

        saveGame(newDB);

        // whoScored(gameId)
    }
}

// generate a list to select players that either scored or assisted on goals
// function whoScored(gameId: string) {

//     const newDB = dbGames()
//     const currentGame = newDB.findIndex((game: Game) => game.id === gameId)

//     const editionTeam = newDB[currentGame].edition.id
//     const homeScorer = newDB[currentGame].teams.home.id
//     const awayScorer = newDB[currentGame].teams.away.id

//     const findHomeTeam = newDB.filter((item: string) => item === homeScorer)
//     const findHomeEditionTeam = findHomeTeam.roster.edition.filter((item: string) => item === editionTeam)
//     const getHomeRoster = findHomeEditionTeam.roster

//     const findAwayTeam = newDB.teams.filter((item: string) => item === homeScorer)
//     const findAwayEditionTeam = findAwayTeam.roster.edition.filter((item: string) => item === editionTeam)
//     const getAwayRoster = findAwayEditionTeam.roster

//     for (let i = 0; i < getHomeRoster.length; i++) {
//         const listHomeTeam = document.createElement("li");

//         listHomeTeam.innerHTML = " - " + player.name + "   ";

//         container!.append(listHomeTeam)
//     }

//     for (let i = 0; i < getAwayRoster.length; i++) {
//         const listAwayTeam = document.createElement("li");

//         listAwayTeam.innerHTML = " - " + player.name + "   ";

//         container!.append(listAwayTeam)
//     }
//     // saveToDB(newDB)

// }

type TeamParings = {
    home: string | null;
    away: string | null;
}

// function that generates the games table => MAKE IT ASK FOR 'TURNO' AND 'RETURNO', fix function to accomodate single or double round robin
function genGamesTable() {
    if (editionList.length % 2 == 1) {
        editionList.push(null!);
    }

    const playerCount = editionList.length;
    const rounds = playerCount - 1;
    const half = playerCount / 2;

    const tournamentPairings: TeamParings[][] = [];
    const playerIndexes = editionList.map((_, i) => i).slice(1);

    for (let round = 0; round < rounds; round++) {
        const roundPairings: TeamParings[] = [];

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

function renderEditionTitle() {
    // add date to current edition
    const today = new Date();
    const dayOfChamps = today.getFullYear() +"."+(today.getMonth() + 1)+"." +today.getDate();

    // create title for the edition
    const title = document.createElement("div");
    const champsName = document.createElement("span");
    const champsDate = document.createElement("span");
    title.classList.add("title");
    champsName.classList.add("champsName");
    champsDate.classList.add("champsDate");
    champsName.innerHTML = "Champs";
    champsDate.innerHTML = dayOfChamps;
    document.body.appendChild(title);
    title.appendChild(champsName);
    title.appendChild(champsDate);
}

function renderGameContainer(gameId: string, roundContainer: HTMLElement, game: TeamParings, gc: number) {
    let container = document.createElement("div");
    let gameContainer = document.createElement("div");
    let homeTeam = document.createElement("span");
    let scores = document.createElement("form");
    let homeGoals = document.createElement("input");
    let awayGoals = document.createElement("input");
    let awayTeam = document.createElement("span");
    let x = document.createElement("span");
    let gameCounter = document.createElement("span");
    let scoreButton = document.createElement("button");

    container.id = gameId;

    container.classList.add("container");
    gameContainer.classList.add("gameContainer");
    homeTeam.classList.add("homeTeam");
    awayTeam.classList.add("awayTeam");
    homeGoals.classList.add("homeGoals");
    awayGoals.classList.add("awayGoals");
    x.classList.add("x");
    gameCounter.classList.add("gameCounter");
    scoreButton.classList.add("scoreButton");
    scores.classList.add("scores");

    homeTeam.innerHTML = getTeamName(game.home || "");
    awayTeam.innerHTML = getTeamName(game.away || "");
    x.innerHTML = " x ";
    gameCounter.innerHTML = `${gc}`; // print current value of gc
    scoreButton.innerText = `save`;

    // Add event listener to button only if it and the input form both exists
    if (scores) scores.onsubmit = formSubmit;
    if (scoreButton)
        scoreButton.addEventListener("click", () =>
            addGame(gameId)
        );

    scores.appendChild(homeTeam);
    scores.appendChild(homeGoals);
    scores.appendChild(x);
    scores.appendChild(awayGoals);
    scores.appendChild(awayTeam);
    scores.appendChild(scoreButton);
    container.appendChild(gameCounter);
    gameContainer.appendChild(scores);
    container.appendChild(gameContainer);
    roundContainer.appendChild(container);

    return roundContainer;
}

// generate schedule table
function createEdition() {
    // Render edition title
    renderEditionTitle();

    // use the shuffled list to create the games table
    let games = genGamesTable();
    console.log(games);

    // set a single id for each champs
    let editionId = uuidv4();

    // start the HTML
    const Table = document.createElement("div");
    Table.id = editionId;
    document.body.appendChild(Table);

    // 'global' acting as a counter for the games
    let gc = 1;

    // games: TeamParings[][]
    // round: TeamParings[]
    // generate the items on the page based on each game divided by rounds
    games.forEach((round, index) => {
        let rc = index + 1;
        let roundContainer = document.createElement("div");
        let roundCounter = document.createElement("span");

        roundContainer.classList.add("roundContainer");
        roundCounter.classList.add("roundCounter");
        roundCounter.innerHTML = "RODADA " + rc; // pode ser também ${rc++} se deixar rc=index / rc++ = rc+1

        Table.append(roundCounter);

        round.forEach((game: TeamParings) => {
            console.log(game);
            if (game.home && game.away) {
                let gameId = uuidv4();

                // render game container
                renderGameContainer(gameId, roundContainer, game, gc);

                let newDB = dbGames();

                if (newDB) {
                    newDB.push({
                        id: gameId,
                        edition: {
                            id: editionId,
                            round: rc,
                            game: gc,
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
                gc++; // add 1 to gc -- had to put it down here because it was starting at game 2 in the database
            }
        });
        Table.appendChild(roundContainer);
    });
}
