import { trigger } from "state/trigger";
import { SETTINGS_CLIENT_VALUES_LOADED } from "state/settings/actions";
import { isQuickTipsToBeShown } from "state/quicktips/selectors";
import { CLOSE_QUICK_TIPS, closeQuickTips, OPEN_QUICK_TIPS, openQuickTips } from "state/quicktips/actions";
import { MNEMONIC_CLOSE } from "state/nodename/actions";
import { dialogClosed, dialogOpened } from "state/navigation/actions";

export default [
    trigger([SETTINGS_CLIENT_VALUES_LOADED, MNEMONIC_CLOSE], isQuickTipsToBeShown, openQuickTips),
    trigger(OPEN_QUICK_TIPS, true, dialogOpened(closeQuickTips())),
    trigger(CLOSE_QUICK_TIPS, true, dialogClosed)
];
