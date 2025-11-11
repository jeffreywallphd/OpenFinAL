import React from "react";
import { Survey } from "./Survey";

const questions = [
    {
        id: 0,
        text: "This is a question with 3 options",
        options: [
            { value: 1, label: "Option 1" },
            { value: 2, label: "Option 2" },
            { value: 3, label: "Option 3" }
        ]
    },
    {
        id: 1,
        text: "This is a question without options",
        options: []
    },
    {
        id: 2,
        text: "This is a question with a function option type",
        options: [
            {
                value: (option) => {
                    // Custom logic for this option
                    console.log("Option 1 selected:", option);
                    return 5; // Example fixed score
                },
                label: "Option 1"
            },
            {
                value: (option) => {
                    // Custom logic for this option
                    console.log("Option 2 selected:", option);
                    return 10; // Example fixed score
                },
                label: "Option 2"
            }
        ]
    },
];


const SurveyDemo = () => {
    return (
            <>
                <h1>Survey demo</h1>
                <div>This is a demo of the Survey component. Shows how to use the component while changing the title and disclaimer, while passing the final result back to the original component.</div>

                <Survey
                    title="Risk Assessment Survey"
                    disclaimer={<ul>
                                    <li>This is a sample disclaimer</li>
                                    <li>This can take any form of text/html</li>
                                    <li>You can leave the disclaimer field black for a generic disclaimer, or set to <strong>false</strong> to hide it</li>
                                </ul>}
                    setResult={console.log}
                    questions={questions}
                />
            </>
    );
};


export default SurveyDemo;