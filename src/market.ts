import { v4 as uuidv4 } from "uuid";
import { Player, Team, Game, dbPlayers, dbTeams, dbGames, saveGame, formSubmit } from "./app";

const market = document.getElementById('market')
const teamsMarket = document.createElement('div')
const openMarket = document.createElement('ul')

teamsMarket.classList.add('teamsMarket')
teamsMarket.id = 'teamsMarket'

openMarket.classList.add('openMarket')
openMarket.id = 'openMarket'

const teams = dbTeams()

openMarket.innerHTML = `TEAM`

for (const team of teams) {
    const openMarketTeam = document.createElement('li')
    openMarketTeam.innerHTML = `${team.name}`
    openMarketTeam.id = team.id
    openMarketTeam.classList.add('openMarketTeam')
    openMarket.appendChild(openMarketTeam)
    // openMarketTeam.addEventListener('click', () => getTeamRoster(team.id))
}

teamsMarket.appendChild(openMarket)
market?.appendChild(teamsMarket)

const teamShowcase = document.createElement('div')
teamShowcase.classList.add('teamShowcase')
teamShowcase.id = 'teamShowcase'
teamShowcase.innerHTML = `ROSTER`
market?.appendChild(teamShowcase)

// function getTeamRoster(id: string) {

//     const teams = teamsMarket.querySelectorAll('.openMarketTeam')

//     teams.forEach((team: Element) => {
//         if (team.id === id) {
//             team.style.backgroundColor = 'green'
//         } else {
//             team.style.backgroundColor = 'white'
//         }
//     })

//     const roster = dbPlayers().filter((teamId: Player) => teamId === id)

//     for (const player of roster) {
//         const playerListing = document.createElement('li')
//         if (!roster) playerListing.innerHTML = 'nothing to show'
//         playerListing.innerHTML = `${player.position} | ${player.name}`
//         teamShowcase.appendChild(playerListing)
//     }
// }



// const dropdownTeams = document.createElement('div')
// const dropdownteams = document.createElement('button')

// dropdownTeams.classList.add('dropdownTeams')
// dropdownteams.classList.add('dropdownteams')

// dropdownTeams.id = 'dropdownList'
// dropdownteams.id = 'dropdownteams'

// dropdownteams.setAttribute('value', 'Submit')
// dropdownteams.innerText = `SELECT TEAM`

// if (dropdownteams) dropdownteams.addEventListener('click', () => toggleDropdownTeams())

// function toggleDropdownTeams() {

//     const teams = dbTeams()

//     const teamSelect = document.createElement('select')

//     teamSelect.name = 'selectTeam'
//     teamSelect.id = 'selectTeam'

//     for (const team of teams) {
//         let option = document.createElement('option')
//         option.value = team.name
//         option.id = team.id
//         option.text = `${team.name}`
//         teamSelect.appendChild(option)
//     }

//     const label = document.createElement('label')
//     label.innerHTML = ''
//     label.htmlFor = 'team'

//     dropdownTeams.appendChild(label).appendChild(teamSelect)
// }

// dropdownTeams.appendChild(dropdownteams)
// market.appendChild(dropdownTeams)
