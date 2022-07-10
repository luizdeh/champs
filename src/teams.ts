import { v4 as uuidv4 } from "uuid";
import { Team, dbTeams, saveTeam, formSubmit } from "./app";
import { generateTeamsList } from "./editions";

const champs = document.getElementById("champs");

const toggleTeamsButton = document.createElement("toggleTeamsButton");
const toggleTeams = document.createElement("toggleTeams");

toggleTeamsButton.classList.add("toggleTeamsButton");
toggleTeams.classList.add("toggleTeams");

toggleTeamsButton.style.cursor = "pointer";
toggleTeamsButton.innerHTML = `${"TEAMS"}`;
toggleTeamsButton.addEventListener("click", () => toggleHideTeams());

champs.appendChild(toggleTeams);

function toggleHideTeams() {
    if (toggleTeams.style.display === "none") {
        toggleTeams.style.display = "block";
    } else {
        toggleTeams.style.display = "none";
    }
}

// Set form to add teams
const teamForm = document.createElement("form");
const teamInput = document.createElement("input");
const teamSubmit = document.createElement("button");

teamForm.classList.add("teamForm");
teamInput.classList.add("teamInput");
teamSubmit.classList.add("teamSubmit");

teamForm.id = "teamForm";
teamInput.id = "teamInput";
teamSubmit.id = "teamSubmit";

teamForm.setAttribute("method", "post");

teamInput.setAttribute("type", "text");
teamInput.setAttribute("placeholder", "+ add team");

teamSubmit.setAttribute("value", "Submit");

teamSubmit.innerText = `save`;

champs.appendChild(toggleTeamsButton);
champs.appendChild(toggleTeams);
toggleTeams.appendChild(teamForm);
teamForm.appendChild(teamInput);
teamForm.appendChild(teamSubmit);

if (teamForm) teamForm.onsubmit = formSubmit;
if (teamInput && teamSubmit)
    teamSubmit.addEventListener("click", () => addTeam(teamInput.value));

//list team
function listTeams() {
    if (teamsList) teamsList.innerHTML = "";
    const empty = () => dbTeams().length === 0 || undefined;

    if (teamsList && empty()) {
        const emptyMessage = document.createElement("p");
        emptyMessage.innerText = `There are currently NO TEAMS registered!`;
        teamsList.appendChild(emptyMessage);
    }

    if (teamsList && !empty()) {
        let teamNumber = 1;

        // Loop through the teams array and populate the list in the DOM
        dbTeams().forEach((team: Team) => {
            const teamContainer = document.createElement('div')
            const listTeam = document.createElement("li");
            const listTeamRemove = document.createElement("button");
            const listTeamAdd = document.createElement('button')

            teamContainer.classList.add('teamContainer')
            listTeam.classList.add('listTeam')
            listTeamRemove.classList.add('listTeamRemove')
            listTeamAdd.classList.add('listTeamAdd')

            teamContainer.id = team.id
            listTeam.id = team.id
            listTeamRemove.id = team.id
            listTeamAdd.id = team.id

            listTeam.innerHTML = teamNumber++ + " : " + team.name + "   ";
            listTeamRemove.innerText = `remove`;
            listTeamAdd.innerText = `mark for new edition`
            if (listTeamRemove) listTeamRemove.onclick = () => removeTeam(team.id);
            if (listTeamAdd) listTeamAdd.onclick = () => generateTeamsList(team.id)

            if (teamsList)
                teamsList.appendChild(teamContainer)
                teamContainer.appendChild(listTeam)
                teamContainer.appendChild(listTeamRemove)
                teamContainer.appendChild(listTeamAdd)
        });
    findDuplicateTeams()
    }
}

function findDuplicateTeams() {
    const newDB = dbTeams();

    if (teamsList) {
        const unique = new Set(newDB.map((team: Team) => team.name));

        if (unique.size < newDB.length) {
            let duplicates = newDB
                .map((item: string) => item["name"])
                .map((item: string, index: number, final: string) => final.indexOf(item) !== index && index)
                .filter((obj: string) => newDB[obj])
                .map((item: string) => newDB[item]["id"]);

            let uniques = newDB.filter((obj: Team) => !duplicates.includes(obj.id));

            saveTeam(uniques);

            alert("NOT AUTHORIZED [ duplicate entry ]");

            // Update the list view
            teamsList.innerHTML = "";
            listTeams();
        }
    }
}
// add team
function addTeam(name: string) {
    const input = document.getElementById("teamInput") as HTMLInputElement;
    const id = uuidv4();
    if (name !== "") {
        const newDB = dbTeams();
        newDB.push({ id: id, name: name });
        saveTeam(newDB);
    }
    input.value = "";
    listTeams();
}
// remove team
function removeTeam(id: string) {
    const result = dbTeams().filter((item: Team) => item.id !== id);
    saveTeam(result);
    listTeams();
}

const teamsList = document.createElement("div");
teamsList.id = "teamsList";
toggleTeams.appendChild(teamsList);
listTeams();
