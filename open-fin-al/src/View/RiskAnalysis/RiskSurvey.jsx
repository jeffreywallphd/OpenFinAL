import React, { useState } from 'react';

const questionSet1 = [
    {
        id: 1,
        text: "How would you define investment risk?",
        options: [
            { value: 1, label: "The possibility of losing money" },
            { value: 2, label: "Market fluctuations" },
            { value: 3, label: "A chance for greater returns" }
        ]
    },
    {
        id: 2,
        text: "What is the largest percentage drop in your investment portfolio you could accept ?",
        options: [
            { value: 1, label: "I can't tolerate any losses" },
            { value: 2, label: "I prefer to avoid a loss greater than 15%" },
            { value: 3, label: "I'm okay with a 20% loss" },
            { value: 4, label: "I can handle significant drops" }
        ]
    },
    {
        id: 3,
        text: "If you faced sudden job loss two months before a planned luxury vacation, your response would be to",
        options: [
            { value: 1, label: "Cancel the vacation completely" },
            { value: 2, label: "Scale down to a more affordable trip" },
            { value: 3, label: "Proceed with the vacation as planned" }
        ]
    },
    {
        id: 4,
        text: "During the last major market downturn, your actions were:",
        options: [
            {value: 1, label: "Sold some or all of my holdings"},
            {value: 2, label: "Did nothing"},
            {value: 3, label: "Invested more in stocks"}
        ]
    },
    {
        id: 5,
        text: "If you won $5000, how would you consider using it?",
        options: [
            {value: 1, label: "keep it as cash"},
            {value: 2, label: "Invest it in stocks"},
            {value: 3, label: "gamble it for a chance at a bigger win"}
        ]
    },
    {
        id: 6,
        text: "How do you respond to stock market fluctuations?",
        options: [
            {value: 1, label: "I sell my stocks immediately"},
            {value: 2, label: "I hold and monitor the situation"},
            {value: 3, label: "I view it a buying opportunity"}
        ]
    },
    {
        id: 7,
        text: "If your stocks dropped 30% in value, your reaction would be:",
        options: [
            {value: 1, label: "Sell to minimum loss"},
            {value: 2, label: "Hold on and wait for recovery"},
            {value: 3, label: " Invest more to average down"}
        ]
    },
    {
        id: 8,
        text: "What is your primary goal of investing ?",
        options: [
            {value: 1, label: "Preserve my capital"},
            {value: 2, label: "Long-term wealth accumulation"},
            {value: 3, label: "Quick profits"}
        ]
    },
    {
        id: 9,
        text: "How comfortable are you with investing in high-risk stocks ?",
        options: [
            {value: 1, label : "Not comfortable at all"},
            {value: 2, label: "Somewhat comfortable"},
            {value: 3, label: "Very Comfortable"}
        ]
    },
    {
        id: 10,
        text: "What is your attitude towords market corrections ?",
        options: [
            {value: 1, label: "I dont focus on them much"},
            {value: 2, label: "I prefer to withdraw my investment"},
            {value: 3, label: "I see them as opportunities to invest"}
        ]
    },
    {
        id: 11,
        text: "How do you feel about leveraging investments, such as using margin ?",
        options: [
            {value: 1, label: "Not comfortable at all"},
            {value: 2, label: "Somewhat comfortable"},
            {value: 3, label: "Very Comfortabele with it"}
        ]
    }
];

const questionSet2 = [
    {
        id: 12,
        text: "How long have you been actively investing in stocks?",
        options: [
            { value: 1, label: "Less than 2 years" },
            { value: 2, label: "2-4 years" },
            { value: 3, label: "5-8 years" },
            { value: 4, label: "More than 8 years"}
        ]
    },
    {
        id: 13,
        text: "What percentage of your total investments is currently in stocks?",
        options: [
            { value: 1, label: "Below 30%" },
            { value: 2, label: "30-60%" },
            { value: 3, label: "60-80%" },
            { value: 4, label: "Over 80%" }
        ]
    },{
        id: 14,
        text: "Which type of stocks are you most interested in?",
        options: [
            { value: 1, label: "Established blue-chip stocks" },
            { value: 2, label: "Income Generating Stocks" },
            { value: 3, label: "Growth Stocks" }
        ]
    },{
        id: 15,
        text: "How do you rate your understanding of investing concepts?",
        options: [
            { value: 1, label: "Not very knowledgeable" },
            { value: 2, label: "Moderately knowleadgeble" },
            { value: 3, label: "Very knowledgeable" }
        ]
    },{
        id: 16,
        text: "Do any of your friends or family frequently invest in stocks?",
        options: [
            { value: 1, label: "No, they don't invest in stocks" },
            { value: 2, label: "Occassionally, some invest" },
            { value: 3, label: "yes, they are active investors" }
        ]
    },{
        id: 17,
        text: "How likely are you to seek advice from financial professionals?",
        options: [
            { value: 1, label: "Not likely at all" },
            { value: 2, label: "Somewhat likely" },
            { value: 3, label: "Very likely" }
        ]
    },{
        id: 18,
        text: "How frequently do you review your investment portfolio?",
        options: [
            { value: 1, label: "Infrequently" },
            { value: 2, label: "Monthly" },
            { value: 3, label: "Weekly" }
        ]
    }
];

const questionSet3 = [
    {
        id: 19,
        text: "How do you monthly income bracket?",
        options: [
            { value: 1, label: "$2000 $5000" },
            { value: 2, label: "$5001 to $10000" },
            { value: 3, label: "$10001 to $20000" },
            { value: 4, label: "Over $20000" }
        ]
    },
    {
        id: 20,
        text: "What do you estimate your monthly living expenses to be?",
        options: [
            { value: 1, label: "More than $10000" },
            { value: 2, label: "$5001 to $10000" },
            { value: 3, label: "$2001 to $5000" },
            { value: 4, label: "$100 to $2000" }
        ]
    },{
        id: 21,
        text: "What is your total outstanding debt?",
        options: [
            { value: 1, label: "More than $50000" },
            { value: 2, label: "$25001 to $50000" },
            { value: 3, label: "$10001 to $25000" },
            { value: 4, label: "$0 to $10000" }
        ]
    },{
        id: 22,
        text: "Estimate your total net worth (asserts minus liabilities)",
        options: [
            { value: 1, label: "$0 to $25000" },
            { value: 2, label: "$25001 to $50000" },
            { value: 3, label: "$50001 to $100000" },
            { value: 4, label: "More than $100000" }
        ]
    },{
        id: 23,
        text: "Do you have an emergency fund to cover unexpected expenses?",
        options: [
            { value: 1, label: "No, I do not have one" },
            { value: 2, label: "No, but i plan to create one" },
            { value: 3, label: "yes, but less than six months" },
            { value: 4, label: "yes, enough or more for six months" }
        ]
    },{
        id: 24,
        text: "If a new tech product catches your interest, what would you do?",
        options: [
            { value: 1, label: "Purchase it on credit" },
            { value: 2, label: "Use funds from your investment account" },
            { value: 3, label: "Pay for it using leftover savings" }
        ]
    }
];

const RiskSurvey = () => {
    const [isSurveyActive, setIsSurveyActive] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [currentSet, setCurrentSet] = useState(1);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [set1Answers, setSet1Answers] = useState(Array(11).fill(null));
    const [set2Answers, setSet2Answers] = useState(Array(7).fill(null));
    const [set3Answers, setSet3Answers] = useState(Array(6).fill(null));
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState("");
    const [displayedResult, setDisplayedResult] = useState(null);

    const handleAgree = () => {
        setHasAgreed(true);
        setShowDisclaimer(false);
        setIsSurveyActive(true);
    };

    const startSurvey = () => {
        setShowDisclaimer(true);
        setHasAgreed(false);
    };
    
    const getCurrentQuestionSet = () => {
        switch (currentSet) {
            case 1:
                return questionSet1;
            case 2:
                return questionSet2;
            case 3:
                return questionSet3;
            default:
                return questionSet1;
        }
    };

    const handleAnswer = (value) => {
        switch (currentSet) {
            case 1:
                const newSet1Answers = [...set1Answers];
                newSet1Answers[currentQuestion] = value;
                setSet1Answers(newSet1Answers);
                break;
            case 2:
                const newSet2Answers = [...set2Answers];
                newSet2Answers[currentQuestion] = value;
                setSet2Answers(newSet2Answers);
                break;
            case 3:
                const newSet3Answers = [...set3Answers];
                newSet3Answers[currentQuestion] = value;
                setSet3Answers(newSet3Answers);
                break;
        }
    };

    const handleNext = () => {
        const currentQuestionSet = getCurrentQuestionSet();
        if (currentQuestion < currentQuestionSet.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (currentSet < 3) {
            setCurrentSet(currentSet + 1);
            setCurrentQuestion(0);
        } else {
            calculateResult();
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (currentSet > 1) {
            setCurrentSet(currentSet - 1);
            const previousSetLength = currentSet === 2 ? questionSet1.length : questionSet2.length;
            setCurrentQuestion(previousSetLength - 1);
        }
    };

    const calculateResult = () => {
        const set1Score = set1Answers.reduce((acc, curr) => acc + curr, 0) / 34;
        const set2Score = set2Answers.reduce((acc, curr) => acc + curr, 0) / 24;
        const set3Score = set3Answers.reduce((acc, curr) => acc + curr, 0) / 23;
        
        const totalScore = (set1Score)*(0.5) + (set2Score)*(0.25) + (set3Score)*(0.25);
        
        let riskProfile;
        if (totalScore >= 0.8) {
            riskProfile = "High Risk Taker";
        } else if (totalScore <= 0.40) {
            riskProfile = "Low Risk Taker";
        } else {
            riskProfile = "Moderate Risk Taker";
        }
        
        setResult(riskProfile);
        setDisplayedResult(riskProfile);
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


    const currentQuestionSet = getCurrentQuestionSet();
    const getCurrentAnswers = () => {
        switch (currentSet) {
            case 1:
                return set1Answers;
            case 2:
                return set2Answers;
            case 3:
                return set3Answers;
            default:
                return [];
        }
    };

    return (
        <div className="survey-wrapper">
            {showDisclaimer ? (
                <div className="disclaimer-container">
                    <div className="disclaimer-content">
                        <h2>Important Notice</h2>
                        <div className="disclaimer-text">
                            <ul>
                                <li>This risk assessment survey is for informational purposes only.</li>
                                <li>Your responses are not saved or stored anywhere.</li>
                                <li>The results provided are indicative and should not be considered as professional financial advice.</li>
                                <li>For actual investment decisions, please consult with a qualified financial advisor.</li>
                            </ul>
                        </div>
                        <div className="disclaimer-buttons">
                            <button
                                onClick={handleAgree}
                                className="agree-button"
                            >
                                I Understand and Agree
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
                    {displayedResult && (
                        <div className="displayed-result">
                            Your Risk Profile: {displayedResult}
                        </div>
                    )}
                    <button 
                        onClick={startSurvey}
                        className="survey-button"
                    >
                        Take Risk Assessment Survey
                    </button>
                </div>
            ) : (
                <div className="survey-container">
                    {!showResult ? (
                        <div className="survey-content">
                            <h2 className="survey-title">Risk Assessment Survey - Set {currentSet}</h2>
                            
                            <div className="question-container">
                                <p className="question-text">
                                    {getCurrentQuestionSet()[currentQuestion].text}
                                </p>
                                <div className="options-container">
                                    {getCurrentQuestionSet()[currentQuestion].options.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleAnswer(option.value)}
                                            className={`option-button ${
                                                getCurrentAnswers()[currentQuestion] === option.value 
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
                                    disabled={currentQuestion === 0 && currentSet === 1}
                                    className="nav-button"
                                >
                                    Back
                                </button>

                                {currentSet === 3 && currentQuestion === getCurrentQuestionSet().length - 1 ? (
                                    <button
                                        onClick={calculateResult}
                                        disabled={!getCurrentAnswers()[currentQuestion]}
                                        className="submit-button"
                                    >
                                        Submit
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        disabled={!getCurrentAnswers()[currentQuestion]}
                                        className="nav-button"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>

                            <div className="progress-text">
                                Set {currentSet}: Question {currentQuestion + 1} of {getCurrentQuestionSet().length}
                            </div>
                        </div>
                    ) : (
                        <div className="result-container">
                            <h2 className="result-title">Your Risk Assessment Result</h2>
                            <p className="result-text">{result}</p>
                        </div>
                    )}
                </div>
            )}
                </div>
            )}
        

export { RiskSurvey };