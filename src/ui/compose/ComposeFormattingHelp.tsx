import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useField } from 'formik';
import { Trans, useTranslation } from 'react-i18next';

import { ClientSettings } from "api";
import { SourceFormat } from "api/node/api-types";
import { ClientState } from "state/state";
import { getSetting } from "state/settings/selectors";
import { settingsUpdate } from "state/settings/actions";
import { CloseButton } from "ui/control";
import "./ComposeFormattingHelp.css";

type Props = ConnectedProps<typeof connector>;

function ComposeFormattingHelp({show, settingsUpdate}: Props) {
    const [visible, setVisible] = useState<boolean>(show);

    const {t} = useTranslation();

    const toggleHelp = (show: boolean) => {
        setVisible(show);
        settingsUpdate([{
            name: ClientSettings.PREFIX + "posting.body-src-format.show-help",
            value: show.toString()
        }]);
    };

    const showHelp = () => toggleHelp(true);

    const hideHelp = () => toggleHelp(false);

    useEffect(
        () => setVisible(show),
        [show, setVisible]
    );

    const [, {value: bodyFormat}] = useField<SourceFormat>("bodyFormat");
    if (bodyFormat !== "markdown") {
        return null;
    }

    if (visible) {
        return (
            <div className="dialog-help">
                <Trans i18nKey="formatting-hint">
                    <b/>
                    {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                    <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"/>
                    {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                    <a href="https://www.markdowntutorial.com/"/>
                    {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                    <a href="https://www.webfx.com/tools/emoji-cheat-sheet/"/>
                </Trans>
                <CloseButton onClick={hideHelp}/>
            </div>
        );
    } else {
        return (
            <div className="formatting-help-show" onClick={showHelp}>{t("show-formatting-hint")}</div>
        );
    }
}

const connector = connect(
    (state: ClientState) => ({
        show: getSetting(state, "posting.body-src-format.show-help") as boolean
    }),
    { settingsUpdate }
);

export default connector(ComposeFormattingHelp);
