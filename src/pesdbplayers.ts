import { createElement } from './app';
import pesdb from './players.json' //assert { type: 'JSON' };

const createPlayersDB = () => {

  const table = createElement({ tag: 'table', classes: 'pesdb' });
  const columns = createElement({ tag: 'colgroup' });
  columns.setAttribute('span', '37');
  const headerRow = createElement({ tag: 'tr', classes: 'pesdb-header' });

  const name = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const team = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const country = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const height = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const weight = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const age = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const foot = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const position = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  // const bestPosition = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  // const goodPosition = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  // const styles = createElement({ tag: 'th', classes: 'pesdb-header-item'});
  const offensiveAwareness = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const ballControl = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const dribbling = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const tightPossession = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const lowPass = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const loftedPass = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const finishing = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const heading = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const placeKicking = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const curl = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const speed = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const acceleration = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const kickingPower = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const jump = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const physicalContact = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const balance = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const stamina = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const defensiveAwareness = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const ballWinning = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const aggression = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const gKAwareness = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const gKCatching = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const gKClearing = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const gKReflexes = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const gKReach = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const weakFootUsage = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const weakFootAccuracy = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const form = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const injuryResistance = createElement({ tag:'th', classes:'pesdb-header-stat' });
  const overallRating = createElement({ tag:'th', classes:'pesdb-header-stat' });

  name.innerText = `PLAYER NAME`
  team.innerText = `TEAM`
  country.innerText = `COUNTRY`
  height.innerText = `HEIGHT`
  weight.innerText = `WEIGHT`
  age.innerText = `AGE`
  foot.innerText = `FOOT`
  position.innerText = `POSITION`
  // bestPosition.innerText = `BEST POSITIONS`
  // goodPosition.innerText = `GOOD POSITIONS`
  // styles.innerText = `PLAYING STYLES`
  offensiveAwareness.innerText = `OFFENSIVE AWARENESS`
  ballControl.innerText = `BALL CONTROL`
  dribbling.innerText = `DRIBBLING`
  tightPossession.innerText = `TIGHT POSESSION`
  lowPass.innerText = `LOW PASS`
  loftedPass.innerText = `LOFTED PASS`
  finishing.innerText = `FINISHING`
  heading.innerText = `HEADING`
  placeKicking.innerText = `PLACE KICKING`
  curl.innerText = `CURL`
  speed.innerText = `SPEED`
  acceleration.innerText = `ACCELERATION`
  kickingPower.innerText = `KICKING POWER`
  jump.innerText = `JUMP`
  physicalContact.innerText = `PHYSICAL CONTACT`
  balance.innerText = `BALANCE `
  stamina.innerText = `STAMINA`
  defensiveAwareness.innerText = `DEFENSIVE AWARENESS`
  ballWinning.innerText = `BALL WINNING`
  aggression.innerText = `AGGRESSION`
  gKAwareness.innerText = `GK AWARENESS`
  gKCatching.innerText = `GK CACTHING`
  gKClearing.innerText = `GK CLEARING`
  gKReflexes.innerText = `GK REFLEXES`
  gKReach.innerText = `GK REACH`
  weakFootUsage.innerText = `WEAK FOOT USAGE`
  weakFootAccuracy.innerText = `WEAK FOOT ACCURACY`
  form.innerText = `FORM`
  injuryResistance.innerText = `INJURY RESISTANCE`
  overallRating.innerText = `OVERALL RATING`

  headerRow.appendChild(name)
  headerRow.appendChild(team)
  headerRow.appendChild(country)
  headerRow.appendChild(height)
  headerRow.appendChild(weight)
  headerRow.appendChild(age)
  headerRow.appendChild(foot)
  headerRow.appendChild(position)
  headerRow.appendChild(overallRating)
  // headerRow.appendChild(bestPosition)
  // headerRow.appendChild(goodPosition)
  headerRow.appendChild(offensiveAwareness)
  headerRow.appendChild(ballControl)
  headerRow.appendChild(dribbling)
  headerRow.appendChild(tightPossession)
  headerRow.appendChild(lowPass)
  headerRow.appendChild(loftedPass)
  headerRow.appendChild(finishing)
  headerRow.appendChild(heading)
  headerRow.appendChild(placeKicking)
  headerRow.appendChild(curl)
  headerRow.appendChild(speed)
  headerRow.appendChild(acceleration)
  headerRow.appendChild(kickingPower)
  headerRow.appendChild(jump)
  headerRow.appendChild(physicalContact)
  headerRow.appendChild(balance)
  headerRow.appendChild(stamina)
  headerRow.appendChild(defensiveAwareness)
  headerRow.appendChild(ballWinning)
  headerRow.appendChild(aggression)
  headerRow.appendChild(gKAwareness)
  headerRow.appendChild(gKCatching)
  headerRow.appendChild(gKClearing)
  headerRow.appendChild(gKReflexes)
  headerRow.appendChild(gKReach)
  headerRow.appendChild(weakFootUsage)
  headerRow.appendChild(weakFootAccuracy)
  headerRow.appendChild(form)
  headerRow.appendChild(injuryResistance)
  // headerRow.appendChild(styles)
  table.appendChild(headerRow)

  return table
};

export const renderPlayersDB = () => {
  // const div = createElement({ tag:'div', classes:'tablerino' })
  const table = createPlayersDB()
  for (let i = 0; i <= pesdb.length -1; i++) {
      const row = createElement({ tag:'tr', classes:'playerRow' })
      const name = createElement({ tag: 'td', classes: 'table-item' });
      const team = createElement({ tag: 'td', classes: 'table-item' });
      const country = createElement({ tag: 'td', classes: 'table-item' });
      const height = createElement({ tag: 'td', classes: 'table-item' });
      const weight = createElement({ tag: 'td', classes: 'table-item' });
      const age = createElement({ tag: 'td', classes: 'table-item' });
      const foot = createElement({ tag: 'td', classes: 'table-item' });
      const position = createElement({ tag: 'td', classes: 'table-item' });
      // const bestPosition = createElement({ tag: 'td', classes: 'table-item'});
      // const goodPosition = createElement({ tag: 'td', classes: 'table-item'});
      // const styles = createElement({ tag: 'td', classes: 'table-item'});
      const offensiveAwareness = createElement({ tag:'td', classes:'table-item' });
      const ballControl = createElement({ tag:'td', classes:'table-item' });
      const dribbling = createElement({ tag:'td', classes:'table-item' });
      const tightPossession = createElement({ tag:'td', classes:'table-item' });
      const lowPass = createElement({ tag:'td', classes:'table-item' });
      const loftedPass = createElement({ tag:'td', classes:'table-item' });
      const finishing = createElement({ tag:'td', classes:'table-item' });
      const heading = createElement({ tag:'td', classes:'table-item' });
      const placeKicking = createElement({ tag:'td', classes:'table-item' });
      const curl = createElement({ tag:'td', classes:'table-item' });
      const speed = createElement({ tag:'td', classes:'table-item' });
      const acceleration = createElement({ tag:'td', classes:'table-item' });
      const kickingPower = createElement({ tag:'td', classes:'table-item' });
      const jump = createElement({ tag:'td', classes:'table-item' });
      const physicalContact = createElement({ tag:'td', classes:'table-item' });
      const balance = createElement({ tag:'td', classes:'table-item' });
      const stamina = createElement({ tag:'td', classes:'table-item' });
      const defensiveAwareness = createElement({ tag:'td', classes:'table-item' });
      const ballWinning = createElement({ tag:'td', classes:'table-item' });
      const aggression = createElement({ tag:'td', classes:'table-item' });
      const gKAwareness = createElement({ tag:'td', classes:'table-item' });
      const gKCatching = createElement({ tag:'td', classes:'table-item' });
      const gKClearing = createElement({ tag:'td', classes:'table-item' });
      const gKReflexes = createElement({ tag:'td', classes:'table-item' });
      const gKReach = createElement({ tag:'td', classes:'table-item' });
      const weakFootUsage = createElement({ tag:'td', classes:'table-item' });
      const weakFootAccuracy = createElement({ tag:'td', classes:'table-item' });
      const form = createElement({ tag:'td', classes:'table-item' });
      const injuryResistance = createElement({ tag:'td', classes:'table-item' });
      const overallRating = createElement({ tag:'td', classes:'table-item' });

      // const bestPos = [...pesdb[i][12].BestPositions]

      name.innerText = `${pesdb[i][0].PlayerName}`
      team.innerText = `${pesdb[i][1].TeamName}`
      country.innerText = `${pesdb[i][3].Nationality}`
      height.innerText = `${pesdb[i][5].Height}`
      weight.innerText = `${pesdb[i][6].Weight}`
      age.innerText = `${pesdb[i][7].Age}`
      foot.innerText = `${pesdb[i][8].Foot}`
      position.innerText = `${pesdb[i][10].Position}`
      // bestPosition.innerText = `${bestPos}`
      // goodPosition.innerText = `${pesdb[i][13].GoodPositions}`
      // styles.innerText = `${pesdb[i][14].PlayingStyles}`
      offensiveAwareness.innerText = `${pesdb[i][14][0].OffensiveAwareness}`
      ballControl.innerText = `${pesdb[i][14][1].BallControl}`
      dribbling.innerText = `${pesdb[i][14][2].Dribbling}`
      tightPossession.innerText = `${pesdb[i][14][3].TightPossession}`
      lowPass.innerText = `${pesdb[i][14][4].LowPass}`
      loftedPass.innerText = `${pesdb[i][14][5].LoftedPass}`
      finishing.innerText = `${pesdb[i][14][6].Finishing}`
      heading.innerText = `${pesdb[i][14][7].Heading}`
      placeKicking.innerText = `${pesdb[i][14][8].PlaceKicking}`
      curl.innerText = `${pesdb[i][14][9].Curl}`
      speed.innerText = `${pesdb[i][14][10].Speed}`
      acceleration.innerText = `${pesdb[i][14][11].Acceleration}`
      kickingPower.innerText = `${pesdb[i][14][12].KickingPower}`
      jump.innerText = `${pesdb[i][14][13].Jump}`
      physicalContact.innerText = `${pesdb[i][14][14].PhysicalContact}`
      balance.innerText = `${pesdb[i][14][15].Balance}`
      stamina.innerText = `${pesdb[i][14][16].Stamina}`
      defensiveAwareness.innerText = `${pesdb[i][14][17].DefensiveAwareness}`
      ballWinning.innerText = `${pesdb[i][14][18].BallWinning}`
      aggression.innerText = `${pesdb[i][14][19].Aggression}`
      gKAwareness.innerText = `${pesdb[i][14][20].GKAwareness}`
      gKCatching.innerText = `${pesdb[i][14][21].GKCatching}`
      gKClearing.innerText = `${pesdb[i][14][22].GKClearing}`
      gKReflexes.innerText = `${pesdb[i][14][23].GKReflexes}`
      gKReach.innerText = `${pesdb[i][14][24].GKReach}`
      weakFootUsage.innerText = `${pesdb[i][14][25].WeakFootUsage}`
      weakFootAccuracy.innerText = `${pesdb[i][14][26].WeakFootAccuracy}`
      form.innerText = `${pesdb[i][14][27].Form}`
      injuryResistance.innerText = `${pesdb[i][14][28].InjuryResistance}`
      overallRating.innerText = `${pesdb[i][14][29].OverallRating}`

      row.appendChild(name)
      row.appendChild(team)
      row.appendChild(country)
      row.appendChild(height)
      row.appendChild(weight)
      row.appendChild(age)
      row.appendChild(foot)
      row.appendChild(position)
      row.appendChild(overallRating)
      // row.appendChild(bestPosition)
      // row.appendChild(goodPosition)
      row.appendChild(offensiveAwareness)
      row.appendChild(ballControl)
      row.appendChild(dribbling)
      row.appendChild(tightPossession)
      row.appendChild(lowPass)
      row.appendChild(loftedPass)
      row.appendChild(finishing)
      row.appendChild(heading)
      row.appendChild(placeKicking)
      row.appendChild(curl)
      row.appendChild(speed)
      row.appendChild(acceleration)
      row.appendChild(kickingPower)
      row.appendChild(jump)
      row.appendChild(physicalContact)
      row.appendChild(balance)
      row.appendChild(stamina)
      row.appendChild(defensiveAwareness)
      row.appendChild(ballWinning)
      row.appendChild(aggression)
      row.appendChild(gKAwareness)
      row.appendChild(gKCatching)
      row.appendChild(gKClearing)
      row.appendChild(gKReflexes)
      row.appendChild(gKReach)
      row.appendChild(weakFootUsage)
      row.appendChild(weakFootAccuracy)
      row.appendChild(form)
      row.appendChild(injuryResistance)
      // row.appendChild(styles)
      table.appendChild(row)
  }
  // div.appendChild(table)
  return table
}
