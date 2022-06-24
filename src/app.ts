import { v4 as uuidv4 } from "uuid";

// I'm not using styles yet... but it's imported here in any case!
import "./styles.css";

// Type for the team object
type Team = {
  id: string;
  name: string;
};

// Type for the whole database
type DB = {
  teams: Team[];
};

const dbName = 'db'

// Initialize db and read the db's contents
const db = () => JSON.parse(localStorage.getItem(dbName) || '{"teams":[]}');

// Save to the db using the appropriate methods
function saveToDB(content: DB) {
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
    // Loop through the teams array and populate the list in the DOM
    db().teams
      .forEach((team: Team) => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');

        listItem.innerHTML = team.name + " "
        button.innerText = "Remove"
        if (button) button.onclick = () => removeTeam(team.id)

        listItem.appendChild(button)
        if (teamsList) teamsList.appendChild(listItem)
      });
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

// Remove a team from the db
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
