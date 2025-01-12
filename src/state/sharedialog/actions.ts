import { Action } from 'redux';

import { ActionWithPayload } from "state/action-types";

export const SHARE_DIALOG_PREPARE = "SHARE_DIALOG_PREPARE";
export type ShareDialogPrepareAction = ActionWithPayload<typeof SHARE_DIALOG_PREPARE, {
    nodeName: string;
    href: string;
}>;
export const shareDialogPrepare = (nodeName: string, href: string): ShareDialogPrepareAction => ({
    type: SHARE_DIALOG_PREPARE,
    payload: {nodeName, href}
});

export const OPEN_SHARE_DIALOG = "OPEN_SHARE_DIALOG";
export type OpenShareDialogAction = ActionWithPayload<typeof OPEN_SHARE_DIALOG, {
    title: string;
    url: string;
}>;
export const openShareDialog = (title: string, url: string): OpenShareDialogAction => ({
    type: OPEN_SHARE_DIALOG,
    payload: {title, url}
});

export const CLOSE_SHARE_DIALOG = "CLOSE_SHARE_DIALOG";
export type CloseShareDialogAction = Action<typeof CLOSE_SHARE_DIALOG>;
export const closeShareDialog = (): CloseShareDialogAction => ({
    type: CLOSE_SHARE_DIALOG
});

export const SHARE_DIALOG_COPY_LINK = "SHARE_DIALOG_COPY_LINK";
export type ShareDialogCopyLinkAction = ActionWithPayload<typeof SHARE_DIALOG_COPY_LINK, {
    url: string;
}>;
export const shareDialogCopyLink = (url: string): ShareDialogCopyLinkAction => ({
    type: SHARE_DIALOG_COPY_LINK,
    payload: {url}
});

export const SHARE_PAGE_COPY_LINK = "SHARE_PAGE_COPY_LINK";
export type SharePageCopyLinkAction = ActionWithPayload<typeof SHARE_PAGE_COPY_LINK, {
    nodeName: string;
    href: string;
}>;
export const sharePageCopyLink = (nodeName: string, href: string): SharePageCopyLinkAction => ({
    type: SHARE_PAGE_COPY_LINK,
    payload: {nodeName, href}
});

export type ShareDialogAnyAction =
    ShareDialogPrepareAction
    | OpenShareDialogAction
    | CloseShareDialogAction
    | ShareDialogCopyLinkAction
    | SharePageCopyLinkAction;
