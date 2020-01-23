export const CARTES_LOAD = "CARTES_LOAD";
export const cartesLoad = () => ({
    type: CARTES_LOAD
});

export const CARTES_SET = "CARTES_SET";
export const cartesSet = (cartes) => ({
    type: CARTES_SET,
    payload: {cartes}
});

export const CARTES_PURGE_EXPIRED = "CARTES_PURGE_EXPIRED";
export const cartesPurgeExpired = () => ({
    type: CARTES_PURGE_EXPIRED
});
