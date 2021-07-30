import React from 'react';
import { Row, Col, Form as BForm, Input, Label, FormGroup, Button, Alert } from 'reactstrap';

import { Layout, UseForm, Schema, SchemaSpec, LayoutElement, ProcessedLayoutRow } from './types';
import { Errors, nestifyValues } from './useForm';
import { parseFileName } from './utils';
import './style.css';
import { ProgressBar } from './ProgressBar';

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
    showProgressBar?: boolean;
    setShowProgressBar?: (x: boolean) => any;
};

interface WrappedInputProps<T> {
    name: keyof T; // TODO: make this generic
    onChange: (ev: React.FormEvent<HTMLInputElement>) => void;
    schema: SchemaSpec<T>;
    value: any;
    formValues: T;
    formErrors?: Errors<T>;
    setFormValues: (x: any) => any;
    setFormErrors: (x: any) => any;
}

function WrappedInput<T> (props: WrappedInputProps<T>) {
    const { name, schema, value, formValues, formErrors, onChange, setFormValues, setFormErrors, ...other } = props;
    const renderer = schema.valueRenderer || (x => x);
    const renderValue = renderer(value);

    const removeFileSelection = (index: number, selectionType: "currSelections"|"prevSelections") => {
            const updatedFileValues = formValues[name + "." + selectionType].filter((_: any, i:number) => i!=index);
            const updatedFormValues = { ...formValues, [name + "." + selectionType]: updatedFileValues };
            setFormValues(updatedFormValues);

            const err = schema.validation? schema.validation(nestifyValues(updatedFormValues)[name], updatedFormValues): undefined;

            if(typeof(err) === 'string'){
                setFormErrors({...formErrors,
                        [name]: err
                    })
            }
            else{
                if(formErrors && formErrors[name]){
                    const {[name]:_, ...updatedFormErrors} = formErrors;
                    setFormErrors(updatedFormErrors);
                }
            }
    }

    if(schema.displayCondition && !schema.displayCondition(formValues)) {
        return null;
    }
    if (schema.type === "select") {
        return (
            <React.Fragment>
                <Label>
                    {schema.label}{ schema.required && <span className="input-error">*</span> }
                    <small className="input-error">{formErrors && formErrors[name]}</small>
                </Label>
                <Input
                    name={name as string}
                    value={renderValue}
                    type="select"
                    invalid={!!(formErrors && formErrors[name])}
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
                        invalid={!!(formErrors && formErrors[name])}
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
        const mParseFileName = schema.parseFileName? schema.parseFileName : parseFileName;
        return  ( 
        <FormGroup>
            <Label style={{ display: "block"}}>
                { schema.label }
                <small className="input-error">{formErrors && formErrors[name]}</small>
            </Label>
            <Input 
                type="file"
                name={name as string}  
                multiple={true}
                accept={ schema.allowedFileExtensions? schema.allowedFileExtensions : "*" } 
                onChange={ onChange }
                { ...other } 
                style={{ display: "none" }}
                id="uploadFile"
            />
            <button type="button" className="browse-btn" onClick={ () => document.getElementById("uploadFile")?.click() }>
                Browse...
            </button>
            {
                formValues[name+'.currSelections'] && 
                    Object.entries(formValues[name+'.currSelections']).map(
                        ([key, file]) => 
                            <div key={ key }>
                                <span>{ (file as File).name }</span>
                                <span className="remove-file" onClick={ () => removeFileSelection(+key, "currSelections")}>X</span>
                            </div>
                )
            }
            {
                formValues[name+'.prevSelections'] && formValues[name+'.prevSelections'].length !== 0 &&
                    <div>
                        <hr/>
                        <b>Previous selected files:</b>
                        {
                            formValues[name+'.prevSelections'].map(mParseFileName).map(
                                (filename:string, index:number) => 
                                    <div key={ index }>
                                        <span>{ filename }</span>
                                        <span className="remove-file" onClick={ () => removeFileSelection(+index, "prevSelections")}>X</span>
                                    </div>
                            )
                        }
                    </div>
            }
        </FormGroup>
        );
    }
    return (
        <React.Fragment>
            <Label>
                {schema.label}{ schema.required && <span className="input-error">*</span> }
                <small className="input-error">{formErrors && formErrors[name]}</small>
            </Label>
        <Input
            name={name as string}
            value={renderValue}
            type={schema.type}
            placeholder={schema.placeholder}
            invalid={!!(formErrors && formErrors[name])}
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
        actionName, actionsTop, showProgressBar, setShowProgressBar
    } = props;

    const { formValues, formErrors, onChange, onSubmit, setFormValues, setFormErrors} = form;
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
        <BForm className="tf-form" onSubmit={onSubmit(submitCallback, setShowProgressBar)}>
            <fieldset disabled={!!disabled}>
            {actionsTop && <React.Fragment>{buttons}<hr/></React.Fragment>} 
            {
                showProgressBar!=undefined && showProgressBar &&
                <Alert color='light'>
                    <ProgressBar text="Uploading File..."/>
                </Alert>
            }
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
                                    setFormValues={setFormValues}
                                    setFormErrors={setFormErrors}
                                    formErrors={formErrors}
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
