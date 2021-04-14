import React from 'react';
import { connect } from 'react-redux';
import ReactAvatarEditor from 'react-avatar-editor';

import { Button, ModalDialog } from "ui/control";
import avatarPlaceholder from "ui/control/avatar.png";
import { profileCloseAvatarEditDialog, profileImageUpload } from "state/profile/actions";
import { getNodeRootPage } from "state/node/selectors";
import "./AvatarEditDialog.css";

class AvatarEditDialog extends React.Component {

    #domFile;

    state = {
        scale: 1
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.show !== prevProps.show) {
            const editor = document.querySelector(".avatar-edit-dialog .editor");
            if (editor) {
                if (this.props.show) {
                    editor.addEventListener("wheel", this.onEditorWheel);
                } else {
                    editor.removeEventListener("wheel", this.onEditorWheel);
                }
            }
        }

        if (this.props.show && this.props.path !== prevProps.path) {
            this.setState({scale: 1});
        }
    }

    getScaleMax() {
        const {width, height} = this.props;

        return width != null && height != null ? Math.min(width, height) / 100 : 2;
    }

    onUploadClick = () => {
        this.#domFile.click();
    }

    onFileChange = () => {
        if (this.#domFile.files.length > 0) {
            this.props.profileImageUpload(this.#domFile.files[0]);
        }
    }

    onEditorWheel = event => {
        const scale = this.state.scale + event.deltaY * this.getScaleMax() / 400;
        this.setState({scale: Math.max(Math.min(scale, this.getScaleMax()), 1)})
        event.preventDefault();
    }

    onScaleChange = event => {
        this.setState({scale: Math.min(event.target.value, this.getScaleMax())});
    }

    render() {
        const {show, imageUploading, path, rootPage, profileCloseAvatarEditDialog} = this.props;
        const {scale} = this.state;

        if (!show) {
            return null;
        }

        return (
            <ModalDialog title="Create Avatar" className="avatar-edit-dialog" onClose={profileCloseAvatarEditDialog}>
                <div className="modal-body">
                    <ReactAvatarEditor className="editor" image={path ? `${rootPage}/media/${path}` : avatarPlaceholder}
                                       width={200} height={200} border={50} color={[255, 255, 224, 0.6]}
                                       borderRadius={100} scale={scale}/>
                    <Button variant="outline-secondary" size="sm" className="upload" loading={imageUploading}
                            onClick={this.onUploadClick}>Upload image</Button>
                    <input type="range" className="custom-range" min={1} max={this.getScaleMax()} step="any"
                           value={scale} onChange={this.onScaleChange}/>
                    <input type="file" ref={dom => this.#domFile = dom} onChange={this.onFileChange}/>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={profileCloseAvatarEditDialog}>Cancel</Button>
                    <Button variant="primary" type="submit" loading={false}>Create</Button>
                </div>
            </ModalDialog>
        );
    }

}

export default connect(
    state => ({
        show: state.profile.avatarEditDialog.show,
        imageUploading: state.profile.avatarEditDialog.imageUploading,
        path: state.profile.avatarEditDialog.path,
        width: state.profile.avatarEditDialog.width,
        height: state.profile.avatarEditDialog.height,
        rootPage: getNodeRootPage(state)
    }),
    { profileCloseAvatarEditDialog, profileImageUpload }
)(AvatarEditDialog);
