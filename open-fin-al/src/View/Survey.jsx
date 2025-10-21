import React, { use, useState } from 'react';
import { useEffect } from 'react';



const Survey = (props) => {
    const [isSurveyActive, setIsSurveyActive] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(0);
    const [resultList, setResultList] = useState([]);

    useEffect(() => {
        if (!props.title) {
            console.warn("No title prop provided to Survey component.");
        }

        if (!props.disclaimer) {
            console.warn("No disclaimer prop provided to Survey component.");
        }

        /* Validate aggFunc prop
            - Check if aggFunc is a function
            - TODO validate that function can be called with an array of answers
            An example of aggFunc prop structure:
            function myAggFunc(answers) {
                // Custom aggregation logic here
                return aggregatedScore;
            }
        */
        if (props.aggFunc && typeof props.aggFunc !== "function") {
            console.error("Invalid aggFunc prop:", props.aggFunc);
            throw new Error("aggFunc prop must be a function.");
        }

        if (props.setResult && typeof props.setResult !== "function") {
            console.warn("Invalid or missing setResult prop:", props.setResult);
        }

        /* Validate questions prop validation
            - Check if questions is an array
            - Check if each question has a text and options, it can have no options if 
                wanted to just display text
            - Check if each option has a value and label
            An example of questions prop structure:
            [
                {
                    text: "Question text here",
                    options: [
                        { value: 1, label: "Option 1" },
                        { value: 2, label: "Option 2" }
                    ]
                },
                {
                    text: "Another question text",
                    options: [
                        { value: myScoringFunction, label: "Option A" },
                        { value: myScoringFunction2, label: "Option B" }
                    ]
                },
                {
                    text: "Question with no options",
                    options: []
                }
                ...
            ]
        */
        if (!props.questions || props.questions.length === 0) {
            console.error("No questions provided to Survey component.");
            throw new Error("Survey component requires a non-empty questions prop.");
        }

        for (const question of props.questions) {
            if (
                !question.text ||
                !Array.isArray(question.options)
            ) {
                console.error("Invalid question format:", question);
                throw new Error("Each question must have a text (string).");
            }
            for (const option of question.options) {
                if (
                    !option.value ||
                    (typeof option.value !== 'number' && typeof option.value !== "function") ||
                    !option.label ||
                    typeof option.label !== 'string'
                ) {
                    console.error("Invalid option format:", option);
                    throw new Error("Each option must have a value (number or function) and label (string).");
                }
            }
        }
        setResultList(Array(props.questions.length).fill(null));
    }, [props]);

    const handleAgree = () => {
        setHasAgreed(true);
        setShowDisclaimer(false);
        setIsSurveyActive(true);
    };

    const startSurvey = () => {
        setShowDisclaimer(true);
        setHasAgreed(false);
    };
    

    const handleAnswer = (option) => {
        const updatedResults = [...resultList];
        if (typeof option.value === "function") {
            updatedResults[currentQuestion] = option.value(option);
        } else {
            updatedResults[currentQuestion] = option.value;
        }
        setResultList(updatedResults);
    }
    const handleBack = () => {
        setCurrentQuestion(currentQuestion - 1);
    }

    const handleNext = () => {
        setCurrentQuestion(currentQuestion + 1);
    }

    const calculateResult = () => {
        let totalScore = 0;
        if (props.aggFunc) {
            totalScore = props.aggFunc(resultList);
        }
        else {
            let nullCount = 0;
            for (let score of resultList) {
                if (score === null) nullCount++;
                else totalScore += score;
            }
            totalScore = totalScore / (resultList.length - nullCount);
        }
        if (props.setResult) {
            props.setResult(totalScore);
        }
        setResult(totalScore);
        setShowResult(true);
    };

    const handleClose = () => {
        setIsSurveyActive(false);
        setShowResult(false);
        setCurrentSet(1);
        setCurrentQuestion(0);
        setSet1Answers(Array(11).fill(null));
        setSet2Answers(Array(8).fill(null));
        setSet3Answers(Array(5).fill(null));
    };

    return (
        <div className="survey-wrapper">
            {showDisclaimer ? (
                <div className="disclaimer-container">
                    <div className="disclaimer-content">
                        {props.disclaimer !== false ? (
                            <>
                                <h2> {props.disclaimerTitle || "Important Notice"}</h2>
                                <div className="disclaimer-text">
                                    {props.disclaimer || (
                                        <ul>
                                            <li>This survey is for informational purposes only.</li>
                                            <li>Your responses are not saved or stored anywhere.</li>
                                            <li>The results provided are indicative and should not be considered as professional financial advice.</li>
                                            <li>For actual investment decisions, please consult with a qualified financial advisor.</li>
                                        </ul>
                                    )}
                                </div>

                            </>
                        ) : <   h2> Welcome to the Survey </h2>}
                        <div className="disclaimer-buttons">
                            <button
                                onClick={handleAgree}
                                className="agree-button"
                            >
                                {props.disclaimer !== false ? "I Understand and Agree" : "Continue"}
                            </button>
                            <button
                                onClick={() => setShowDisclaimer(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : !isSurveyActive ? (
                <div className="start-container">
                    {result && (
                        <div className="displayed-result">
                            Your Final Score: {result}
                        </div>
                    )}
                    <button 
                        onClick={startSurvey}
                        className="survey-button"
                    >
                        Take Survey
                    </button>
                </div>
            ) : (
                <div className="survey-container">
                    {!showResult ? (
                        <div className="survey-content">
                            <h2 className="survey-title"> {props.title || "Survey"} </h2>

                            <div className="question-container">
                                <p className="question-text">
                                    {props.questions[currentQuestion].text}
                                </p>
                                <div className="options-container">
                                    {props.questions[currentQuestion].options.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleAnswer(option)}
                                            className={`option-button ${
                                                resultList[currentQuestion] === option.value 
                                                    ? 'selected' 
                                                    : ''
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="navigation-container">
                                <button
                                    onClick={handleBack}
                                    disabled={currentQuestion === 0}
                                    className="nav-button"
                                >
                                    Back
                                </button>

                                {currentQuestion === props.questions.length - 1 ? (
                                    <button
                                        onClick={calculateResult}
                                        disabled={(!resultList[currentQuestion] && props.questions[currentQuestion].options.length > 0)}
                                        className="submit-button"
                                    >
                                        Submit
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        disabled={(!resultList[currentQuestion] && props.questions[currentQuestion].options.length > 0)}
                                        className="nav-button"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>

                            <div className="progress-text">
                                Question {currentQuestion + 1} of {props.questions.length}
                            </div>
                        </div>
                    ) : (
                        <div className="result-container">
                            <h2 className="result-title">Your Assessment Result</h2>
                            <p className="result-text">{Math.round(result * 100) / 100}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export { Survey };