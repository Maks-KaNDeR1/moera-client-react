import React, { useCallback } from 'react';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';

import { PostingFeatures, SourceFormat } from "api/node/api-types";
import { FormGroup, RichTextEditor, RichTextValue } from "ui/control";
import { useUndoableField } from "ui/control/field/undoable-field";
import FieldError from "ui/control/field/FieldError";

interface Props {
    name: string;
    title?: string;
    rows?: number;
    maxHeight?: string | null;
    features?: PostingFeatures | null;
    noMedia?: boolean;
    nodeName?: string | null;
    forceImageCompress?: boolean;
    placeholder?: string | null;
    autoFocus?: boolean;
    anyValue?: boolean;
    className?: string;
    autoComplete?: string;
    noFeedback?: boolean;
    disabled?: boolean;
    initialValue?: RichTextValue;
    defaultValue?: RichTextValue;
    smileysEnabled?: boolean;
    hidingPanel?: boolean;
    format: SourceFormat;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    urlsField?: string;
}

export function RichTextField({
    name, title, rows = 3, maxHeight, features, noMedia, nodeName, forceImageCompress, placeholder, autoFocus, anyValue,
    className, autoComplete, noFeedback = false, disabled = false, initialValue, defaultValue, smileysEnabled,
    hidingPanel, format, onKeyDown, urlsField
}: Props) {
    const [{value, onBlur}, {touched, error}, , {undo, reset, onUndo, onReset}] =
        useUndoableField<RichTextValue>(name, initialValue, defaultValue);
    const {setFieldValue} = useFormikContext();
    const {t} = useTranslation();

    // useCallback() and setFieldValue() (not setValue()) is mandatory here
    const onChange = useCallback(v => setFieldValue(name, v), [name, setFieldValue]);
    const onUrls = useCallback(v => urlsField && setFieldValue(urlsField, v), [urlsField, setFieldValue]);

    return (
        <FormGroup
            title={title}
            name={name}
            undo={undo}
            reset={reset}
            onUndo={onUndo}
            onReset={onReset}
        >
            <>
                <RichTextEditor
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={cx(
                        "form-control", {
                            "is-valid": !anyValue && touched && !error,
                            "is-invalid": !anyValue && touched && error,
                            [className!]: !!className
                        })}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    maxHeight={maxHeight}
                    placeholder={placeholder ?? t("enter-text-here")}
                    rows={rows}
                    features={features ?? null}
                    disabled={disabled}
                    smileysEnabled={smileysEnabled}
                    hidingPanel={hidingPanel}
                    format={format}
                    onKeyDown={onKeyDown}
                    onUrls={urlsField != null ? onUrls : undefined}
                    noMedia={noMedia}
                    nodeName={nodeName}
                    forceImageCompress={forceImageCompress}
                />
                {!noFeedback && touched && <FieldError error={(error as any)?.text}/>}
            </>
        </FormGroup>
    );
}
