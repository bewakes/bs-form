# bs-form

  * [Install](#install)
  * [Features](#features)
  * [Usage](#usage)
  * [The API](#the-api)
    + [Schema](#schema)
    + [Layout](#layout)
    + [useForm hook](#useform-hook)
  * [License](#license)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


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
import { BSForm, validations, BSTypes as B } from 'bs-form';
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
    const onSubmit = (formValues: User) => { alert('submitted!!');};
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
Result of the above code after clicking 'Check' is:
![image](https://user-images.githubusercontent.com/5417640/121902641-3aee4d00-cd47-11eb-8f2e-96b23a3554c2.png)
Note that, when gender is selected (male or female) the hair length input appears.
![image](https://user-images.githubusercontent.com/5417640/121902903-7ab53480-cd47-11eb-85b2-5aa36256e361.png)

Now, if gender is male, and hair length is more than 10, as specified in the schema, it also throws an error
![image](https://user-images.githubusercontent.com/5417640/121903005-93254f00-cd47-11eb-8a73-655cb7152de7.png)


## The API
### Schema
A schema is an objet whose keys are the fields of the object that we are trying to render form for. The values of schema is an object consisting of the following:
- `type*`: The type of the input for that field.
- `label*`: The label of the input.
- `required`: If the field is required. Will display error message.
- `displayCondition`: A function returning boolean value. `true` if needs to be displayed and `false` otherwise. The parameters to the function is an object that current form state represents.
- `validation`: This is a function that returns falsy value if valid, else returns string that will be the error message. The parameters are the current field value, and current form object value. The library also has some predefined validation functions.

### Layout
A layout defines how the form is rendered. This is basically an array of arrays. Where each element of array represents a row-wise  ordering of form elements. The values are just the names of the fields. Please refer to the example above for the usage.


### useForm hook
This is the core part of the library. The arguments to this hook are the initial values of the form object and the schema. Please refer to the example above for usage details.

## License

MIT © [bewakes](https://github.com/bewakes)
