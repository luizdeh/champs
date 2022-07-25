import { v4 as uuidv4 } from "uuid";
import { Game, dbGames, saveGame, formSubmit, saveEditionList, saveEdition, dbEditions, TeamPairings, Edition, Player } from "./app";
import { getTeamName, listTeams, getRoster } from "./teams";

const champs = document.getElementById('champs')

// add the button element to create new editions
const newEditionButton = document.createElement("button");
newEditionButton.classList.add("newEditionButton");
newEditionButton.innerHTML = "";

document.body.appendChild(newEditionButton);
newEditionButton.disabled = true

const toggleEditionList = document.createElement('button')
toggleEditionList.classList.add('toggleEditionList')
toggleEditionList.innerHTML = `LIST OF CHAMPS`
toggleEditionList.id = 'toggleEditionList'
toggleEditionList.addEventListener('click', () => showHideEditionList())
champs?.appendChild(toggleEditionList)

const listOfEditions = document.createElement("div");
listOfEditions.classList.add("listOfEditions");
listOfEditions.classList.add('hidden')
listOfEditions.id = 'listOfEditions'
listOfEditions.innerHTML = ''
champs?.appendChild(listOfEditions)

const editionShown = document.createElement('div')
editionShown.classList.add('editionShown')
editionShown.id = 'editionShown'
champs?.appendChild(editionShown)

function renderEditionList() {
    const editions = dbEditions();

    if (editions.length > 0) {
        for (let i = 0; i < editions.length; i++) {
                const editionButton = document.createElement("button");
                editionButton.classList.add("editionButton");
                editionButton.innerText = `${editions[i].date}    ${editions[i].editionName}`;
                editionButton.id = editions[i].id;
                editionButton.onclick = () => renderEdition(editions[i].id)
                listOfEditions?.appendChild(editionButton)
            }
        }
}

const showHideEditionList = () => {
    const list = document.getElementById('listOfEditions') as HTMLElement

    list.innerHTML = ''

    if (list) {
        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden')
            renderEditionList()
        } else {
            list.classList.add('hidden')
        }
    }
}
// TODO when it becomes enabled, add the list to saveState and generate the games table, but don't render it yet
// TODO make another function to render the games table and make it collapsible
// TODO make sure nothing else happens when an edition is created and is active ( create active and inactive state of editions )
// TODO create a 'pause edition' function that will disable the edition and make it inactive
// TODO make sure no teams can transfer players and no players or team can be deleted, but teams/players can be created
// TODO create an edition div element permanently to the page, leave hidden

// make a randomized list from selected teams
// transform this variable to a state through localstorage
let editionList: string[] = [];

export function generateTeamsList(id: string) {
    editionList.push(id);

    toggleNextEditionButton(id)

    enableNewEditionButton()

    saveEditionList(editionList);

    return editionList;
}

function removeFromEditionList(id: string) {
    if (editionList.includes(id)) {

        editionList.splice(editionList.indexOf(id), 1);

        const teamContainerControl = document.getElementById(id);
        const addToEditionButton = teamContainerControl?.getElementsByClassName("controlButton")[1] as HTMLButtonElement;

        addToEditionButton.classList.remove('removeFromEditionButton');
        addToEditionButton.innerText = `[ add to next edition ]`;
        addToEditionButton.onclick = () => { generateTeamsList(id) };

    }
    saveEditionList(editionList);
    enableNewEditionButton();
}

function toggleNextEditionButton(id: string) {

    const teamContainerControl = document.getElementById(id);
    const addToEditionButton = teamContainerControl?.getElementsByClassName("controlButton")[1] as HTMLButtonElement;

    addToEditionButton.classList.add('removeFromEditionButton');
    addToEditionButton.innerText = `[ remove from next edition ]`;
    addToEditionButton.onclick = () => removeFromEditionList(id);
}

export function enableNewEditionButton() {
    if (editionList.length >= 3) {
        newEditionButton.disabled = false
        newEditionButton.addEventListener("click", () => createEdition());
    } else {
        newEditionButton.disabled = true
    }

}

// function that generates the games table => MAKE IT ASK FOR 'TURNO' AND 'RETURNO', fix function to accomodate single or double round robin
function genGamesTable() {

    editionList.sort(() => Math.random() - 0.5);

    if (editionList.length % 2 == 1) {
        editionList.push(null!);
    }

    const playerCount = editionList.length;
    const rounds = playerCount - 1;
    const half = playerCount / 2;

    const tournamentPairings: TeamPairings[][] = [];
    const playerIndexes = editionList.map((_, i) => i).slice(1);

    for (let round = 0; round < rounds; round++) {
        const roundPairings: TeamPairings[] = [];

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
    console.log(tournamentPairings)
    return tournamentPairings;
}
function dateOfEdition() {
    const today = new Date();
    const dayOfChamps = today.getFullYear() +"."+('0' + (today.getMonth()+1)).slice(-2)+"." +('0' + today.getDate()).slice(-2);
    return dayOfChamps;
}

function renderGameContainer(gameId: string, game: Game) {
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
    let gameRosters = document.createElement('div')
    let homeTeamRoster = document.createElement('div')
    let awayTeamRoster = document.createElement('div')

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
    gameRosters.classList.add('gameContainerRosters')
    gameRosters.classList.add('hidden')
    homeTeamRoster.classList.add('gameContainerHomeRoster')
    awayTeamRoster.classList.add('gameContainerAwayRoster')

    homeTeam.innerHTML = getTeamName(game.teams.home.id || "");
    awayTeam.innerHTML = getTeamName(game.teams.away.id || "");
    x.innerHTML = " x ";
    gameCounter.innerHTML = `Round ${game.edition.round} | Game ${game.edition.game}`; // print current value of gc
    scoreButton.innerText = `save`;

    // Add event listener to button only if it and the input form both exists
    if (scores) scores.onsubmit = formSubmit;
    if (scoreButton)
        scoreButton.addEventListener("click", () => addGame(gameId));

    if (game.teams.home.goals) {
       homeGoals.value = game.teams.home.goals.toString()
       homeGoals.disabled = true
    }
    if (game.teams.away.goals) {
       awayGoals.value = game.teams.away.goals.toString()
       awayGoals.disabled = true
    }
    if (game.teams.home.goals && game.teams.away.goals) {
        gameContainer.style.backgroundColor = '#eeeeee'
        scoreButton.disabled = true
    }

    if (gameContainer) gameContainer.addEventListener('click', () => renderGameRoster(game.id))

    scores.appendChild(gameCounter);
    scores.appendChild(homeTeam);
    scores.appendChild(homeGoals);
    scores.appendChild(x);
    scores.appendChild(awayGoals);
    scores.appendChild(awayTeam);
    scores.appendChild(scoreButton);
    gameContainer.appendChild(scores);
    gameRosters.appendChild(homeTeamRoster)
    gameRosters.appendChild(awayTeamRoster)
    container.appendChild(gameContainer);
    container.appendChild(gameRosters)

    return container;
}
function findHomeRoster(id: string) {
        let game = dbGames().filter((game: Game) => game.id === id)

        let team = game[0].teams.home.id

        let gameEditionId = game[0].edition.id

        let gameEdition = dbEditions().filter((edition: Edition) => edition.id === gameEditionId)

        let roster = []

        gameEdition[0].editionTeams.forEach((item: any) => {
            if (item.teamId === team) {
                roster = item.roster
            }
        })

        return roster
}
function findAwayRoster(id: string) {
        let game = dbGames().filter((game: Game) => game.id === id)

        let team = game[0].teams.away.id

        let gameEditionId = game[0].edition.id

        let gameEdition = dbEditions().filter((edition: Edition) => edition.id === gameEditionId)

        let roster = []

        gameEdition[0].editionTeams.forEach((item: any) => {
            if (item.teamId === team) {
                roster = item.roster
            }
        })
        return roster

}

function renderGameRoster(id: string) {
        const home = findHomeRoster(id)
        const away = findAwayRoster(id)

        const gameContainer = document.getElementById(id)
        const gameRosters = gameContainer?.getElementsByClassName('gameContainerRosters')[0]
        const homeTeamRoster = gameContainer?.getElementsByClassName('gameContainerHomeRoster')[0]
        const awayTeamRoster = gameContainer?.getElementsByClassName('gameContainerAwayRoster')[0]

        for (let i = 0; i < home.length; i++) {
            const homePlayer = document.createElement('p')
            homePlayer.innerHTML = `${home[i].name}`
            homeTeamRoster?.appendChild(homePlayer)
            }
        for (let i = 0; i < away.length; i++) {
            const awayPlayer = document.createElement('p')
            awayPlayer.innerHTML = `${away[i].name}`
            awayTeamRoster?.appendChild(awayPlayer)
            }

        if (gameRosters) {
            if (gameRosters.classList.contains('hidden')) {
                gameRosters.classList.remove('hidden')
            } else {
                gameRosters.classList.add('hidden')
            }
        }
}

function clickOnChamps() {
    const champs = document.getElementById('navChamps');
    champs?.click()
}

function removeEmptyTeamFromEdition() {
    const edition = dbEditions()

    for (let i = 0; i < edition.length; i++) {
        if (edition[i].id === null) {
            edition.splice(i, 1)
        }
    }
    saveEdition(edition)
}

// generate schedule table
function createEdition() {

    const getEditionName = prompt('Enter the name of the edition:');

    const editionName = getEditionName?.valueOf().trim()

    // clear control buttons
    listTeams()

    // set a single id for each champs
    let editionId = uuidv4();

    // get date of edition creation
    const date = dateOfEdition();

    // populate current edition database
    let currentEdition = dbEditions()

    let editionTeams = []

    for (let i = 0; i < editionList.length; i++) {
        let roster = getRoster(editionList[i]);
        editionTeams.push({teamId: editionList[i], roster});
    }

    currentEdition.push({id: editionId, date, editionName, editionTeams})
    saveEdition(currentEdition);

    // populate the games database
    populateGamesDB(editionId)

    // empty the editionList
    editionList = [];
    saveEditionList(editionList)

    // disable the new edition button
    enableNewEditionButton()

    // remove possible empty teams from edition
    removeEmptyTeamFromEdition()

    // go to champs page
    clickOnChamps()
}

function populateGamesDB(id: string) {

    let editionId = id

    // use the sorted list to create the games table
    let games = genGamesTable();

    // games: TeamPairings[][]
    // round: TeamPairings[]
    // generate the items on the page based on each game divided by rounds
    games.forEach((round,index) => {

        let rc = index + 1;
        let gc = 1;

        round.forEach((game: TeamPairings) => {
            if (game.home && game.away) {
                let gameId = uuidv4();

                let newDB = dbGames();

                if (newDB) {
                    newDB.push({
                        id: gameId,
                        edition: {
                            id: editionId,
                            round: rc,
                            game: gc++,
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
            }
        });
    });
}

function renderEditionTitle(id: string) {

    const editions = dbEditions()

    let date = ''

    for (const edition of editions) {
        if (edition.id === id) {
            return date = edition.date
        }
    }
    const title = document.createElement("div");
    const champsName = document.createElement("span");
    const champsDate = document.createElement("span");

    title.classList.add("title");
    champsName.classList.add("champsName");
    champsDate.classList.add("champsDate");
    champsName.innerHTML = "Champs";
    champsDate.innerHTML = `${date}`;

    title.appendChild(champsName);
    title.appendChild(champsDate);

    return title

}

function renderEdition(id: string) {

    const editionShown = document.getElementById('editionShown') as HTMLElement

    editionShown.innerHTML = ''

    renderEditionTitle(id)

    // create a container for the edition
    // const editionContainer = document.createElement("div");
    // editionContainer.classList.add("editionContainer");
    // editionContainer.id = editionId;

    // create a table for the games
    // const Table = document.createElement("div");
    // Table.classList.add('table');

    //  append title and table to editionContainer
    // let title = renderEditionTitle(editionId)
    // editionContainer?.appendChild(title)
    // editionContainer?.appendChild(Table);
    // champs?.appendChild(editionContainer);

    const games = dbGames();

    const gamesFromEdition = games.filter((game: Game) => game.edition.id === id)

    gamesFromEdition.forEach((game: Game) => {

        // let rc = index + 1;
        // let roundContainer = document.createElement("div");
        // let roundCounter = document.createElement("span");

        // roundContainer.classList.add("roundContainer");
        // roundCounter.classList.add("roundCounter");
        // roundCounter.innerHTML = "RODADA " + rc;

        // Table.append(roundCounter);

        let container = renderGameContainer(game.id, game)
        editionShown.appendChild(container)
        return container
    })
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
