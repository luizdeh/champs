import { v4 as uuidv4 } from "uuid";
import { dbPlayers, Player, dbGames, Game, dbTeams, Team, saveTeam, formSubmit } from "./app";
import { generateTeamsList, enableNewEditionButton } from "./editions";
import { colors } from "./appConfig"

const showTeams = document.getElementById('showTeams')

// Set form to add teams
const teamForm = document.createElement("form");
const teamInput = document.createElement("input");
const abbrInput = document.createElement('input')
const teamSubmit = document.createElement("button");
const teamsList = document.createElement("div");

teamForm.classList.add("teamForm");
teamInput.classList.add("teamInput");
abbrInput.classList.add('teamInput')
teamSubmit.classList.add("teamSubmit");

teamForm.id = "teamForm";
teamInput.id = "teamInput";
teamSubmit.id = "teamSubmit";
teamsList.id = "teamsList";
abbrInput.id = 'abbrInput'

teamForm.setAttribute("method", "post");

teamInput.setAttribute("type", "text");
teamInput.setAttribute("placeholder", "+ add team");
teamInput.setAttribute('required', 'please enter only letters')
// teamInput.setAttribute('maxlength', '45')
teamInput.setAttribute('pattern', '[a-zA-z]{3,45}')
teamInput.setAttribute('autocomplete', 'off')

abbrInput.setAttribute('type', 'text')
abbrInput.setAttribute('placeholder', 'three letter abbreviation')
abbrInput.setAttribute('name', 'acronym')
abbrInput.setAttribute('required', 'please enter three letters')
abbrInput.setAttribute('minlength', '3')
abbrInput.setAttribute('maxlength', '3')
abbrInput.setAttribute('pattern', '[a-zA-z]{3}')
teamInput.setAttribute('autocomplete', 'off')

teamSubmit.setAttribute("value", "Submit");
teamSubmit.innerText = `save`;

teamForm.appendChild(teamInput);
teamForm.appendChild(abbrInput)
teamForm.appendChild(teamSubmit);
showTeams.appendChild(teamForm);
showTeams.appendChild(teamsList);

if (teamForm) teamForm.onsubmit = formSubmit;
if (teamInput && teamSubmit)
    teamSubmit.addEventListener("click", () => addTeam(teamInput.value, abbrInput.value));

function emptyMessage(div: HTMLElement) {

    const emptyMessage = document.createElement("p");
    emptyMessage.innerText = `There are currently NO TEAMS registered!`;
    div.appendChild(emptyMessage);
}

function createTeamContainer(id: string) {

        const teamObject = dbTeams().filter((team: Team) => team.id === id)

        const teamContainer = document.createElement("div");
        const listTeam = document.createElement("p");
        const listAbbr = document.createElement("p")

        teamContainer.classList.add("teamContainer");
        listTeam.classList.add("listTeam");
        listAbbr.classList.add("listAbbr")

        // teamContainer.id = teamObject[0].id;

        listTeam.innerHTML = `${teamObject[0].name}`
        listAbbr.innerHTML = `${teamObject[0].abbr}`

        listAbbr.style.color = colors.primary[teamObject[0].abbr]
        listAbbr.style.backgroundColor = colors.secondary[teamObject[0].abbr]

        teamContainer.appendChild(listTeam);
        teamContainer.appendChild(listAbbr);

        return teamContainer
}

function createTeamControl(id: string) {

        // const teamObject = dbTeams().filter((team: Team) => team.id === id)

        const teamControl = document.createElement('div')
        const listTeamRemove = document.createElement("button");
        const listTeamAdd = document.createElement("button");

        teamControl.classList.add('teamControl')
        listTeamRemove.classList.add("listTeamRemove");
        listTeamAdd.classList.add("listTeamAdd");

        // teamControl.id = teamObject[0].id

        listTeamRemove.innerText = `[ remove ]`;
        listTeamAdd.innerText = `[ add to next edition ]`;

        teamControl.appendChild(listTeamRemove)
        teamControl.appendChild(listTeamAdd)

        if (checkRoster(id)) listTeamRemove.disabled = true
        if (listTeamRemove) listTeamRemove.onclick = () => removeTeam(id);
        if (listTeamAdd) listTeamAdd.onclick = () => generateTeamsList(id);

        return teamControl
}
function populateTeamsList() {
    dbTeams().forEach((team: Team) => {
        const teamsList = document.getElementById('teamsList')

        let container = createTeamContainer(team.id)
        let control = createTeamControl(team.id)

        const teamContainerControl = document.createElement('div')
        teamContainerControl.classList.add('teamContainerControl')
        teamContainerControl.id = team.id
        teamContainerControl.appendChild(container)
        teamContainerControl.appendChild(control)
        teamsList.appendChild(teamContainerControl)

    })
}

export function getTeamName(id: string) {
    return dbTeams().filter((team: Team) => team.id === id).map((name: Team) => name.name)[0]
}
// function getTeamAbbr(id: string) {

//     return dbTeams().filter((team: Team) => team.id === id).map((name: Team) => name.abbr)[0]
// }

//list team
export function listTeams() {

    if (teamsList) teamsList.innerHTML = "";

    const empty = () => dbTeams().length === 0 || undefined;

    if (teamsList && empty()) { emptyMessage(teamsList) }

    if (teamsList && !empty()) {
        populateTeamsList()
        findDuplicateTeams();
    }
    enableNewEditionButton();
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
function addTeam(name: string, abbr: string) {
    const teamInput = document.getElementById("teamInput") as HTMLInputElement;
    const abbrInput = document.getElementById("abbrInput") as HTMLInputElement;
    const id = uuidv4();
    if (name !== "") {
        const newDB = dbTeams();
        if (abbrInput.value) {
            newDB.push({ id: id, name: name, abbr: abbr});
            saveTeam(newDB);
        }
    }
    teamInput.value = "";
    abbrInput.value = "";
    listTeams();
}
// remove team
function removeTeam(id: string) {
    const result = dbTeams().filter((item: Team) => item.id !== id);
    saveTeam(result);
    listTeams();
}

function checkRoster(id: string) {

    const teamId = id

    const player = dbPlayers().filter((player: Player) => player.teamId === teamId)

    if (player.length > 0) {
        return true
    } else {
        return false
    }
}

listTeams();
