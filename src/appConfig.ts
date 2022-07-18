export const position = {
    GO: "GO",
    ZC: "ZC",
    LD: "LD",
    LE: "LE",
    VOL: "VOL",
    MLG: "MLG",
    MLD: "MLD",
    MLE: "MLE",
    MAT: "MAT",
    PTD: "PTD",
    PTE: "PTE",
    SA: "SA",
    CA: "CA",
};

export const teamsPalette = {
AFD: 'AFD',
ALL: 'ALL',
DTU: 'DTU',
}

export const colors = {
    playerPosition: {
        [position.GO]: "#fcf7de",
        [position.ZC]: "#c7dae3",
        [position.LD]: "#def3fd",
        [position.LE]: "#def3fd",
        [position.VOL]: "#defde0",
        [position.MLG]: "#defde0",
        [position.MLD]: "#defde0",
        [position.MLE]: "#defde0",
        [position.MAT]: "#defde0",
        [position.PTD]: "#fddfdf",
        [position.PTE]: "#fddfdf",
        [position.SA]: "#fddfdf",
        [position.CA]: "#fddfdf",
    },
    teamsPalette: {
        [teamsPalette.AFD]: {
            primary: 'darkgreen',
            secondary: 'limegreen'
        },
        [teamsPalette.ALL]: {
            primary: 'pink',
            secondary: 'brown'
        },
        [teamsPalette.DTU]: {
            primary: 'navyblue',
            secondary: 'lightblue'
        }
    }
}
// criar paleta de cores,
// array de objetos: primary e secondary
