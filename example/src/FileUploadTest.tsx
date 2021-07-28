import * as React from 'react';
import { Row, Col } from 'reactstrap';

import { BSForm, BSTypes as B, useForm, validationAnd, validations } from 'bs-form';
import 'bs-form/dist/index.css';

interface FileResponse{
    id: number,
    url: string
}

interface FileUpload{
	name: string;
    age: number;
	fileAttachments: B.FileAttachments<FileResponse>;
}

const attachedFiles = [
                {
                    id: 1,
                    url: "/media/pa_task_files/96B06DF10FE970F14E791711528CD835-Screenshot (37).png"
                },
                {
                    id: 2,
                    url: "/media/pa_task_files/8EB9131641B53D06BF624781FE99D5BB-Screenshot (38).png"
                }
            ];

const schema: B.Schema<FileUpload, FileResponse> = {
    name: { type: "text", label: "Your name", required: true },
	fileAttachments: {
        type: "file",
        label: "Select your file(s)",
        allowMultipleFiles: true,
		allowedFileCount: 2,
        allowedFileExtensions: ".pdf, image/*",
        parseFileNames: (fileResponses: FileResponse[]) => {
            let filenames: String[] = [];
            for(const fileResp of fileResponses){
                const splits = fileResp.url.split("/");
                const temp = splits[splits.length - 1].split("-");
                const filename = temp[temp.length - 1];
                filenames.push(filename);
            }
            return filenames;
        },
        validation: validationAnd(validations.validateFileCount(2), validations.validateMaxFileSize(500)),
    },
    age: { type:"text", label: "Your age" }
}

const layout: B.Layout<FileUpload> = [
	['name'],
    ['age'],
	['fileAttachments'],
];

const uploadFile = (fileAttachments: B.FileAttachments<FileResponse>) => {
    const postBody = new FormData();
    for(let i=0; i< fileAttachments.currSelections.length; i++){
        postBody.append("files", fileAttachments.currSelections[i]);
    }

    const removedFileIds = getRemovedFileIds(attachedFiles, fileAttachments.prevSelections);
    postBody.append("deleteIds", JSON.stringify(removedFileIds));

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

const getRemovedFileIds = (previousFiles: FileResponse[], updatedFiles: FileResponse[]) => {
    if(previousFiles.length > updatedFiles.length){
        return previousFiles.filter(x => !updatedFiles.includes(x)).map(y => y.id);
    }
    return [];
}

const FileUploadComponent: React.FC = () => {
	const onSubmit = (formValues: FileUpload) => { 
        uploadFile(formValues.fileAttachments);
        console.log(formValues);
    };
    // const initialValues: FileUpload = {
    //     name: "zombie",
    //     age: 9,
    //     fileAttachments: {
    //         prevSelections: attachedFiles,
    //         currSelections: []
    //     }
    // } as FileUpload;
    const initialValues = {} as FileUpload;
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