import { shuffleTeams, db, saveToDB } from "./app";
import { v4 as uuidv4 } from "uuid";

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
            playerIndexes.push(playerIndexes.shift());
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
    let gc = 0;

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

        round.forEach((game: Array<any>) => {
            if (game.home && game.away) {
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

                home.innerHTML = game.home[0];
                away.innerHTML = game.away[0];
                x.innerHTML = " x ";
                gamecount.innerHTML = gc++;
                scoreBtn.innerHTML = "save"

                container.appendChild(gamecount);
                gcontainer.appendChild(home);
                gcontainer.appendChild(homescore);
                gcontainer.appendChild(x);
                gcontainer.appendChild(awayscore);
                gcontainer.appendChild(away);
                container.appendChild(gcontainer);
                container.appendChild(scoreBtn)
                roundContainer.appendChild(container);

                let gameId = uuidv4();
                let newDB = db();

                // let homeTeam = game.home[0]
                let homeId = game.home[1]
                // let awayTeam = game.away[0]
                let awayId = game.away[1]

                newDB.games.push({
                     editionId: editionId,
                     gameId: gameId,
                     round: rc,
                     game: gc,
                     // home: game.home,
                     home: homeId,
                     // away: away.home,
                     away: awayId
                 });
                 saveToDB(newDB);
            }
        });
        Table.appendChild(roundContainer);
    });

    // This method is just to prevent the default of the <Form /> that we are using in the HTML
    function formSubmit(event: SubmitEvent) {
        event.preventDefault();
    }

    // Add onsubmit to the form element
    let homeScore = document.getElementById('homescore')
    let awayScore = document.getElementById('awayscore')
    if (homeScore) homeScore.onsubmit = formSubmit;
    if (awayScore) awayScore.onsubmit = formSubmit;

    // Get button
    const scoreBtn = document.getElementById("scoreBtn");

    // Add event listener to button only if it and the input form both exists
    if (scoreBtn) scoreBtn.addEventListener("click", () => addGame())

    function addGame() {

        if (homeScore && awayScore) {
        const newDB = db()

        let homeGoal = homeScore.nodeValue
        let awayGoal = awayScore.nodeValue

        let bunda = newDB.results.push({game: gameId, home: homeId, homeScore: homeGoal, away: awayId, awayScore: awayGoal})

        return bunda
        console.log('works?')
        }
        return console.log('?')
        // saveToDB(newDB)
    }
}

