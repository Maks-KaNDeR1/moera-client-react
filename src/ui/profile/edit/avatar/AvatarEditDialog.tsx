import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactAvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';

import { ACCEPTED_IMAGE_TYPES } from "ui/image-types";
import { Button, ModalDialog } from "ui/control";
import avatarPlaceholder from "ui/control/avatar.png";
import { profileAvatarCreate, profileCloseAvatarEditDialog, profileImageUpload } from "state/profile/actions";
import { getNodeRootPage } from "state/node/selectors";
import { getSetting } from "state/settings/selectors";
import { ClientState } from "state/state";
import Rotate from "ui/profile/edit/avatar/Rotate";
import AvatarShape from "ui/profile/edit/avatar/AvatarShape";
import Scale from "ui/profile/edit/avatar/Scale";
import "./AvatarEditDialog.css";

type Props = ConnectedProps<typeof connector>;

function AvatarEditDialog({show, imageUploading, imageUploadProgress, imageId, path, width, height, orientation,
                           creating, rootPage, shapeDefault, profileCloseAvatarEditDialog, profileImageUpload,
                           profileAvatarCreate}: Props) {

    const {t} = useTranslation();

    const domFile = useRef<HTMLInputElement>(null);
    const refEditor = useRef<ReactAvatarEditor>(null);
    const [scale, setScale] = useState<number>(1);
    const [rotate, setRotate] = useState<number>(0);
    const [shape, setShape] = useState<string>("circle");

    const getScaleMax = useCallback(() =>
        width != null && height != null ? Math.min(width, height) / 100 : 2,
        [width, height]);

    const updateScale = useCallback((value: number) =>
        setScale(Math.max(Math.min(value, getScaleMax()), 1)),
        [getScaleMax]);

    const onEditorWheel = useCallback((event: WheelEvent) => {
        updateScale(scale - event.deltaY * getScaleMax() / 400);
        event.preventDefault();
    }, [updateScale, getScaleMax, scale]);

    useEffect(() => {
        const editor = document.querySelector(".avatar-edit-dialog .editor") as HTMLElement;
        if (!editor) {
            return;
        }

        if (show) {
            editor.addEventListener("wheel", onEditorWheel);
            return () => editor.removeEventListener("wheel", onEditorWheel);
        } else {
            editor.removeEventListener("wheel", onEditorWheel);
        }
    }, [show, onEditorWheel]);

    useEffect(() => {
        if (show) {
            setShape(shapeDefault);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]); // 'shapeDefault' is missing on purpose

    useEffect(() => {
        if (show) {
            setScale(1);
            setRotate(0);
        }
    }, [imageId, show]);

    if (!show) {
        return null;
    }

    const onUploadClick = () => {
        if (domFile.current != null) {
            domFile.current.click();
        }
    }

    const imageUpload = (files: {[index: number]: File, length: number}) => {
        if (files.length > 0) {
            profileImageUpload(files[0]);
        }
    }

    const onFileChange = () => {
        if (domFile.current?.files != null) {
            imageUpload(domFile.current?.files);
        }
    }

    const onDrop = (files: File[]) =>
        imageUpload(files);

    const onRotateChange = (value: number) =>
        setRotate(value);

    const onShapeChange = (value: string) =>
        setShape(value);

    const onScaleChange = (value: number) =>
        updateScale(value);

    const onCreateClick = () => {
        if (refEditor.current == null || imageId == null || width == null || height == null) {
            return;
        }

        const imageWidth = isSwapAxes(orientation) ? height : width;
        const imageHeight = isSwapAxes(orientation) ? width : height;
        const clip = refEditor.current.getCroppingRect();
        profileAvatarCreate({
            mediaId: imageId,
            clipX: Math.round(clip.x * imageWidth),
            clipY: Math.round(clip.y * imageHeight),
            clipSize: Math.round(clip.width * imageWidth),
            avatarSize: 200,
            rotate,
            shape
        });
    }

    return (
        <ModalDialog title={t("create-avatar")} className="avatar-edit-dialog" onClose={profileCloseAvatarEditDialog}>
            <div className="modal-body">
                <div className="tools">
                    <Rotate value={rotate} onChange={onRotateChange}/>
                    <AvatarShape value={shape} onChange={onShapeChange}/>
                </div>
                <Dropzone onDrop={onDrop} noClick noKeyboard accept={ACCEPTED_IMAGE_TYPES} maxFiles={1}>
                    {({getRootProps, getInputProps, isDragAccept, isDragReject}) => (
                        <div {...getRootProps()}>
                            <ReactAvatarEditor
                                className={cx("editor", {"drag-accept": isDragAccept, "drag-reject": isDragReject})}
                                image={path ? `${rootPage}/media/${path}` : avatarPlaceholder}
                                width={200} height={200} border={50} color={[255, 255, 224, 0.6]}
                                borderRadius={shape === "circle" ? 100 : 10} scale={scale} rotate={rotate}
                                ref={refEditor}/>
                            <input {...getInputProps()}/>
                        </div>
                    )}
                </Dropzone>
                <Button variant={imageId ? "outline-secondary" : "primary"} size="sm" className="upload"
                        loading={imageUploading} onClick={onUploadClick}>
                    {imageUploadProgress == null
                        ? t("upload-image")
                        : t("uploading-file", {progress: imageUploadProgress})
                    }
                </Button>
                <Scale max={getScaleMax()} value={scale} onChange={onScaleChange}/>
                <input type="file" accept="image/*" ref={domFile} onChange={onFileChange}/>
            </div>
            <div className="modal-footer">
                <Button variant="secondary" onClick={profileCloseAvatarEditDialog}>{t("cancel")}</Button>
                <Button variant="primary" type="submit" loading={creating} disabled={!imageId} onClick={onCreateClick}>
                    {t("create")}
                </Button>
            </div>
        </ModalDialog>
    );
}

function isSwapAxes(orientation: number | null): boolean {
    return orientation != null && orientation >= 5 && orientation <= 8;
}

const connector = connect(
    (state: ClientState) => ({
        show: state.profile.avatarEditDialog.show,
        imageUploading: state.profile.avatarEditDialog.imageUploading,
        imageUploadProgress: state.profile.avatarEditDialog.imageUploadProgress,
        imageId: state.profile.avatarEditDialog.imageId,
        path: state.profile.avatarEditDialog.path,
        width: state.profile.avatarEditDialog.width,
        height: state.profile.avatarEditDialog.height,
        orientation: state.profile.avatarEditDialog.orientation,
        creating: state.profile.avatarEditDialog.avatarCreating,
        rootPage: getNodeRootPage(state),
        shapeDefault: getSetting(state, "avatar.shape.default") as string
    }),
    { profileCloseAvatarEditDialog, profileImageUpload, profileAvatarCreate }
);

export default connector(AvatarEditDialog);
