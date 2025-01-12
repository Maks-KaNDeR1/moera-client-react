import { Action } from 'redux';

import { ActionWithPayload } from "state/action-types";

export const CONFIRM_BOX = "CONFIRM_BOX";
export type ConfirmBoxAction = ActionWithPayload<typeof CONFIRM_BOX, {
    message: string;
    yes: string | null;
    no: string | null;
    onYes: any;
    onNo: any;
    variant: string;
}>;
export const confirmBox = (message: string, yes: string | null = null, no: string | null = null,
                           onYes: any = null, onNo: any = null, variant: string = "primary"): ConfirmBoxAction => ({
    type: CONFIRM_BOX,
    payload: {message, yes, no, onYes, onNo, variant}
});

export const CLOSE_CONFIRM_BOX = "CLOSE_CONFIRM_BOX";
export type CloseConfirmBoxAction = Action<typeof CLOSE_CONFIRM_BOX>;
export const closeConfirmBox = (): CloseConfirmBoxAction => ({
    type: CLOSE_CONFIRM_BOX
});

export type ConfirmBoxAnyAction =
    ConfirmBoxAction
    | CloseConfirmBoxAction;
