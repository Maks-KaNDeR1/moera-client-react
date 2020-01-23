import { CONNECTED_TO_HOME, DISCONNECT_FROM_HOME } from "state/home/actions";
import { CARTES_PURGE_EXPIRED, CARTES_SET } from "state/cartes/actions";
import { now } from "util/misc";

const initialState = {
    initialized: false,
    cartes: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CONNECTED_TO_HOME:
        case CARTES_SET:
            return {
                ...state,
                initialized: true,
                cartes: action.payload.cartes != null ? action.payload.cartes : state.cartes
            };

        case DISCONNECT_FROM_HOME:
            return {
                ...state,
                initialized: true,
                cartes: []
            };

        case CARTES_PURGE_EXPIRED:
            return {
                ...state,
                cartes: state.cartes.filter(carte => carte.deadline > now())
            };

        default:
            return state;
    }
}
