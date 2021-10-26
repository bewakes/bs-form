import { Validation, DisplayCondition, FileAttachments, } from './types';

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

export const parseFileName = (fileURL: String) => {
            const splits = fileURL.split("/");
            const temp = splits[splits.length - 1].split("-");
            const filename = temp[temp.length - 1];
            return filename;
        }

export const validations = {
    noEmpty: (val: any) => (val === undefined || val === null || val.toString() === '') ? 'This cannot be empty': undefined,
    lessThan: (x: number) => (val: any) => val >= x ? 'Must be less than ' + x : undefined,
    greaterThan: (x: number) => (val: any) => val <= x ? 'Must be greater than ' + x : undefined,
    equalTo: (x: number) => (val: any) => val != x ? 'Must be equal to ' + x : undefined,
    lengthEquals: (x: number) => (val: any) => val.toString().length != x ? 'Length should be equal to ' + x : undefined,
    lengthLessThan: (x: number) => (val: any) => val.toString().length >= x ? 'Length should be less than ' + x : undefined,
    lengthGreaterThan: (x: number) => (val: any) => val.toString().length <= x ? 'Length should be greater than ' + x : undefined,
    
    // The maximum and minimum size are in KB
    validateMinFileSize : (min: number) => (value: FileAttachments) => {
                                                                    if(value){
                                                                        for(let i=0; i<value.currSelections.length; i++){
                                                                            if(!(value.currSelections[i].size >= min * 1024)){
                                                                                return `File size should be greater than ${min}KB`;
                                                                            }
                                                                        }
                                                                    }
                                                                    return undefined;
                                                                },

    validateFileCount: (max: number) => (value: FileAttachments) => {
        if(value){
            const prevSelectionLen = value.prevSelections? value.prevSelections.length: 0;
            if((value.currSelections.length + prevSelectionLen) <= max) return undefined;
            else return `Only selection of max ${max} files are allowed`;
        }
        return undefined;
    },
    validateMaxFileSize: (max: number) => (value: FileAttachments) => {
                                                                if(value){
                                                                    for(let i=0; i<value.currSelections.length; i++){
                                                                        if(!(value.currSelections[i].size <= max * 1024)){
                                                                            return `File size should not be greater than ${max}KB.`
                                                                        }
                                                                    }
                                                                }
                                                                return undefined;
                                                            },
}

export const and = (...dispConds: DisplayCondition<any>[]) => (formValues: any) =>
        dispConds.reduce((acc: boolean, cond) => acc && cond(formValues), true);

export const filterObject = (obj: any, f: (k: string, v: any) => boolean) => {
    return Object.keys(obj).reduce(
        (acc, key) => f(key, obj[key]) ? ({...acc, [key]: obj[key] }) : acc,
        {}
    );
};

export const flatifyValues = (obj: any): any => {
    const flatVals: { [key: string]: any } = {};
    Object.entries(obj).forEach(([k, v]: any[]) => {
        if (v && v.constructor === Object) {
            const flatified = flatifyValues(v);
            Object.entries(flatified).forEach(([kk, vv]) => {
                flatVals[k + '.' + kk] = vv;
            });
        } else {
            flatVals[k] = v;
        }
    });
    return flatVals;
};

export const nestifyValues = (obj: { [key: string]: any }): any => {
    // NOTE: this function does heavy mutation
    const nestedValues: { [key: string]: any } = {};
    Object.entries(obj).forEach(([k, v]) => {
        const splitted = k.split('.');
        if (splitted.length === 1) {
            nestedValues[k] = v;
        } else {
            let latestObj = nestedValues;
            splitted.slice(0, splitted.length - 1).forEach((kk) => {
                const tmp = latestObj[kk] || {};
                latestObj[kk] = tmp;
                latestObj = tmp;
            });
            latestObj[splitted[splitted.length - 1]] = v;
        }
    });
    return nestedValues;
};
