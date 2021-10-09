import React from 'react';
import { Row, Col, Form as BForm, Input, Label, FormGroup, Button } from 'reactstrap';

import { Layout, UseForm, Schema, LayoutElement, ProcessedLayoutRow, Action, WrappedInputProps } from './types';
import { nestifyValues } from './useForm';
import { parseFileName } from './utils';

type FormProps<T> = {
    form: UseForm<T>;
    schema: Schema<T>;
    layout: Layout<T>;
    submitCallback?: (elem: T) => void;
    actionName?: string;
    actions?: Action<T>[];
    disabled?: boolean;
    actionsTop?: boolean; 
    alertType?: 'circular' | 'linear';
    showWaitAlert?: boolean;
    setShowWaitAlert?: (x: boolean) => any;
    waitAlertMessage?: string;
};

function WrappedInput<T> (props: WrappedInputProps<T>) {
    const { 
        name, 
        field, 
        value, 
        formValues, 
        formErrors, 
        onChange, 
        setFormValues, 
        setFormErrors, 
        ...other } = props;

    const renderer = field.valueRenderer || (x => x);
    let renderValue = renderer(value);

    const removeFileSelection = (index: number, selectionType: "currSelections"|"prevSelections") => {
        const updatedFileValues = formValues[name + "." + selectionType].filter((_: any, i:number) => i!=index);
        const updatedFormValues = { ...formValues, [name + "." + selectionType]: updatedFileValues };
        setFormValues(updatedFormValues);

        const err = field.validation ? field.validation(nestifyValues(updatedFormValues)[name], updatedFormValues): undefined;

        if (typeof err === 'string') {
            setFormErrors({ ...formErrors, [name]: err });
        } else {
            if (formErrors && formErrors[name]) {
                const { [name]: _, ...updatedFormErrors } = formErrors;
                setFormErrors(updatedFormErrors);
            }
        }
    }
    if ((field.displayCondition && !field.displayCondition(formValues)) ||
        (field.hideCondition && field.hideCondition(formValues))) {
        return null;
    }
    if (field.type === 'select') {
        return (
            <React.Fragment>
                <Label>
                    {field.label}
                    {field.required && <span className="input-error">*</span>}
                    <small className="input-error">
                        {formErrors && formErrors[name]}
                    </small>
                </Label>
                <Input
                    name={name as string}
                    value={renderValue}
                    type="select"
                    invalid={!!(formErrors && formErrors[name])}
                    onChange={onChange}
                    {...other}
                >
                    {(field.options || []).map((x) => (
                        <option key={x.value} value={x.value}>
                            {x.label}
                        </option>
                    ))}
                </Input>
            </React.Fragment>
        );
    }
    if (field.type === 'checkbox') {
        return (
            <FormGroup check>
                <Label check>
                    <Input
                        type="checkbox"
                        invalid={!!(formErrors && formErrors[name])}
                        checked={renderValue}
                        onChange={onChange}
                        {...other}
                    />{' '}
                    {field.label}
                    {field.required && <span className="input-error">*</span>}
                </Label>
            </FormGroup>
        );
    }
    if (field.type === 'label') {
        return (
            <h5 style={{ marginBottom: '-8px', marginTop: '8px' }}>
                {field.label}
            </h5>
        );
    }
    if (field.type === 'custom') {
        const {CustomComponent} = field;
        return (
            <FormGroup>
                 <Label>
                    {field.label}
                    {field.required && <span className="input-error">*</span>}
                    <small className="input-error">
                        {formErrors && formErrors[name]}
                    </small>
                </Label>
                <CustomComponent 
                    field={field} 
                    name={name} 
                    value={renderValue}
                    bsFormOnChange={onChange} 
                />
            </FormGroup>
        );
    }
    if (field.type === 'file') {
        const mParseFileName = field.parseFileName
            ? field.parseFileName
            : parseFileName;
        return (
            <FormGroup>
                <Label style={{ display: 'block' }}>
                    {field.label}
                    <small className="input-error">
                        {formErrors && formErrors[name]}
                    </small>
                </Label>
                <Input 
                    type="file"
                    name={name as string}
                    multiple
                    accept={field.allowedFileExtensions || '*'}
                    onChange={onChange}
                    {...other}
                    style={{ display: 'none' }}
                    id="uploadFile"
                />
                <button
                    type="button"
                    className="browse-btn"
                    onClick={() =>
                        document.getElementById('uploadFile')?.click()
                    }
                >
                    Browse...
                </button>
                {formValues[name + '.currSelections'] &&
                    Object.entries(formValues[name + '.currSelections']).map(
                        ([key, file]) => (
                            <div key={key}>
                                <span>{(file as File).name}</span>
                                <span
                                    className="remove-file"
                                    onClick={() => removeFileSelection(+key, 'currSelections')}
                                >
                                    X
                                </span>
                            </div>
                        )
                )}
                {formValues[name + '.prevSelections'] &&
                    formValues[name + '.prevSelections'].length !== 0 && (
                        <div>
                            <hr/>
                            <b>Previous selected files:</b>
                            {formValues[name + '.prevSelections']
                                .map(mParseFileName)
                                .map((filename: string, index: number) => ( 
                                    <div key={index}>
                                        <span>{filename}</span>
                                        <span
                                            className="remove-file"
                                            onClick={() => removeFileSelection(+index, "prevSelections")}
                                        >
                                            X
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
            </FormGroup>
        );
    }
    if (field.type === 'date' && renderValue && renderValue.length > 10) {
        renderValue = renderValue.substring(0, 10);
    }
    return (
        <React.Fragment>
            <Label>
                {field.label}
                {field.required && <span className="input-error">*</span>}
                <small className="input-error">
                    {formErrors && formErrors[name]}
                </small>
            </Label>
            <Input
                name={name as string}
                value={renderValue}
                type={field.type}
                placeholder={field.placeholder}
                invalid={!!(formErrors && formErrors[name])}
                onChange={onChange}
                {...other}
            />
        </React.Fragment>
    );
};

const Form: <T>(_: FormProps<T>) => React.ReactElement<FormProps<T>> = (props) => {
    const {
        submitCallback,
        layout,
        schema,
        form,
        disabled,
        actions,
        actionName,
        actionsTop,
    } = props;

    const {
        formValues,
        formErrors,
        onChange,
        onSubmit,
        setFormValues,
        setFormErrors,
        validateAndSetErrors
    } = form;
    // TODO: use formErrors
    type FormType = typeof formValues;

    const processRow = <T extends unknown>(
        row: LayoutElement<T>[], fullWidth: number
    ): ProcessedLayoutRow<T> => {
        if (typeof row === 'string') return [[row, fullWidth]];
        const width = fullWidth/row.length;
        return row
            .map((item) => processRow(item as Array<keyof T>, width))
            .flat();
    };
    React.useEffect(() => {
        form.setSchema(schema);
    }, []);

    const processedLayout = layout.map(row => processRow<FormType>(row, 12));
    const buttons = (
        <React.Fragment>
            {actionName &&
                <Button color="success" style={{ marginRight: '3px' }}>
                    {actionName}
                </Button>
            }
            {(actions || []).map((action) => (
                <Button
                    key={action.name}
                    type="button"
                    color={action.color || 'primary'}
                    onClick={() => {
                        if (action && action.custom && action.custom.method && (action.custom.method === "put" || action.custom.method === "post")) {
                            const valid = validateAndSetErrors();
                            if (!valid) return;
                            action.callback(form.getFilteredValues(), action);
                        } else {
                            action.callback(formValues, action)
                        }
                    }}
                    style={{ marginRight:'3px' }}
                >
                    {action.name}
                </Button>
            ))}
        </React.Fragment>
    );
    return (
        <BForm
            className="tf-form"
            onSubmit={onSubmit(submitCallback || (() => {}))}
        >
            <fieldset disabled={!!disabled}>
            {actionsTop && <React.Fragment>{buttons}<hr/></React.Fragment>} 
            {processedLayout.map((rows, i: number) => (
                <Row key={i}>
                {rows.map(([fieldName, width]: [any, number]) => (
                        <Col md={width} key={fieldName as string}>
                            <FormGroup>
                                <WrappedInput<FormType>
                                    field={schema[fieldName as (keyof FormType)]}
                                    name={fieldName}
                                    value={formValues[fieldName as (keyof FormType)]}
                                    onChange={onChange(fieldName, schema[fieldName as (keyof FormType)].valueProcessor, schema[fieldName as (keyof FormType)].type === 'custom')}
                                    formValues={formValues}
                                    setFormValues={setFormValues}
                                    setFormErrors={setFormErrors}
                                    formErrors={formErrors}
                                />
                            </FormGroup>
                        </Col>
                    ))}
                </Row>
            ))}
            {!actionsTop && <React.Fragment><hr />{buttons}</React.Fragment>}
            </fieldset>
        </BForm>
    );
}

export default Form;
