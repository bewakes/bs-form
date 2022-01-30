import React from 'react';
import { UseForm, Schema, Validation, SchemaSpec } from './types';
import {
    filterObject,
    validations,
    validationAnd,
    nestifyValues,
    flatifyValues
} from './utils';

export type Errors<T> = {
    [K in keyof T]?: string;
};

export const useForm = <T>(initvalues: T, _schema?: Schema<any>, onFieldValueChanged?: Function) => {
    // eslint:disable-next-line
    const [formValues, _setFormValues] = React.useState<T>(
        flatifyValues(initvalues)
    ); // TODO: flatify is complicating the typing as it allows for nesting. Handle this gracefully
    // eslint:disable-next-line
    const [resetValues, setResetValues] = React.useState<T>(
        flatifyValues(initvalues)
    ); // TODO: flatify is complicating the typing as it allows for nesting. Handle this gracefully
    const [formErrors, setFormErrors] = React.useState<Errors<T>>({});
    const [schema, setSchema] = React.useState<Schema<T> | undefined>(_schema);
    const [dirty, setDirty] = React.useState<T>({} as T);

    const validateAndSetErrors = () => {
        if (schema) {
            const errs = Object.entries(schema).reduce((acc, [key, value]) => {
                const requiredValidation = schema[key as keyof T].required
                    ? validations.noEmpty
                    : () => undefined;
                const explicitValidation = schema[key as keyof T].validation
                    ? schema[key as keyof T].validation
                    : () => undefined;
                const fieldValidation = validationAnd(
                    requiredValidation,
                    explicitValidation as Validation<T>
                );

                let validation;
                if ((value as SchemaSpec<T>).type === 'file') {
                    const formValuesNested = nestifyValues(formValues);
                    validation = fieldValidation(
                        formValuesNested[key as keyof T],
                        formValuesNested
                    );
                } else {
                    validation = fieldValidation(
                        formValues[key as keyof T],
                        formValues
                    );
                }

                if (validation !== undefined) {
                    return { ...acc, [key]: validation };
                }
                return acc;
            }, {});
            if (Object.keys(errs).length !== 0) {
                setFormErrors(errs);
                return false;
            }
        }
        return true;
    };

    // eslint:disable-next-line
    const setFormValues = (x: any) => _setFormValues(flatifyValues(x));

    const getFilteredValues = () => {
        if (schema) {
            const filtered = filterObject(formValues, isFieldNotHidden);
            return { ...initvalues, ...nestifyValues(filtered) };
        } else {
            return { ...initvalues, ...nestifyValues(formValues) };
        }
    };

    const onSubmit =
        (callback: (arg0: T) => void) =>
        (ev: React.FormEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const valid = validateAndSetErrors();
            if (!valid) return;
            callback(getFilteredValues());
        };
    const resetForm = () => {
        setFormValues(resetValues);
    };

    const isFieldNotHidden = (key: string, _: any) => {
        // eslint:disable-next-line
        const dispCond = schema && schema[key as keyof T]?.displayCondition;
        const hideCond = schema && schema[key as keyof T]?.hideCondition;
        return !!(
            schema === undefined ||
            (dispCond === undefined && hideCond === undefined) ||
            (dispCond && dispCond(formValues)) ||
            (hideCond && !hideCond(formValues))
        );
    };

    const setFormValue = (k: keyof T, v: any) => {
        setFormValues({ ...formValues, [k]: v });
        onFieldValueChanged &&
            onFieldValueChanged(k, {
                ...formValues,
                [k]: v
            });
    };

    return {
        formValues,
        formErrors,
        onChange:
            (name: keyof T, valueProcessor?: (_: any, formVals: any) => any, customField?: false) => 
            (ev: React.FormEvent<HTMLInputElement>, customValue?: any) => {
                let value: any = customField ? customValue : ev?.currentTarget?.value ;
                if (ev?.currentTarget?.type === 'checkbox') {
                    value = ev.currentTarget.checked;
                }
                if (ev?.currentTarget?.type === 'file') {
                    name = (name + '.currSelections') as keyof T;
                    const currentSelected = Array.from(
                        ev.currentTarget.files as FileList
                    );
                    if (!(name in formValues)) {
                        value = currentSelected;
                    } else {
                        value = [...formValues[name as string]];
                        for (const file of currentSelected) {
                            value.push(file);
                        }
                    }
                }
                const valProcessor = valueProcessor || ((x) => x);
                setDirty({ ...dirty, [name]: true });
                setFormValues({
                    ...formValues,
                    [name]: valProcessor(value, formValues)
                });
                setFormErrors({ ...formErrors, [name]: undefined });
                onFieldValueChanged &&
                    onFieldValueChanged(name, {
                        ...formValues,
                        [name]: valProcessor(value, formValues)
                    });
            },
        onSubmit,
        updateForm: (newVal: T) => setFormValues(newVal),
        resetForm,
        resetValues,
        setFormValues,
        setFormValue,
        setFormErrors,
        setSchema,
        getFilteredValues,
        setResetValues,
        validateAndSetErrors,
        initvalues
    } as UseForm<T>;
};
