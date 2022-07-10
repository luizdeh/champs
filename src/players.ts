import { v4 as uuidv4 } from "uuid";
import { Player, dbPlayers, savePlayer, formSubmit } from "./app";

const champs = document.getElementById('champs')

const togglePlayerButton = document.createElement("togglePlayerButton");
const togglePlayers = document.createElement("togglePlayers");

togglePlayerButton.classList.add("togglePlayerButton");
togglePlayers.classList.add("togglePlayers");

togglePlayerButton.style.cursor = "pointer";
togglePlayerButton.innerHTML = `${"PLAYERS"}`;
togglePlayerButton.addEventListener("click", () => toggleHidePlayers());

champs.appendChild(togglePlayers);

function toggleHidePlayers() {
    if (togglePlayers.style.display === "none") {
        togglePlayers.style.display = "block";
    } else {
        togglePlayers.style.display = "none";
    }
}

const playerForm = document.createElement("form");
const playerInput = document.createElement("input");
const playerSubmit = document.createElement("button");

playerForm.classList.add("playerForm");
playerInput.classList.add("playerInput");
playerSubmit.classList.add("playerSubmit");

playerForm.id = "playerForm";
playerInput.id = "playerInput";
playerSubmit.id = "playerSubmit";

playerForm.setAttribute("method", "post");

playerInput.setAttribute("type", "text");
playerInput.setAttribute("placeholder", "+ add player");

playerSubmit.setAttribute("value", "Submit");
playerSubmit.innerText = `save`;

champs.appendChild(togglePlayerButton);
champs.appendChild(togglePlayers);
togglePlayers.appendChild(playerForm);
playerForm.appendChild(playerInput);
playerForm.appendChild(playerSubmit);

if (playerForm) playerForm.onsubmit = formSubmit;
if (playerForm && playerSubmit)
    playerSubmit.addEventListener("click", () => addPlayer(playerInput.value));

function addPlayer(name: string) {
    const input = document.getElementById("playerInput") as HTMLInputElement;
    const id = uuidv4();
    if (name !== "") {
        const newDB = dbPlayers();
        newDB.push({ id: id, name: name });
        savePlayer(newDB);
    }
    input.value = "";
    listPlayers();
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
        let playerNumber = 1
        dbPlayers().forEach((player: Player) => {
            const listOfPlayers = document.createElement("li");
            const button = document.createElement("button");

            listOfPlayers.innerHTML = playerNumber++ + " : "+player.name + "  ";
            button.innerText = `x`;
            if (button) button.onclick = () => removePlayer(player.id);

            listOfPlayers.appendChild(button);
            if (playersList) playersList.append(listOfPlayers);
        });
        findDuplicatePlayers();
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

const playersList = document.createElement("div");
playersList.id = "playersList";
togglePlayers.appendChild(playersList);
listPlayers();
