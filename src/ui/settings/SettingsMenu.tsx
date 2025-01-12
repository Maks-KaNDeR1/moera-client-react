import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';

import { ClientState } from "state/state";
import { settingsGoToSheet } from "state/settings/actions";
import { getActualSheetName, getActualTab, getSheets } from "ui/settings/settings-menu";
import Jump from "ui/navigation/Jump";
import "./SettingsMenu.css";

type Props = ConnectedProps<typeof connector>;

const SettingsMenu = ({tab, sheetName, settingsGoToSheet}: Props) => {
    const {t} = useTranslation();

    return (
        <ul className="nav nav-pills flex-md-column col-md-2 settings-menu">{
            getSheets(tab).map(sh =>
                <li className="nav-item" key={sh.name}>
                    <span className={cx("nav-link", {"active": sh.name === sheetName})}
                          onClick={() => settingsGoToSheet(sh.name)}>{
                        sh.name === sheetName ?
                            t(`setting.sheet.${sh.name}`)
                        :
                            <Jump href={`/settings/${tab}#${sh}`}>{t(`setting.sheet.${sh.name}`)}</Jump>
                    }</span>
                </li>
            )
        }</ul>
    );
}

const connector = connect(
    (state: ClientState) => ({
        tab: getActualTab(state.settings.tab),
        sheetName: getActualSheetName(state.settings.tab, state.settings.sheet)
    }),
    { settingsGoToSheet }
);

export default connector(SettingsMenu);
