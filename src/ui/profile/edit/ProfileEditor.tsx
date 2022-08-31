import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Form, FormikBag, FormikProps, withFormik } from 'formik';
import * as yup from 'yup';

import { AvatarInfo, FundraiserInfo, PrincipalValue } from "api/node/api-types";
import { ClientState } from "state/state";
import { Button, ConflictWarning, Loading, RichTextValue } from "ui/control";
import { ComboboxField, InputField, PrincipalField, RichTextField } from "ui/control/field";
import { profileEditCancel, profileEditConflictClose, profileUpdate } from "state/profile/actions";
import PageHeader from "ui/page/PageHeader";
import { Page } from "ui/page/Page";
import AvatarEditor from "ui/profile/edit/avatar/AvatarEditor";
import DonateField from "ui/profile/edit/donate/DonateField";
import "./ProfileEditor.css";
import { Browser } from "ui/browser";

type OuterProps = ConnectedProps<typeof connector>;

interface Values {
    fullName: string;
    title: string;
    gender: string;
    email: string;
    bioSrc: RichTextValue;
    avatar: AvatarInfo | null;
    fundraisers: FundraiserInfo[];
    viewEmail: PrincipalValue;
}

type Props = OuterProps & FormikProps<Values>;

function ProfileEditor(props: Props) {
    const {loading, loaded, updating, conflict, profile, profileEditCancel, profileEditConflictClose, resetForm} = props;

    useEffect(() => {
        const values = profileEditorLogic.mapPropsToValues(props);
        resetForm({values});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, profile.bioSrc, resetForm]); // 'props' are missing on purpose

    return (
        <>
            <PageHeader>
                <h2>Edit Profile <Loading active={loading}/></h2>
            </PageHeader>
            <Page>
                <div className="profile-editor">
                    <Form>
                        <ConflictWarning text="Profile was edited by somebody." show={conflict}
                                         onClose={profileEditConflictClose}/>
                        <AvatarEditor name="avatar"/>
                        <InputField title="Full name" name="fullName" maxLength={96} anyValue autoFocus/>
                        <InputField title="Title" name="title" maxLength={120}/>
                        <ComboboxField title="Gender (choose or type anything)" name="gender" data={["Male", "Female"]}
                                       col="col-sm-6"/>
                        <div className="row">
                            <InputField title="E-Mail" name="email" maxLength={63}
                                        groupClassName="col-sm-6 col-10 pe-0"/>
                            <PrincipalField name="viewEmail" values={["public", "signed", "admin"]}
                                            long={!Browser.isTinyScreen()}
                                            groupClassName="col-2 align-self-end pb-1"/>
                        </div>
                        <RichTextField title="Bio" name="bioSrc" placeholder="Write anything..." format="markdown"
                                       smileysEnabled anyValue noMedia/>
                        <DonateField title="Donate" name="fundraisers"/>
                        <div className="profile-editor-footer">
                            <Button variant="secondary" onClick={profileEditCancel}
                                    disabled={updating}>Cancel</Button>
                            <Button variant="primary" type="submit" loading={updating}>Update</Button>
                        </div>
                    </Form>
                </div>
            </Page>
        </>
    );
}

const profileEditorLogic = {

    mapPropsToValues: (props: OuterProps): Values => ({
        fullName: props.profile.fullName || "",
        title: props.profile.title || "",
        gender: props.profile.gender || "",
        email: props.profile.email || "",
        bioSrc: new RichTextValue(props.profile.bioSrc || ""),
        avatar: props.profile.avatar ?? null,
        fundraisers: props.profile.fundraisers ?? [],
        viewEmail: props.profile.operations?.viewEmail ?? "admin"
    }),

    validationSchema: yup.object().shape({
        fullName: yup.string().trim().max(96, "Too long"),
        title: yup.string().trim().max(120, "Too long"),
        gender: yup.string().trim().max(31, "Too long"),
        email: yup.string().trim().max(63, "Too long").email("Must be a valid e-mail"),
        bioSrc: yup.object().shape({
            text: yup.string().trim().max(4096, "Too long")
        })
    }),

    handleSubmit(values: Values, formik: FormikBag<OuterProps, Values>): void {
        formik.props.profileUpdate({
            fullName: values.fullName.trim(),
            title: values.title.trim(),
            gender: values.gender.trim(),
            email: values.email.trim(),
            bioSrc: values.bioSrc.text.trim(),
            bioSrcFormat: "markdown",
            avatarId: values.avatar ? values.avatar.id : null,
            fundraisers: values.fundraisers,
            operations: {
                viewEmail: values.viewEmail
            }
        });
        formik.setSubmitting(false);
    }

};

const connector = connect(
    (state: ClientState) => ({
        loading: state.profile.loading,
        loaded: state.profile.loaded,
        conflict: state.profile.conflict,
        updating: state.profile.updating,
        profile: state.profile.profile
    }),
    { profileEditCancel, profileEditConflictClose, profileUpdate }
);

export default connector(withFormik(profileEditorLogic)(ProfileEditor));
