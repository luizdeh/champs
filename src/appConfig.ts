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
export const positionIndex = {
    positionIndex: {
        [position.GO]: 0,
        [position.ZC]: 1,
        [position.LD]: 2,
        [position.LE]: 3,
        [position.VOL]: 4,
        [position.MLG]: 5,
        [position.MLD]: 6,
        [position.MLE]: 7,
        [position.MAT]: 8,
        [position.PTD]: 9,
        [position.PTE]: 10,
        [position.SA]: 11,
        [position.CA]: 12,
    }
}
export const teamsPalette = {
AFD: 'AFD',
ALL: 'ALL',
DTU: 'DTU',
DDP: 'DDP',
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
        [teamsPalette.DDP]: {
            primary: '#e6e6e6',
            secondary: 'grey'
        },
        [teamsPalette.DTU]: {
            primary: 'navyblue',
            secondary: 'lightblue'
        }
    }
}
// criar paleta de cores,
// array de objetos: primary e secondary
