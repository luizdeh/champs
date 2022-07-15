import { v4 as uuidv4 } from "uuid";
import { dbTeams, Team, Player, dbPlayers, savePlayer, formSubmit } from "./app";
import { listTeams } from "./teams"
import { position, colors } from "./appConfig"

const showPlayers = document.getElementById("showPlayers");

const playerForm = document.createElement("form");
const playerInput = document.createElement("input");
const positionInput = document.createElement("input");
const playerSubmit = document.createElement("button");
const playersList = document.createElement("div");

playerForm.classList.add("teamForm");
playerInput.classList.add("teamInput");
positionInput.classList.add("positionInput");
playerSubmit.classList.add("teamSubmit");

playerForm.id = "playerForm";
playerInput.id = "playerInput";
positionInput.id = "positionInput";
playerSubmit.id = "playerSubmit";
playersList.id = "playersList";

playerForm.setAttribute("method", "post");

playerInput.setAttribute("type", "text");
playerInput.setAttribute("placeholder", "+ add player");

positionInput.setAttribute("placeholder", "");
positionInput.setAttribute("readonly", "");

playerSubmit.setAttribute("value", "Submit");
playerSubmit.innerText = `save`;

if (showPlayers) {
    playerForm.appendChild(playerInput);
    playerForm.appendChild(positionInput);
    playerForm.appendChild(playerSubmit);
    showPlayers.appendChild(playerForm);
    showPlayers.appendChild(playersList);
}

if (playerForm) playerForm.onsubmit = formSubmit;
if (playerForm && playerSubmit)
    playerSubmit.addEventListener("click", () => openPositionModal());

function addPlayer(name: string, position: string) {
    const playerInput = document.getElementById(
        "playerInput"
    ) as HTMLInputElement;
    const positionInput = document.getElementById(
        "positionInput"
    ) as HTMLInputElement;
    const id = uuidv4();
    if (name !== "") {
        const newDB = dbPlayers();
        newDB.push({ id: id, position: position, name: name, teamId: null });
        savePlayer(newDB);
    }
    listPlayers();
    playerInput.value = "";
    positionInput.value = "";
}

function removePlayer(id: Player) {
    const result = dbPlayers().filter((item: string) => item.id !== id);
    savePlayer(result);
    listPlayers();
}

function listPlayers() {
    if (playersList) playersList.innerHTML = "";

    const empty = () => dbPlayers().length === 0 || undefined;

    // Append the empty message if there's no content
    if (playersList && empty()) {
        const emptyMessageContainer = document.createElement("p");
        emptyMessageContainer.innerText = `There are currently no players registered!`;
        playersList.appendChild(emptyMessageContainer);
    }

    if (playersList && !empty()) {
        dbPlayers().forEach((player: Player) => {
            const playerContainer = document.createElement("div");
            const playerListing = document.createElement("div");
            const playerPosition = document.createElement("div");
            const playerTeam = document.createElement("div");
            const playersListRemoveButton = document.createElement("button");
            const listAddPlayer = document.createElement("button");
            const removeFromTeam = document.createElement('button')

            playerContainer.classList.add("playerContainer");
            playerPosition.classList.add("playerPosition");
            playerListing.classList.add("listPlayers");
            playersListRemoveButton.classList.add("listTeamRemove");
            listAddPlayer.classList.add("listTeamAdd");
            playerTeam.classList.add("playerTeam");
            removeFromTeam.classList.add('listTeamRemove')

            playerContainer.id = player.id;
            playerPosition.id = player.id;
            playerListing.id = player.id;
            playersListRemoveButton.id = player.id;
            listAddPlayer.id = player.id;
            playerTeam.id = player.id;
            removeFromTeam.id = player.id

            const isHired = dbTeams()
                .map((team: Team) => team.id)
                .indexOf(player.teamId);

            const hasTeam = () => {
                if (isHired === -1 || isHired === null) {
                    return `sem time`;
                } else {
                    return `${dbTeams()[isHired].abbr}`;
                }
            };

            playerPosition.innerHTML = `${player.position}`;
            playerPosition.style.backgroundColor = colors.playerPosition[player.position]
            playerListing.innerHTML = `${player.name.toUpperCase()}`;
            playerTeam.innerHTML = `${hasTeam()}`;
            playerTeam.style.color = colors.primary[hasTeam()]
            playerTeam.style.backgroundColor = colors.secondary[hasTeam()]
            playersListRemoveButton.innerText = `[ remove ]`;
            listAddPlayer.innerText = `[ add to team ]`;
            removeFromTeam.innerText = `[ remove from team ]`
            removeFromTeam.disabled = true

            if (playersListRemoveButton)
                playersListRemoveButton.onclick = () => removePlayer(player.id);
            if (listAddPlayer)
                listAddPlayer.onclick = () => openPlayerModal(player.id);

            playerContainer.appendChild(playerPosition);
            playerContainer.appendChild(playerListing);
            playerContainer.appendChild(playerTeam);
            playerContainer.appendChild(playersListRemoveButton);
            playerContainer.appendChild(listAddPlayer);
            playerContainer.appendChild(removeFromTeam)
            if (playersList) playersList.append(playerContainer);
            if (playerTeam.innerHTML !== 'sem time') {
                listAddPlayer.disabled = true
                playersListRemoveButton.disabled = true
                removeFromTeam.disabled = false
                if (removeFromTeam) removeFromTeam.addEventListener('click', () => removePlayerFromTeam(player.id))
            }
        });
        findDuplicatePlayers();
        listTeams();
    }
}

function findDuplicatePlayers() {
    const newDB = dbPlayers();

    if (playersList) {
        const unique = new Set(newDB.map((player: Player) => player.name));

        if (unique.size < newDB.length) {
            let duplicates = newDB
                .map((item: string) => item["name"])
                .map((item: string, index: number, final: string) => final.indexOf(item) !== index && index)
                .filter((obj: string) => newDB[obj])
                .map((item: string) => newDB[item]["id"]);

            let uniques = newDB.filter((obj: Player) => !duplicates.includes(obj.id));

            savePlayer(uniques);

            alert("NOT AUTHORIZED [ duplicate entry ]");

            // Update the list view
            playersList.innerHTML = "";
            listPlayers();
        }
    }
}

function removePlayerFromTeam(id: string) {
    const players = dbPlayers();

    const playerId = id;

    const currentPlayer = players.findIndex((item: Player) => item.id === playerId);

    players[currentPlayer].teamId = null
    savePlayer(players);
    listPlayers();
}

const openModal = document.createElement("div");
openModal.id = "modal";
openModal.classList.add("modal");
openModal.classList.add("hidden");

const closeModal = document.createElement("span");
closeModal.id = "closeModal";
closeModal.classList.add("closeModal");

const playerModal = document.createElement("div");
playerModal.id = "playerModal";
playerModal.classList.add("modalContent");
playerModal.classList.add("hidden");

const positionModal = document.createElement("div");
positionModal.id = "positionModal";
positionModal.classList.add("modalContent");
positionModal.classList.add("hidden");

document.body.appendChild(openModal);
openModal.appendChild(positionModal);
openModal.appendChild(closeModal);
openModal.appendChild(playerModal);

function openPlayerModal(id: string) {
    const openModal = document.getElementById("modal");

    const playerModal = document.getElementById("playerModal");

    openModal.classList.remove("hidden");
    playerModal.classList.remove("hidden")

    const teams = dbTeams();

    teams.forEach((team: Team) => {
        const eachTeam = document.createElement("p");
        eachTeam.innerHTML = `${team.name}`;
        eachTeam.id = team.id;
        eachTeam.classList.add('eachTeam')
        playerModal.appendChild(eachTeam);
        eachTeam.addEventListener("click", () => pushToTeam(team.id));
    });

    const players = dbPlayers();

    const playerId = id;

    const currentPlayer = players.findIndex((item: Player) => item.id === playerId);

    function pushToTeam(id: string) {
        players[currentPlayer].teamId = id;
        savePlayer(players);
        playerModal.innerHTML = "";
        playerModal.classList.add("hidden");
        openModal.classList.add("hidden");
        listPlayers();
    }

    window.addEventListener('click', (event) => {
        if (event.target == openModal) {
            openModal.classList.add('hidden')
            playerModal.innerHTML =""
        }
    })
}

function openPositionModal() {
    const openModal = document.getElementById("modal");

    const positionModal = document.getElementById("positionModal");

    openModal.classList.remove("hidden");
    positionModal.classList.remove("hidden");

    for (const pos in position) {
        const showEach = document.createElement("div");
        showEach.innerHTML = `${pos}`;
        showEach.classList.add('playerPositionModal')
        showEach.style.backgroundColor = colors.playerPosition[pos]
        positionModal.appendChild(showEach);
        showEach.addEventListener("click", () => chooseAndClose(pos));
    }

    function chooseAndClose(item: string) {
        positionInput.value = item;
        addPlayer(playerInput.value, positionInput.value);
        positionModal.classList.add("hidden");
        openModal.classList.add("hidden");
        listPlayers();
    }

    window.addEventListener('click', (event) => {
        if (event.target == openModal) {
            openModal.classList.add('hidden')
            positionModal.innerHTML = ""
        }
    })
}


listPlayers();
