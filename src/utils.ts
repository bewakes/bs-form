import {
    Validation,
    DisplayCondition,
} from './types';

export const validationOr = (...validationFuncs: Validation<any>[]) => (val: any, formValues: any) => {
    let invalids = [];
    let someValid = false;
    for(let i in validationFuncs) {
        const validation = validationFuncs[i](val, formValues);
        if (validation != undefined) invalids.push(validation);
        else someValid = true;
    };
    if (someValid) return undefined;
    return invalids.join('or ');
};

export const validationAnd = (...validationFuncs: Validation<any>[]) => (val: any, formValues: any) => {
    for(let i in validationFuncs) {
        const validation = validationFuncs[i](val, formValues);
        if (validation != undefined) return validation;
        };
    return undefined;
};

export const validations = {
    noEmpty: (val: any) => (val === undefined || val === null || val.toString() === '') ? 'This cannot be empty': undefined,
    lessThan: (x: number) => (val: any) => val >= x ? 'Must be less than ' + x : undefined,
    greaterThan: (x: number) => (val: any) => val <= x ? 'Must be greater than ' + x : undefined,
    equalTo: (x: number) => (val: any) => val != x ? 'Must be equal to ' + x : undefined,
    lengthEquals: (x: number) => (val: any) => val.toString().length != x ? 'Length should be equal to ' + x : undefined,
    lengthLessThan: (x: number) => (val: any) => val.toString().length >= x ? 'Length should be less than ' + x : undefined,
    lengthGreaterThan: (x: number) => (val: any) => val.toString().length <= x ? 'Length should be greater than ' + x : undefined,
}

export const and = (...dispConds: DisplayCondition<any>[]) => (formValues: any) =>
        dispConds.reduce((acc: boolean, cond) => acc && cond(formValues), true);

export const filterObject = (obj: any, f: (k: string, v: any) => boolean) => {
    return Object.keys(obj).reduce(
        (acc, key) => f(key, obj[key]) ? ({...acc, [key]: obj[key] }) : acc,
        {}
    );
};
