# bs-form
A bootstrap form library for react. **You don't need to write a single JSX/Html.**

* [Install](#install)
* [Features](#features)
* [Usage](#usage)
* [The API](#the-api)
    + [Schema](#schema)
    + [Layout](#layout)
    + [useForm hook](#useform-hook)
        * [onSubmit](#onsubmit)
        * [formValues](#formvalues)
        * [setFormValues](#setformvalues)
    + [Validation](#validation)
* [Contributing](#contributing)
* [License](#license)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

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

**NOTE** the bootstrap import statement in the code snippet.
```tsx
import React, { Component } from 'react'
import { BSForm, validations, BSTypes as B, useForm } from 'bs-form';
import 'bs-form/dist/index.css';

// Need to import bootstrap as well, but first yarn add bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

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
This is the core part of the library. The arguments to this hook are the initial values of the form object and the schema. When not used with `BSForm`, it is used as follows:
```typescript
const initialValues: User = {} as User;
const schema: Schema<User> = {...};
const form = useForm(initialValues, schema);
const { setFormValues, onChange, formValues, onSubmit, formErrors } = form;

const onFormSubmit = (data) => {
    fetch('/my/api/', { method: 'post', body: JSON.Stringify(data) ... })
        .then(r => r.json())
        .then(j => { setState(j); ... } );
}

render () { 
    return (
        <form onSubmit={onSubmit(onFormSubmit)}>
            <div>
                <label>Name: </label>
                <small style={{color: 'red'}}>{formErrors['name']}</small>
                <input type="text" name="name" onChange={onChange('name')} />
            </div>
            <div>
                <label>Age: </label>
                <small style={{color: 'red'}}>{formErrors['age']}</small>
                <input type="number" name="age" onChange={onChange('age')} />
            </div>
            ...

            <button type="submit">Submit Form</button>
        </form>
    );
}
```
#### onSubmit
`onSubmit` obtained from form hook is a higher order function that takes care of validation for you. Just pass in your callback function(which should take form values as arguments) and obtain a new function to use with `<form>`'s `onSubmit`.

#### formValues
At any instant `formValues` contains the latest values for each input.

#### setFormValues
Use this when you want to externally set form values, i.e. when you need control from outside the form.

### Validation
There are basic validation functions available:
```typescript
import { BSTypes as B, validations, validationAnd, validationOr } from 'bs-form';

// The following are the available functions.

const {
 noEmpty,
 lessThan,
 greaterThan,
 equalTo,
 lengthEquals,
 lengthLessThan,
 lengthGreaterThan,
} = validations;

const schema: B.Schema<User> = {
    age: { ..., validation: validations.greaterThan(18) },
    name: { ..., validation: validationAnd(noEmpty, lengthGreaterThan(3), lengthLessThan(20)) }
};
```
Besides these, you can write your own validation functions and compose them with
`validationOr` and `validationAnd`.

**Validation Function interface:**:
```typescript
const customValidation = (fieldValue: any, allformValues: User) => {
    // Do your calculations and return falsy if valid otherwise return an string to indicate error.
    // The returned string will be displayed as form error.
}
```
## Contributing
Contributions are more than welcome. Please create and issue first(describing your targeted change), and then refer that issue in your pull request.

## License

MIT © [bewakes](https://github.com/bewakes)
