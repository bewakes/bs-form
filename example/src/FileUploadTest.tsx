import * as React from 'react';
import { Row, Col } from 'reactstrap';

import { BSForm, BSTypes as B, useForm, validationAnd, validations } from 'bs-form';
import 'bs-form/dist/index.css';

interface FileUpload{
	name: string;
    age: number;
	fileAttachments: FileList;
}

const schema: B.Schema<FileUpload> = {
    name: { type: "text", label: "Your name", required: true },
	fileAttachments: {
        type: "file",
        label: "Select your file(s)",
        allowMultipleFiles: true,
		allowedFileCount: 2,
        allowedFileExtensions: ".pdf, image/*",
        validation: validationAnd(validations.validateFileCount(2), validations.validateMaxFileSize(500)),
    },
    age: { type:"text", label: "Your age" }
}

const layout: B.Layout<FileUpload> = [
	['name'],
    ['age'],
	['fileAttachments'],
];

const FileUploadComponent: React.FC = () => {
	const onSubmit = (formValues: FileUpload) => { console.log("formValues", formValues) };
    const initialValues: FileUpload = {} as FileUpload;
    const form = useForm(initialValues, schema);
    console.warn(form.formErrors);
    return (
        <Row>
            <Col md="3" />
            <Col md="6">
                <h2> My form</h2>
                <BSForm<FileUpload>
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
}

export default FileUploadComponent;