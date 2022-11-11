import { createElement, dbGames, Game, dbPlayers, Player, dashIcon, emptyMessage, scorers, assisters } from './app'
import { getOverallStats, editionsArray, overallStats } from './editions'
import { getTeamName, getTeamAbbr } from './teams';
import { logos } from './appConfig';

// logic
const games = dbGames()

if (games) getOverallStats()

function getPlayerName(id: string) {
  const players = dbPlayers().find((player: Player) => player.id === id);
  let name = players ? players.name : 'OWN GOAL'
  return name
}

function loadChampionLogo(team:string) {
  const teamLogo = createElement({tag:'div',classes:'championsListTeamLogo'}) as HTMLImageElement
  let img = new Image()
  img.src = `${logos[`${team}`]}`
  img.width = 35
  img.height = 35
  teamLogo.appendChild(img)
  return teamLogo
}

function loadCardLogo(team:string) {
  const teamLogo = createElement({tag:'div',classes:'cardLogo'}) as HTMLImageElement
  let img = new Image()
  img.src = `${logos[`${team}`]}`
  img.width = 85
  img.height = 85
  teamLogo.appendChild(img)
  return teamLogo
}

// render
const dash = document.getElementById('dash');

// the grid
const grid = createElement({tag:'div',classes:'dashGrid'}) as HTMLElement
const gridLeft = createElement({tag:'div',classes:'dashGridLeft'}) as HTMLElement
const gridCenter = createElement({tag:'div',classes:'dashGridCenter'}) as HTMLElement
const gridRight = createElement({tag:'div',classes:'dashGridRight'}) as HTMLElement

grid.appendChild(gridLeft)
grid.appendChild(gridCenter)
grid.appendChild(gridRight)

if (dash) dash.appendChild(grid)

// grid footer
if (dash) dash.appendChild(dashIcon)

// grid center
let forTheCards:any[] = []
if (overallStats) generateRankingList(overallStats)

function generateRankingTitle() {

  const rankingTitle = createElement({tag:'div',classes:'rankingTitle'}) as HTMLElement
  
  const renderIndex = createElement({tag:'span',classes:'rankingTitleIndex'}) as HTMLElement
  renderIndex.innerHTML = ``
  
  const renderParticipation = createElement({tag:'span',classes:'rankingTitleParticipation'}) as HTMLElement
  renderParticipation.innerHTML = `PARTICIPATION`
  
  const renderName = createElement({tag:'span',classes:'rankingTitleName'}) as HTMLElement
  renderName.innerHTML = `RANKING`
  
  const renderPoints = createElement({tag:'span',classes:'rankingTitleVal'}) as HTMLElement
  renderPoints.innerHTML = `POINTS`
  
  const renderChampion = createElement({tag:'span',classes:'rankingTitleVal'}) as HTMLElement
  renderChampion.innerHTML = `TITLES`
  
  rankingTitle.appendChild(renderIndex)
  rankingTitle.appendChild(renderName)
  rankingTitle.appendChild(renderParticipation)
  rankingTitle.appendChild(renderPoints)
  rankingTitle.appendChild(renderChampion)
  
  return rankingTitle
}

function generateRankingList(obj: any[]) {
  
  const titleListContainer = createElement({tag:'div',classes:'titleListContainer'}) as HTMLElement
  const listContainer = createElement({tag:'div',classes:'rankingListContainer'}) as HTMLElement

  for (let i = 0; i < obj.length; i++) {

    const { champion, rankingPoints: points, teamId: teamId, pointsPercentage, goalsScored, goalsAgainst, games, participation, ...rest } = obj[i]

    const goalsPerGame = goalsScored / games
    const goalsAllowedPerGame = goalsAgainst / games
    
    forTheCards.push({teamId, pointsPercentage, goalsScored, goalsAgainst, games, goalsPerGame, goalsAllowedPerGame})

    const rankingList = createElement({tag:'div',classes:'rankingListItem'}) as HTMLElement
    const item = createElement({tag:'div',classes:'rankingListItemContainer'}) as HTMLElement

    const renderIndex = createElement({tag:'span',classes:'rankingListEntryIndex'}) as HTMLElement
    renderIndex.innerHTML = `${i+1}.`

    const renderName = createElement({tag:'span',classes:'rankingListEntryName'}) as HTMLElement
    renderName.innerHTML = `${getTeamName(teamId).toUpperCase()}`

    const renderParticipation = createElement({tag:'span',classes:'rankingListEntryParticipation'}) as HTMLElement
    renderParticipation.innerHTML = `${participation}`
    
    const renderPoints = createElement({tag:'span',classes:'rankingListEntryVal'}) as HTMLElement
    renderPoints.innerHTML = `${points}`

    const renderChampion = createElement({tag:'div',classes:'rankingListEntryTrophies'}) as HTMLElement
    for (let j = 1; j <= champion; j++) {
      const span = createElement({tag:'span',classes:'trophies'}) as HTMLElement
      const icon = `<i class='fa-solid fa-trophy'></i>`
      span.innerHTML = icon
      renderChampion.appendChild(span)
    }

    item.appendChild(renderIndex)
    item.appendChild(renderName)
    item.appendChild(renderParticipation)
    item.appendChild(renderPoints)
    item.appendChild(renderChampion)
    rankingList.appendChild(item)
    listContainer.appendChild(rankingList)
  }
  titleListContainer.appendChild(generateRankingTitle())
  titleListContainer.appendChild(listContainer)
  gridCenter.appendChild(titleListContainer)
}

const winPct = forTheCards.sort((a,b) => b.pointsPercentage - a.pointsPercentage || b.games - a.games)[0]
const offense = forTheCards.sort((a,b) => b.goalsPerGame - a.goalsPerGame || b.games - a.games)[0]
const defense = forTheCards.sort((a,b) => a.goalsAllowedPerGame - b.goalsAllowedPerGame || b.games - a.games)[0]

function generateCard(info:any,str:string,id:string) {
  const card = createElement({tag:'div',classes:'card'}) as HTMLElement
  const title = createElement({tag:'span',classes:'cardTitle'}) as HTMLElement
  const infoContainer = createElement({tag:'div',classes:'cardInfo'}) as HTMLElement
  const span = createElement({tag:'span',classes:'cardInner'}) as HTMLElement
  const symbol = createElement({tag:'span',classes:'cardInnerSymbol'}) as HTMLElement
  const team = getTeamAbbr(id).toUpperCase()
  const teamLogo = loadCardLogo(team)
  title.innerHTML = `${str}`
  span.innerHTML = `${info}`
  symbol.innerHTML = `${str === 'PERFORMANCE' ? '%' : 'G'}`
  card.appendChild(title)
  infoContainer.appendChild(teamLogo)
  infoContainer.appendChild(span)
  infoContainer.appendChild(symbol)
  card.appendChild(infoContainer)
  return card
}

if (winPct) gridCenter.appendChild(generateCard(`${(Math.round(winPct.pointsPercentage*100))}`,'PERFORMANCE',winPct.teamId))
if (offense) gridCenter.appendChild(generateCard(offense.goalsPerGame.toFixed(2),'BEST OFFENSE',offense.teamId))
if (defense) gridCenter.appendChild(generateCard(defense.goalsAllowedPerGame.toFixed(2),'BEST DEFENSE',defense.teamId))

// left grid
const championsList = createElement({tag:'div',classes:'championsList'}) as HTMLElement
const championsListTitle = createElement({tag:'div',classes:'goalsAndAssistsTitle'}) as HTMLElement
championsListTitle.innerHTML = `LIST OF CHAMPIONS`
championsList.appendChild(championsListTitle)
gridLeft.appendChild(championsList)

function populateChampionList() {
  return editionsArray.length >= 1
    ? editionsArray.forEach(item => {
      const listItem = createElement({tag:'li',classes:'championsListItem'}) as HTMLLIElement
      const container = createElement({tag:'div',classes:'championsListContainer'}) as HTMLElement
      const teamContainer = createElement({tag:'div',classes:'championsListTeamContainer'}) as HTMLElement
      const team = createElement({tag:'span',classes:'championsListTeam'}) as HTMLElement
      const editionContainer = createElement({tag:'div',classes:'editionContainer'}) as HTMLElement
      const editionDate = createElement({tag:'span',classes:'championsListDate'}) as HTMLElement
      const editionName = createElement({tag:'span',classes:'championsListName'}) as HTMLElement

      const abbr = getTeamAbbr(item.results[0].teamId).toUpperCase()
      const teamLogo = loadChampionLogo(abbr)

      team.innerHTML = `${getTeamName(item.results[0].teamId).toUpperCase()}`
      editionDate.innerHTML = `${item.date}`
      editionName.innerHTML = `${item.name}`
      
      editionContainer.appendChild(editionDate)
      editionContainer.appendChild(editionName)
      teamContainer.appendChild(team)
      teamContainer.appendChild(teamLogo)
      container.appendChild(teamContainer)
      container.appendChild(editionContainer)
      listItem.appendChild(container)
      championsList.appendChild(listItem)
    })
      : emptyMessage(championsList,'No trophies were found anywhere.')
}

// right grid
const goalsAndAssists = createElement({tag:'div',classes:'goalsAndAssists'}) as HTMLElement
const goals = createElement({tag:'div',classes:'goalsAndAssistsContainer'}) as HTMLElement
const assists = createElement({tag:'div',classes:'goalsAndAssistsContainer'}) as HTMLElement

const goalsTitle = createElement({tag:'div',classes:'goalsAndAssistsTitle'}) as HTMLElement
const assistsTitle = createElement({tag:'div',classes:'goalsAndAssistsTitle'}) as HTMLElement

goalsTitle.innerHTML = `ALL-TIME FINISHERS`
assistsTitle.innerHTML = `ALL-TIME PASSERS`

goals.appendChild(goalsTitle)
assists.appendChild(assistsTitle)

goalsAndAssists.appendChild(goals)
goalsAndAssists.appendChild(assists)
gridRight.appendChild(goalsAndAssists)

function populateScorerList() {
return scorers().length
  ? scorers().forEach((item,index) => {
    const listItem = createElement({tag:'div',classes:'goalsAndAssistsItem'}) as HTMLLIElement
    const i = createElement({tag:'span',classes:'listItemIndex'}) as HTMLElement
    const name = createElement({tag:'span',classes:'listItemName'}) as HTMLElement
    const number = createElement({tag:'span',classes:'listItemNumber'}) as HTMLElement

    i.innerHTML = `${index+1}.`
    name.innerHTML = `${getPlayerName(item.name).toUpperCase()}`
    number.innerHTML = `${item.count}`

    if (index === 0) listItem.classList.add('striker')
    
    listItem.append(i)
    listItem.appendChild(name)
    listItem.appendChild(number)
    goals.appendChild(listItem)
  }) 
  : emptyMessage(goals,'Nobody scored a goal yet.')
}

function populateAssistList() {
return assisters().length
  ? assisters().forEach((item,index) => {
    const listItem = createElement({tag:'li',classes:'goalsAndAssistsItem'}) as HTMLLIElement
    const i = createElement({tag:'span',classes:'listItemIndex'}) as HTMLElement
    const name = createElement({tag:'span',classes:'listItemName'}) as HTMLElement
    const number = createElement({tag:'span',classes:'listItemNumber'}) as HTMLElement
    
    i.innerHTML = `${index+1}.`
    name.innerHTML = `${getPlayerName(item.name).toUpperCase()}`
    number.innerHTML = `${item.count}`

    if (index === 0) listItem.classList.add('striker')
    
    listItem.appendChild(i)
    listItem.appendChild(name)
    listItem.appendChild(number)
    assists.appendChild(listItem)
  }) 
  : emptyMessage(assists,'If nobody scored, then no one passed the ball.')
}

scorers()
assisters()
populateChampionList()
populateScorerList()
populateAssistList()
