import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import { settingsGoToSheet } from "state/settings/actions";
import "./SettingsMenu.css";

const MENU_ITEMS = {
    "node": {
        "posting": "Post",
        "other": "Other"
    },
    "client": {
        "other": "Other"
    }
};

const SettingsMenu = ({tab, sheet, rootPage, settingsGoToSheet}) => {
    const items = MENU_ITEMS[tab] ? MENU_ITEMS[tab] : MENU_ITEMS["node"];
    sheet = items[sheet] ? sheet : Object.keys(items)[0];
    return (
        <ul className="nav nav-pills flex-column col-md-2 settings-menu">{
            Object.keys(items).map(s =>
                <li className="nav-item" key={s}>
                    <span className={cx("nav-link", {"active": s === sheet})} onClick={() => settingsGoToSheet(s)}>{
                        s === sheet ?
                            items[s]
                        :
                            <a href={`${rootPage}/settings/${tab}#${s}`}
                               onClick={e => {settingsGoToSheet(s); e.preventDefault()}}>{items[s]}</a>
                    }</span>
                </li>
            )
        }</ul>
    );
};

export default connect(
    state => ({
        tab: state.settings.tab,
        sheet: state.settings.sheet,
        rootPage: state.home.root.page
    }),
    { settingsGoToSheet }
)(SettingsMenu);