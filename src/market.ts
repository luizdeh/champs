import { v4 as uuidv4 } from "uuid";
import { Player, Team, Game, dbPlayers, dbTeams, dbGames, saveGame, formSubmit } from "./app";

const showMarket = document.getElementById('showMarket')
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
    openMarketTeam.addEventListener('click', () => getTeamRoster(team.id))
}

teamsMarket.appendChild(openMarket)
showMarket.appendChild(teamsMarket)

const teamShowcase = document.createElement('div')
teamShowcase.classList.add('teamShowcase')
teamShowcase.id = 'teamShowcase'
teamShowcase.innerHTML = `ROSTER`
showMarket.appendChild(teamShowcase)

function getTeamRoster(id: Player) {

    const teams = teamsMarket.querySelectorAll('.openMarketTeam')

    teams.forEach((team) => {
        if (team.id === id) {
            team.style.backgroundColor = 'green'
        } else {
            team.style.backgroundColor = 'white'
        }
    })

    const roster = dbPlayers().filter((teamId: Player) => teamId === id)

    for (const player of roster) {
        const playerListing = document.createElement('li')
        if (!roster) playerListing.innerHTML = 'nothing to show'
        playerListing.innerHTML = `${player.position} | ${player.name}`
        teamShowcase.appendChild(playerListing)
    }
}



// const dropdownTeams = document.createElement('div')
// const dropdownShowTeams = document.createElement('button')

// dropdownTeams.classList.add('dropdownTeams')
// dropdownShowTeams.classList.add('dropdownShowTeams')

// dropdownTeams.id = 'dropdownList'
// dropdownShowTeams.id = 'dropdownShowTeams'

// dropdownShowTeams.setAttribute('value', 'Submit')
// dropdownShowTeams.innerText = `SELECT TEAM`

// if (dropdownShowTeams) dropdownShowTeams.addEventListener('click', () => toggleDropdownTeams())

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

// dropdownTeams.appendChild(dropdownShowTeams)
// showMarket.appendChild(dropdownTeams)
