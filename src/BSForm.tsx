import React from 'react';
import { Row, Col, Form as BForm, Input, Label, FormGroup, Button, FormText } from 'reactstrap';

import { Layout, UseForm, Schema, SchemaSpec, LayoutElement, ProcessedLayoutRow } from './types';

import './style.css';

type FormProps<T> = {
    form: UseForm<T>;
    schema: Schema<T>;
    layout: Layout<T>;
    submitCallback: (elem: T) => void;
    actionName: string;
    actions?: {
        name: string;
        callback: (elem: T) => void;
        color?: "primary" | "success" | "danger" | "warning";
    }[];
    disabled?: boolean;
    actionsTop?: boolean;
};

interface WrappedInputProps<T> {
    name: keyof T; // TODO: make this generic
    onChange: (ev: React.FormEvent<HTMLInputElement>) => void;
    schema: SchemaSpec<T>;
    value: any;
    formValues: T;
    error?: string;
}

function WrappedInput<T> (props: WrappedInputProps<T>) {
    const { name, schema, value, formValues, error, onChange, ...other } = props;
    const renderer = schema.valueRenderer || (x => x);
    const renderValue = renderer(value);

    if(schema.displayCondition && !schema.displayCondition(formValues)) {
        return null;
    }
    if (schema.type === "select") {
        return (
            <React.Fragment>
                <Label>
                    {schema.label}{ schema.required && <span className="input-error">*</span> }
                    <small className="input-error">{error}</small>
                </Label>
                <Input
                    name={name as string}
                    value={renderValue}
                    type="select"
                    invalid={!!error}
                    onChange={ onChange }
                    {...other}
                >
                {
                    (schema.options || []).map(x => (
                        <option key={x.value} value={x.value}>
                            {x.label}
                        </option>
                    ))
                }
                </Input>
            </React.Fragment>
        );
    }
    if (schema.type === 'checkbox') {
        return (
            <FormGroup check>
                <Label check>
                    <Input
                        type="checkbox"
                        invalid={!!error}
                        checked={renderValue}
                        onChange={ onChange }
                        {...other}
                    />{' '}
                    {schema.label}{ schema.required && <span className="input-error">*</span> }
                </Label>
            </FormGroup>
        );
    }
    if (schema.type === 'label') {
        return <h5 style={{marginBottom: "-8px", marginTop: "8px"}}>{schema.label}</h5>;
    }
    if (schema.type === 'file'){
        return  ( 
        <React.Fragment>
            <Label>
                { schema.label }
                <small className="input-error">{error}</small>
            </Label>
            <Input 
                type="file" 
                name={name as string}  
                multiple={ schema.allowMultipleFiles === undefined ? true : schema.allowMultipleFiles }
                accept={ schema.allowedFileExtensions? schema.allowedFileExtensions : "*" } 
                onChange={ onChange }
                { ...other } 
            />
            {
                schema.allowedFileCount && 
                    <FormText color="muted">
                        { `Please select ${schema.allowedFileCount} files at max.`}
                    </FormText>
            }
           
        </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            <Label>
                {schema.label}{ schema.required && <span className="input-error">*</span> }
                <small className="input-error">{error}</small>
            </Label>
        <Input
            name={name as string}
            value={renderValue}
            type={schema.type}
            placeholder={schema.placeholder}
            invalid={!!error}
            onChange={ onChange }
            {...other}
        />
        </React.Fragment>
    );
};

const Form: <T>(_: FormProps<T>) => React.ReactElement<FormProps<T>> = (props) => {
    const {
        submitCallback, layout, schema, form,
        disabled, actions,
        actionName, actionsTop
    } = props;
    const { formValues, formErrors, onChange, onSubmit } = form;
    // TODO: use formErrors
    type FormType = typeof formValues;

    const processRow = <T extends unknown>(row: LayoutElement<T>[], fullWidth: number): ProcessedLayoutRow<T> => {
        if(typeof row == "string") return [[row, fullWidth]];
        const width = fullWidth/row.length;
        return row.map(item => processRow(item as Array<keyof T>, width)).flat();
    };
    React.useEffect(() => {
        form.setSchema(schema);
    }, []);

    const processedLayout = layout.map(row => processRow<FormType>(row, 12));
    const buttons = (
        <React.Fragment>
        { actionName && <Button color="success" style={{marginRight: '3px'}}>{actionName}</Button> }
        {
            (actions||[]).map(action => (
                <Button
                    key={action.name}
                    type="button"
                    color={action.color || "primary"}
                    onClick={() => action.callback(formValues)}
                    style={{marginRight:'3px'}}
                >
                    {action.name}
                </Button>
            ))
        }
        </React.Fragment>
    );
    return (
        <BForm className="tf-form" onSubmit={onSubmit(submitCallback)}>
            <fieldset disabled={!!disabled}>
            {actionsTop && <React.Fragment>{buttons}<hr/></React.Fragment>}
            {
                processedLayout.map((rows, i: number) => (
                    <Row key={i}>
                    {
                        rows.map(([fieldName, width]: [any, number]) => (
                            <Col md={width} key={fieldName as string}>
                            <FormGroup>
                                <WrappedInput<FormType>
                                    schema={schema[fieldName as (keyof FormType)]}
                                    name={fieldName}
                                    value={formValues[fieldName as (keyof FormType)]}
                                    onChange={onChange(fieldName, schema[fieldName as (keyof FormType)].valueProcessor)}
                                    formValues={formValues}
                                    error={formErrors[fieldName as (keyof FormType)]}
                                />
                            </FormGroup>
                            </Col>
                        ))
                    }
                    </Row>
                ))
            }
            {!actionsTop && <React.Fragment><hr />{buttons}</React.Fragment>}
            </fieldset>
        </BForm>
    );
}

export default Form;
