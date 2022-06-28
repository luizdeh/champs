import { v4 as uuidv4 } from "uuid";
import { createEdition } from "./edition";

// I'm not using styles yet... but it's imported here in any case!
import "./styles.css";

// Type for the team object
export type Team = {
  id: string;
  name: string;
};

// Type for the whole database
export type DB = {
  teams: Team[];
};

const dbName = 'db'

// Initialize db and read the db's contents
export const db = () => JSON.parse(localStorage.getItem(dbName) || '{"teams":[], "edition": [], "games": []}');

// Save to the db using the appropriate methods
export function saveToDB(content: DB) {
  return localStorage.setItem(dbName, JSON.stringify(content))
}

// List the teams in the HTML
function listTeams() {
  // Get the teamsList element from the DOM
  const teamsList = document.getElementById("teamsList");
  // Reset state
  if (teamsList) teamsList.innerHTML = ""

  // Check if there's any content otherwise just show an empty warning!
  if (db().teams.length > 0) {
    let teamNumber = 1
    // Loop through the teams array and populate the list in the DOM
    db().teams
      .forEach((team: Team) => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');

        listItem.innerHTML = teamNumber++ +" : "+ team.name + " "
        button.innerText = "X"
        if (button) button.onclick = () => removeTeam(team.id)

        listItem.appendChild(button)
        if (teamsList) teamsList.appendChild(listItem)
      });
    if (db().teams.length > 5) {
        const createChamps = document.createElement('button')
        createChamps.innerHTML = "create champs edition"
        if (createChamps) createChamps.onclick = () => createEdition()
        if (teamsList) teamsList.append(createChamps)
    }
  }

    // Append the empty message if there's no content
    if (teamsList && db().teams.length === 0) {
    const emptyMessageContainer = document.createElement('p')
    emptyMessageContainer.innerText = `There are currently no teams registered!`;
    teamsList.appendChild(emptyMessageContainer);
  }
}

// Get input element
// NOTE: This is defined here just so we can use it in the function below - addNewTeam
const addTeamName = document.getElementById("teamName") as HTMLInputElement;
// Add new teams
function addNewTeam(name: string) {
  // Set an unique ID for the team
  const id = uuidv4();

  // Add new entry only if it's not empty!
  if (name !== "") {
    // Append new entry to teams array
    const newDb = db();
    newDb.teams.push({ id, name });

    // Write to the db - localStorage
    saveToDB(newDb)
  }

  // Reset the input form
  addTeamName.value = "";
  // Update list view
  listTeams();
}

// Remove a teamfrom the db
function removeTeam(id: string) {
  // Find the team that you want to remove and create a new array
  const result = db().teams.filter((item: Team) => item.id !== id)
  // Replace the db content
  saveToDB({ teams: result });
  // Update the list view
  listTeams();
}

// This method is just to prevent the default of the <Form /> that we are using in the HTML
function formSubmit(event: SubmitEvent) {
  event.preventDefault();
}

// Get form
const addTeamForm = document.getElementById("addTeam");
// Add onsubmit to the form element
if (addTeamForm) addTeamForm.onsubmit = formSubmit;
// Get button
const button = document.getElementById("addButton");
// Add event listener to button only if it and the input form both exists
if (addTeamName && button) button.addEventListener("click", () => addNewTeam(addTeamName.value));

// Initialize teams view
listTeams();

export function shuffleTeams() {

  let editionList : any[] = [];

  db().teams.forEach((team) => editionList.push(team.name))

  function shuffle(array) {
      for (let i = array.length -1; i > 0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [array[i], array[j]] = [array[j], array[i]]
      }
      return array;
  };

  shuffle(editionList)

  return editionList
}

