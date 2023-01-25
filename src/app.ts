// Type for the team object
export type Team = {
  id: string;
  name: string;
  abbr: string;
};

export type Player = {
  id: string;
  position: string;
  name: string;
  teamId: string;
  positionIndex: number;
};

export type Game = {
  id: string;
  edition: {
    id: string;
    round: number;
    game: number;
  };
  teams: {
    home: {
      id: string;
      name: string;
      goals: number;
      whoScored: string;
      whoAssisted: string;
    };
    away: {
      id: string;
      name: string;
      goals: number;
      whoScored: string;
      whoAssisted: string;
    };
  };
};

export type Edition = {
  id: string;
  date: string;
  editionName: string;
  editionTeams: {
    teamId: string;
    roster: string;
  };
};

export type EditionList = {
  id: string;
  name: string;
};

export type TeamPairings = {
  home: string | null;
  away: string | null;
};

const TeamsDB = "teams";
const PlayersDB = "players";
const GamesDB = "games";
const EditionListDB = "teamsListForEdition";
const EditionsDB = "editions";

export const dbTeams = () => JSON.parse(localStorage.getItem(TeamsDB) || "[]");

export const dbPlayers = () =>
  JSON.parse(localStorage.getItem(PlayersDB) || "[]");

export const dbGames = () => JSON.parse(localStorage.getItem(GamesDB) || "[]");

export const dbEditionList = () =>
  JSON.parse(localStorage.getItem(EditionListDB) || "[]");

export const dbEditions = () =>
  JSON.parse(localStorage.getItem(EditionsDB) || "[]");

export function saveTeam(content: Team) {
  return localStorage.setItem(TeamsDB, JSON.stringify(content));
}

export function savePlayer(content: Player) {
  return localStorage.setItem(PlayersDB, JSON.stringify(content));
}

export function saveGame(content: Game) {
  return localStorage.setItem(GamesDB, JSON.stringify(content));
}

export function saveEditionList(content: string[]) {
  return localStorage.setItem(EditionListDB, JSON.stringify(content));
}

export function saveEdition(content: Edition) {
  return localStorage.setItem(EditionsDB, JSON.stringify(content));
}

dbTeams()
dbPlayers()
dbEditions()
dbGames()

export function cleanDB(id:string) {

  const editions = dbEditions()
  const newEditions = editions.filter((item:Edition) => item.id !== id)
  console.log(newEditions)

  const games = dbGames()
  const newGames= games.filter((item:Game) => item.id !== id)
  console.log(newGames)

}

// export localStorage to a JSON file
// const players = JSON.stringify(localStorage.players);
// const teams = JSON.stringify(localStorage.teams);
// const editions = JSON.stringify(localStorage.editions);
// const games = JSON.stringify(localStorage.games);

// const storages = [teams, players, editions, games];

// storages.forEach((item) => console.log(item))

// import JSON file to localStorage


export function formSubmit(event: SubmitEvent) {
  event.preventDefault();
}

export function emptyMessage(div: HTMLElement, message: string) {
  const emptyMessage = document.createElement("p");
  emptyMessage.innerHTML = message;
  div.appendChild(emptyMessage);
}

export type CreateElementType = {
  tag: string;
  id?: string;
  classes?: string;
};

export function createElement({ tag, id, classes }: CreateElementType) {
  const element = document.createElement(tag);

  if (classes) element.classList.add(classes);
  if (id) element.id = id;

  return element;
}

export const hidden = (item: Element) => {
  if (item.classList.contains("hidden")) {
    item.classList.remove("hidden");
  } else {
    item.classList.add("hidden");
  }
};

const navButtons = document.querySelectorAll(".navButton");
const getPagesQuery = document.querySelectorAll(".page");

const getPageId = (navButton: HTMLElement) => navButton.dataset.pagename;

const hide = (element: Element) => element.classList.add("hidden");

Object.keys(navButtons).forEach((key) => {
  navButtons[key].addEventListener("click", (e: any) => {
    e.preventDefault();

    Object.keys(navButtons).forEach((key) => {
      navButtons[key].classList.remove("navActive");
    });

    navButtons[key].classList.add("navActive");

    const elementId = getPageId(navButtons[key]);

    let target = elementId
      ? document.getElementById(elementId)
      : console.error("[Error] navButtons list is empty!");

    getPagesQuery.forEach(hide);
    if (target) target.classList.remove("hidden");
  });
});

// check if edition is complete
export function isComplete(id: string) {
  const games = dbGames().filter((game: Game) => game.edition.id === id);
  let complete: string[] = [];
  games.forEach((game: Game) => {
    if (!game.teams.home.goals || !game.teams.away.goals) {
      complete.push("not done");
    }
  });
  if (complete.length >= 1) {
    return false;
  } else {
    return true
  }
}

export function activeChamps() {
  return dbEditions().map((item:Edition) => {
    const complete = isComplete(item.id)
    if (complete) return item.id
  })
}

function loadDashIcon() {
  const logo = createElement({tag:'div',classes:'footerIcon'}) as HTMLImageElement
  let img = new Image()
  img.src = 'https://imgur.com/Jzq0fbX.png' ;
  img.height = 180
  img.width= 180
  logo.appendChild(img);
  return logo;
}
export const dashIcon = loadDashIcon()

// create the clickable 'banner' that renders the list of editions
// function loadIcon() {
//   const logo = createElement({tag:'div',classes:'icon'}) as HTMLImageElement
//   let img = new Image()
//   img.src = 'https://imgur.com/7RBx4uq.png' ;
//   logo.appendChild(img);
//   return logo;
// }
// export const champsIcon = loadIcon()
//

const games = dbGames()

export const scorers = () => {
  let goalers: any[] = []
  games.forEach((game:Game) => {
    const scoreHome = game.teams.home.whoScored
    const scoreAway = game.teams.away.whoScored
    
    scoreHome ? goalers.push(...scoreHome) : null
    scoreAway ? goalers.push(...scoreAway) : null
  })
  let count = goalers.reduce(function(acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1),
    acc
  } , {})
  let topScorers: any[] = [];
  for (let key in count) {
    topScorers.push({
      name: key,
      count: count[key]
    })
  }
  topScorers.sort((a: any, b: any) => b.count - a.count)
  const them = topScorers.slice(0,10)
  return them 
}

export const assisters = () => {
  let goalers: any[] = []
  games.forEach((game:Game) => {
    const scoreHome = game.teams.home.whoAssisted
    const scoreAway = game.teams.away.whoAssisted
    
    scoreHome ? goalers.push(...scoreHome) : null
    scoreAway ? goalers.push(...scoreAway) : null
  })
  let count = goalers.reduce(function(acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1),
    acc
  } , {})
  let topScorers: any[] = [];
  for (let key in count) {
    if (key !== '') {
    topScorers.push({
      name: key,
      count: count[key]
    })
    }
  }
  topScorers.sort((a: any, b: any) => b.count - a.count)
  const them = topScorers.slice(0,10)
  return them 
}

