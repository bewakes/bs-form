import * as React from 'react';
import { Row, Col } from 'reactstrap';

import { BSForm, BSTypes as B, useForm, validationAnd, validations } from 'bs-form';
import 'bs-form/dist/index.css';

interface FileUpload{
	name: string;
    age: number;
	fileAttachments: Array<File>;
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

const uploadFile = (fileAttachments: File[]) => {
    const postBody = new FormData();
    for(let i=0; i< fileAttachments.length; i++){
        postBody.append("files", fileAttachments[i]);
    }

    fetch("http://localhost:8080/dr2client/api/file-upload", {
            method: 'POST',
            mode: 'cors',
            body: postBody,
            headers: {
                'Authorization': "eyJsb2dpbmlkIjoidXJtaS5taHJ6QGdtYWlsLmNvbSIsImxhc3RfbmFtZSI6bnVsbCwiZGF0YXNldElkIjoyLCJyb3dzZXROYW1lIjoidXNlcnMiLCJpZCI6IjMiLCJmYW1pbHkiOnsiYWRkcmVzcyI6IkthdGhtYW5kdSIsInJvbGUiOiJPcmdhbml6ZXIiLCJjb2xvciI6bnVsbCwibmFtZSI6Ik1haGFyamFuIiwibG9nbyI6bnVsbCwiYWN0aXZlIjp0cnVlLCJpZCI6IjEiLCJzbG9nYW4iOiJKaGlpIE5ld2EifSwiZmlyc3RfbmFtZSI6IlVybWlsYSBNYWhhcmphbiIsImlzX3ZlcmlmaWVkIjp0cnVlLCJlbWFpbCI6InVybWkubWhyekBnbWFpbC5jb20iLCJvcmdJZCI6MX0=.A616D4721AC88BDF0EFDB83B878AEE01"
            }
        }
    )
    .then(response => response.json())
    .then(data => console.log(data))
    .catch( err => console.log(err));
}

const FileUploadComponent: React.FC = () => {
	const onSubmit = (formValues: FileUpload) => { 
        uploadFile(formValues.fileAttachments);
    };
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