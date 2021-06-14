export { validations } from './utils';
export { default as BSForm } from './BSForm';

export * as BSTypes from './types';

export { useForm } from './useForm';

/*
import 'bootstrap/dist/css/bootstrap.min.css';

interface User {
    name: string;
    age: number;
    height: number;
    address: string;
    gender: string;
    hairLength: number;
}

const schema: Schema<User> = {
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

const layout: Layout<User> = [
    ['name'],
    ['age', 'height'],
    ['address'],
    ['gender', 'hairLength']
];


const App: React.FC = () => {
    const onSubmit = () => { alert('submitted!!');};
    const initialValues: User = {} as User;
    const form = useForm(initialValues, schema);
    console.warn(form.formErrors);
    return (
        <Row>
            <Col md="3" />
            <Col md="6">
                <h2> My form</h2>
                <BSForm<User>
                    form={form}
                    schema={schema}
                    layout={layout}
                    submitCallback={onSubmit}
                    actionName="Check!"
                />
            </Col>
            <Col md="3" />
        </Row>
    );
};

ReactDOM.render(
    <App/>,
    document.getElementById('app'),
);
*/
