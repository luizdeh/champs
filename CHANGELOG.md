## ROADMAP

- Allow export/import of localStorage for backups
- Change localstorage to mongoDB
- Set up user login: define what users can edit, interact and view
- Create a 'pause' function that doesn't ler users do (almost) anything while an edition is being played
- Set up a color palette for users to choose from and define team colors
- Enable users to add team emblems
- Enable market header
- Enable dashboard header
- Make use of the dashboard
  - Current open edition
  - Show per user:
    - current team
    - trophies
    - trade proposals
    - logo ( let them upload their own )
    - display team colors ( users can edit them )

## CHANGELOG

### [0.2 alpha] - 2022-11-11
- Enabled dashboard
- Make use of the dashboard
  - Last champions
  - Leaderboards ( for users, players and teams )

### [0.1 alpha] - 2022-08-17
- Create a simple HTML page
- Create a localStorage DB
- Add items to the DB
- Remove items from the DB
- Create a games table
- Create games with registered teams and save it to the DB
- Improve the Teams object (add more data to it)
- Create a Players "table" with players entries
- Create a method to attach a team id to a player
- Create a method to recreate a games table from a certain edition (mainly to bypass accidental refreshes that wipe the table but maintain the information in the games database)
- Fix the way users input game results
  - Input is being checked by a keyup event and is triggering when it shouldn't
  - Users will have a hard time with the mouse, it works fine with clicking on home input and tabbing to away input
- Fix the issue where a drawn game with no goals is not recognized as valid input
