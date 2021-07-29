import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FormikBag, FormikProps, withFormik } from 'formik';
import * as yup from 'yup';

import { InputField } from "ui/control/field";
import ConnectDialogModal from "ui/connectdialog/ConnectDialogModal";
import { connectToHome } from "state/home/actions";
import { getNodeRootLocation } from "state/node/selectors";
import { connectDialogSetForm } from "state/connectdialog/actions";
import { ClientState } from "state/state";

type OuterProps = ConnectedProps<typeof connector>;

interface Values {
    resetToken: string;
    location: string;
    password: string;
    confirmPassword: string;
}

type Props = OuterProps & FormikProps<Values>;

class ResetForm extends React.PureComponent<Props> {

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (this.props.show !== prevProps.show && this.props.show) {
            this.props.resetForm({
                values: resetFormLogic.mapPropsToValues(this.props),
            });
        }
    }

    onResend = (event: React.MouseEvent) => {
        const {location} = this.props.values;
        const {connectDialogSetForm} = this.props;

        connectDialogSetForm(location, "admin", "forgot");

        event.preventDefault();
    }

    render() {
        const {emailHint} = this.props;

        return (
            <ConnectDialogModal title="Set Home Password" buttonCaption="Set Password & Connect">
                {emailHint &&
                    <div className="instructions">
                        A message was sent to your E-mail address <b>{emailHint}</b> with a secret code needed to reset
                        the password. Please enter it in the field below.
                    </div>
                }
                <InputField name="resetToken" title="Secret code" autoFocus/>
                <InputField name="location" title="Name or node URL"/>
                <InputField name="password" title="New password"/>
                <InputField name="confirmPassword" title="Confirm password"/>
                <div className="links">
                    <button className="btn btn-link" onClick={this.onResend}>Send mail again</button>
                </div>
            </ConnectDialogModal>
        );
    }

}

const resetFormLogic = {

    mapPropsToValues(props: OuterProps): Values {
        return {
            resetToken: "",
            location: props.location || props.nodeRoot || "",
            password: "",
            confirmPassword: ""
        }
    },

    validationSchema: yup.object().shape({
        resetToken: yup.string().trim().required("Must not be empty"),
        location: yup.string().trim().required("Must not be empty"),
        password: yup.string().required("Must not be empty"),
        confirmPassword: yup.string().when(["password"], (password, schema) =>
                schema.required("Please type the password again").oneOf([password], "Passwords are different")
        )
    }),

    handleSubmit(values: Values, formik: FormikBag<OuterProps, Values>): void {
        formik.props.connectToHome(values.location.trim(), false, "admin", values.password, null,
            values.resetToken.trim());
        formik.setSubmitting(false);
    }

};

const connector = connect(
    (state: ClientState) => ({
        show: state.connectDialog.show,
        emailHint: state.connectDialog.emailHint,
        location: state.connectDialog.location,
        nodeRoot: getNodeRootLocation(state)
    }),
    { connectToHome, connectDialogSetForm }
);

export default connector(withFormik(resetFormLogic)(ResetForm));