import React from 'react';
import { connect } from 'react-redux';
import { Form, withFormik } from 'formik';
import * as yup from 'yup';

import { Button, ModalDialog } from "ui/control";
import { CheckboxField, InputField } from "ui/control/field";
import { cancelConnectDialog } from "state/connectdialog/actions";
import { connectToHome } from "state/home/actions";

class ConnectDialog extends React.Component {

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.show !== prevProps.show && this.props.show) {
            this.props.resetForm();
        }
    }

    render() {
        const {show, cancelConnectDialog} = this.props;
        const {assign} = this.props.values;

        if (!show) {
            return null;
        }

        return (
            <ModalDialog title="Connect to Home" onClose={cancelConnectDialog}>
                <Form>
                    <div className="modal-body">
                        <InputField name="location" title="Node URL" autoFocus />
                        <CheckboxField name="assign" title="Login and password haven't been set yet" />
                        <InputField name="login" title={assign ? "New login" : "Login"} />
                        <InputField name="password" title={assign ? "New password" : "Password"} />
                        {assign && <InputField name="confirmPassword" title="Confirm password" />}
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" onClick={cancelConnectDialog}>Cancel</Button>
                        <Button variant="primary" type="submit">Connect</Button>
                    </div>
                </Form>
            </ModalDialog>
        );
    }

}

const connectDialogLogic = {

    mapPropsToValues(props) {
        return {
            location: props.location || props.nodeRoot || "",
            assign: props.assign || false,
            login: props.login || "",
            password: "",
            confirmPassword: ""
        }
    },

    validationSchema: yup.object().shape({
        location: yup.string().trim().url("Must be a valid URL").required("Must not be empty"),
        assign: yup.boolean(),
        login: yup.string().trim().required("Must not be empty"),
        password: yup.string().required("Must not be empty"),
        confirmPassword: yup.string().when(["assign", "password"], (assign, password, schema) =>
            assign
                ? schema.required("Please type the password again").oneOf([password], "Passwords are different")
                : schema
        )
    }),

    handleSubmit(values, formik) {
        formik.props.connectToHome(values.location.trim(), values.assign, values.login.trim(), values.password);
        formik.setSubmitting(false);
    }

};

export default connect(
    state => ({
        ...state.connectDialog,
        nodeRoot: state.node.root.location
    }),
    { cancelConnectDialog, connectToHome }
)(withFormik(connectDialogLogic)(ConnectDialog));
