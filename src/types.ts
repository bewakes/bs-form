export type ValToVal = (v: any, formvals?: any) => any;

export type LayoutElement<T> = keyof T | Array<keyof T>;
export type Layout<T> = Array<LayoutElement<T>>[];
export type ProcessedLayoutRow<T> = Array<[keyof T, number]>;
export type NonSelect = "number" | "text" | "date" |  "email" | "password" | "textarea" | "checkbox" | "time" | "label";
export type Option = { label: string; value: string | number };

export type InputType = "select" | "file" | NonSelect;

export type Falsy = false | 0 | undefined | null;

export type Validation<T> = (value: any, formValues: T) => (string | Falsy);

export type DisplayCondition<T> = (_: T) => boolean;
export type DisplayConditions<T> = { [K in keyof T]: DisplayCondition<T> | undefined };

export type SchemaSpec<T> = {
    label: string;
    required?: boolean;
    displayCondition?: (formVals: T) => boolean;
    validation?: Validation<T>;
    valueRenderer?: ValToVal;
    valueProcessor?: ValToVal;
    placeholder?: string;
} & ({
    type: NonSelect; }
  | {
        type: "select";
        options: Option[];
    }
  |{
        type: "file";
        allowedFileExtensions?: string;
        parseFileName?: (fileURL: String) => String;
  });

export interface Action<T> {
    name: string;
    custom?: {[key: string]: Object};
    callback: (elem: T, action?: any) => void;
    color?: "primary" | "success" | "danger" | "warning";
}

export type Schema<T> = {
    [K in keyof T]: SchemaSpec<T>;
};

export interface UseForm<T> {
    formValues: T;
    formErrors: {[key in keyof T]: string};
    onChange: (name: keyof T, processor?: (v: any, formvals?: any) => any) => (ev: any) => void;
    onSubmit: (callback: Function) => (ev: any) => void;
    resetForm: () => void;
    updateForm: (a: T) => void;
    setFormValues: (a: T) => void;
    setFormErrors: (a: T) => void;
    setResetValues: (a: T) => void;
    setSchema: (a: Schema<T>) => void;
    validateAndSetErrors: Function;
    resetValues: T;
}

export interface FileAttachments{
    prevSelections: String[],
    currSelections: File[]
}