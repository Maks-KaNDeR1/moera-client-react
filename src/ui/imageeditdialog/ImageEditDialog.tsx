import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Form, FormikBag, FormikProps, withFormik } from 'formik';

import { closeImageEditDialog, imageEditDialogPost } from "state/imageeditdialog/actions";
import { ClientState } from "state/state";
import { getPosting } from "state/postings/selectors";
import { getNamingNameNodeUri } from "state/naming/selectors";
import { getNodeRootPage } from "state/node/selectors";
import { getHomeOwnerFullName, getHomeOwnerName } from "state/home/selectors";
import { getSetting } from "state/settings/selectors";
import { Button, Loading, ModalDialog, RichTextValue } from "ui/control";
import { RichTextField } from "ui/control/field";
import { mediaImagePreview, mediaImageSize } from "util/media-images";
import { replaceSmileys } from "util/text";
import "./ImageEditDialog.css";

type OuterProps = ConnectedProps<typeof connector>;

interface Values {
    caption: RichTextValue;
}

type Props = OuterProps & FormikProps<Values>;

function ImageEditDialog(props: Props) {
    const {show, media, rootPage, loading, posting, saving, smileysEnabled, closeImageEditDialog, resetForm} = props;

    useEffect(() => {
        if (show) {
            resetForm({values: logic.mapPropsToValues(props)});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, posting, resetForm]); // 'props' are missing on purpose

    if (!show || media == null) {
        return null;
    }

    const onClose = () => closeImageEditDialog();

    const src = mediaImagePreview(rootPage + "/media/" + media.path, 800);
    const [imageWidth, imageHeight] = mediaImageSize(800, null, null, media);

    return (
        <ModalDialog title="Edit Image" onClose={onClose}>
            <Form>
                <div className="modal-body image-edit-dialog">
                    <img className="preview" alt="" src={src} width={imageWidth} height={imageHeight}/>
                    <Loading active={loading}/>
                    <RichTextField name="caption" format={posting?.bodySrcFormat || "markdown"} maxRows={9}
                                   smileysEnabled={smileysEnabled} anyValue noMedia autoFocus/>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit" loading={saving}>OK</Button>
                </div>
            </Form>
        </ModalDialog>
    );
}

const logic = {

    mapPropsToValues(props: OuterProps): Values {
        return {
            caption: new RichTextValue(props.posting?.bodySrc?.text ?? "")
        }
    },

    _replaceSmileys(enabled: boolean, text: string): string {
        return enabled ? replaceSmileys(text) : text;
    },

    handleSubmit(values: Values, formik: FormikBag<OuterProps, Values>): void {
        formik.setStatus("submitted");
        formik.props.imageEditDialogPost({
            ownerName: formik.props.homeOwnerName,
            ownerFullName: formik.props.homeOwnerFullName,
            bodySrc: JSON.stringify({
                text: this._replaceSmileys(formik.props.smileysEnabled, values.caption.text.trim())
            }),
            bodySrcFormat: formik.props.posting?.bodySrcFormat || "markdown"
        });
        formik.setSubmitting(false);
    }

};

const connector = connect(
    (state: ClientState) => ({
        homeOwnerName: getHomeOwnerName(state),
        homeOwnerFullName: getHomeOwnerFullName(state),
        show: state.imageEditDialog.show,
        media: state.imageEditDialog.media,
        rootPage: state.imageEditDialog.nodeName
            ? getNamingNameNodeUri(state, state.imageEditDialog.nodeName)
            : getNodeRootPage(state),
        loading: state.imageEditDialog.loading,
        posting: getPosting(state, state.imageEditDialog.media?.postingId ?? null),
        saving: state.imageEditDialog.saving,
        smileysEnabled: getSetting(state, "posting.smileys.enabled") as boolean
    }),
    { closeImageEditDialog, imageEditDialogPost }
);

export default connector(withFormik(logic)(ImageEditDialog));
