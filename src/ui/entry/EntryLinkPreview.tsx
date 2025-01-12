import React, { MouseEventHandler, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import * as URI from 'uri-js';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { MediaAttachment, PrivateMediaFileInfo } from "api/node/api-types";
import { goToLocation, initFromLocation, newLocation } from "state/navigation/actions";
import { DeleteButton } from "ui/control";
import EntryLinkPreviewImage from "ui/entry/EntryLinkPreviewImage";
import EntryLinkPreviewEditDialog, { EntryLinkPreviewEditValues } from "ui/entry/EntryLinkPreviewEditDialog";
import { interceptLinkClick } from "ui/entry/link-click-intercept";
import { ellipsize } from "util/text";
import "./EntryLinkPreview.css";

interface Props {
    nodeName: string | null;
    siteName?: string | null;
    url?: string | null;
    title?: string | null;
    description?: string | null;
    imageUploading?: boolean;
    imageHash?: string | null;
    media: MediaAttachment[] | null;
    small?: boolean | null;
    editing?: boolean;
    onUpdate?: (title: string, description: string) => void;
    onDelete?: MouseEventHandler;
}

export function EntryLinkPreview({nodeName, siteName, url, title, description, imageUploading, imageHash, media,
                                  small = false, editing, onUpdate, onDelete}: Props) {
    const [edit, setEdit] = useState<boolean>(false);

    if (url == null) {
        return null;
    }

    const {host} = URI.parse(url);
    if (host == null) {
        return null;
    }

    let large;
    let mediaFile: PrivateMediaFileInfo | null = null;
    if (imageHash != null && media != null) {
        mediaFile = media.find(ma => ma.media?.hash === imageHash)?.media ?? null;
        large = !small && mediaFile != null && mediaFile.width > 450;
    } else {
        large = imageUploading;
    }

    const onEdit = (e: React.MouseEvent) => {
        setEdit(true);
        e.preventDefault();
    }

    const onEditSubmit = (ok: boolean, values: Partial<EntryLinkPreviewEditValues>) => {
        setEdit(false);
        if (ok && onUpdate != null) {
            onUpdate(values.title ?? "", values.description ?? "");
        }
    }

    return (
        <Frame className={cx("link-preview", {"large": large}, {"small": small})} url={url} editing={editing}
               onEdit={onEdit} onDelete={onDelete}>
            <EntryLinkPreviewImage nodeName={nodeName} mediaFile={mediaFile} loading={imageUploading ?? false}/>
            <div className="details">
                {title &&
                    <div className="title">{ellipsize(title, small ? 35 : 81)}</div>
                }
                {description &&
                    <div className="description">{ellipsize(description, small ? 70 : 120)}</div>
                }
                <div className="site">
                    {siteName &&
                        <>{ellipsize(siteName, 40)}{" "}<span className="bullet">&bull;</span>{" "}</>
                    }
                    {host.toUpperCase()}
                </div>
            </div>
            <EntryLinkPreviewEditDialog show={edit} title={title ?? ""} description={description ?? ""}
                                        onSubmit={onEditSubmit}/>
        </Frame>
    );
}

type FrameProps = {
    editing?: boolean;
    className: string;
    url: string;
    onEdit?: MouseEventHandler;
    onDelete?: MouseEventHandler;
    children: React.ReactNode;
} & ConnectedProps<typeof frameConnector>;

function FrameImpl({
    editing, className, url, children, onEdit, onDelete, initFromLocation, newLocation, goToLocation
}: FrameProps) {
    if (editing) {
        return (
            <div className={className} title="Edit">
                <EditButton onClick={onEdit}/>
                <DeleteButton onClick={onDelete}/>
                {children}
            </div>
        );
    } else {
        const onClick = (event: React.MouseEvent) =>
            interceptLinkClick(event, initFromLocation, newLocation, goToLocation);

        return (
            <a className={className} href={url} onClick={onClick}>{children}</a>
        );
    }
}

const frameConnector = connect(
    null,
    { initFromLocation, newLocation, goToLocation }
);

const Frame = frameConnector(FrameImpl);

interface EditButtonProps {
    onClick?: MouseEventHandler;
}

export const EditButton = ({onClick}: EditButtonProps) => {
    const {t} = useTranslation();

    return (
        <div className="edit-button" title={t("edit")} onClick={onClick}>
        <span className="fa-layers fa-fw">
            <FontAwesomeIcon icon="circle"/>
            <span className="pen"><FontAwesomeIcon icon="pen" color="white"/></span>
        </span>
        </div>
    );
}
