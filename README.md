# bs-form

A bootstrap form library for react. **You don't need to write a single JSX/Html.**

[![NPM](https://img.shields.io/npm/v/bs-form.svg)](https://www.npmjs.com/package/bs-form) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save bs-form
yarn add bs-form
```

## Features
- [x] Full typescript support
- [x] Validate/Display/Hide the fields using js functions. This is very powerful!!
- [x] Specify form layout as array. This is really awesome!!
- [x] No need to write a single html/jsx
- [x] Although it works best(the form layouting) in bootstrap, it can be used with other libraries as well.

## Usage
Let's see how a form for User data looks like.
```tsx
import React, { Component } from 'react'
import 'bs-form/dist/index.css'

interface User {
    name: string;
    age: number;
    height: number;
    address: string;
    gender: string;
    hairLength: number;
}

const schema: B.Schema<User> = {
    name: { type: "text", label: "Your name", required: true },
    age: { type: "number", label: "Your age", required: true, validation: validations.greaterThan(18), },
    height: {
        type: "number", label: "Your Height", required: true,
        validation: (val) => (val < 3 || val > 7) && "You can't be below 3 feet and above 7 feet",
    },
    address: { type: "text", label: "Address", required: true },
    gender: {
        type: "select",
        label: "Gender",
        options: [
            { label: "--Select--", value: "" },
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Don't Disclose", value: "no_disclose" },
        ],
    },
    hairLength: {
        type: "number",
        label: "Hair Length(cms)",
        displayCondition: (otherValues: User) => otherValues.gender != "no_disclose" && !!otherValues.gender,
        validation: (val, otherValues: User) => otherValues.gender == 'male'
                                                ? (val > 10) && "A guy can't have more than 10 cms long"
                                                : (val < 10) && "A girl can't have less than 10 cms long"
    }
};

const layout: B.Layout<User> = [
    ['name'],
    ['age', 'height'],
    ['address'],
    ['gender', 'hairLength']
];


const App: React.FC = () => {
    const onSubmit = () => { alert('submitted!!');};
    const initialValues: User = {} as User;
    const form = useForm(initialValues, schema);
    return (
        <div className="row">
            <div className="col-md-3" />
            <div className="col-md-6">
                <h2> My form</h2>
                <BSForm<User>
                    form={form}
                    schema={schema}
                    layout={layout}
                    submitCallback={onSubmit}
                    actionName="Check!"
                />
            </div>
            <div className="col-md-3" />
        </div>
    );
};

```

## License

MIT © [bewakes](https://github.com/bewakes)
