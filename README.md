# team-management-example
A simple app (at least initially) for managing teams, players, and games

## TODO
- ~~Create a simple HTML page~~
- ~~Create a localStorage DB~~
- ~~Add items to the DB~~
- ~~Remove items from the DB~~
- ~~Create a games table~~
- ~~Create games with registered teams and save it to the DB~~
- ~~Improve the Teams object (add more data to it)~~
- ~~Create a Players "table" with players entries~~
- ~~Create a method to attach a team id to a player~~
- ~~Create a method to recreate a games table from a certain edition (mainly to bypass accidental refreshes that wipe the table but maintain the information in the games database)~~
- ~~Verify if creating helper functions to save, edit and remove teams, players and games is better than having three separate functions for the different databases~~
- ~~Organize what is displayed to the user~~
- Fix the way users input game results
  - Input is being checked by a keyup event and is triggering when it shouldn't
  - Users will have a hard time with the mouse, it works fine with clicking on home input and tabbing to away input
  - Fix the issue where a drawn game with no goals is not recognized as valid input
- Create a 'pause' function that doesn't ler users do (almost) anything while an edition is being played
- Set up a color palette for users to choose from and define team colors
- Set up user login: define what users can edit, interact and view
- Make use of the dashboard
  - Current open edition
  - Last champions
  - Leaderboards ( for users, players and teams )
  - Show per user:
    - current team
    - trophies
    - trade proposals
    - logo ( let them upload their own )
    - display team colors ( users can edit them )
