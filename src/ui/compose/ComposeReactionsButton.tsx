import React from 'react';
import { useFormikContext } from 'formik';

import ComposeIconButton from "ui/compose/ComposeIconButton";
import { ComposePageValues } from "ui/compose/compose-page-logic";

export default function ComposeReactionsButton() {
    const {values} = useFormikContext<ComposePageValues>();

    const changed = values.reactionsEnabled !== values.reactionsEnabledDefault
        || values.reactionsNegativeEnabled !== values.reactionsNegativeEnabledDefault
        || values.reactionsPositive !== values.reactionsPositiveDefault
        || values.reactionsNegative !== values.reactionsNegativeDefault
        || values.reactionsVisible !== values.reactionsVisibleDefault
        || values.reactionTotalsVisible !== values.reactionTotalsVisibleDefault;
    return <ComposeIconButton icon="thumbs-up" name="reactions" tooltip="Reactions" changed={changed}/>;
};
