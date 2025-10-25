import React, { useState } from "react";

const questions = [
  {
    questionText: "If you buy a company's stock, what are you actually doing?",
    answerOptions: [
      { answerText: "You're buying ownership — you own a part of the company.", score: 4 },
      { answerText: "You're letting the company borrow your money.", score: 3 },
      { answerText: "You're putting in money and the company promises to pay you back with extra later.", score: 2 },
      { answerText: "You're on the hook if the company owes money or gets into debt.", score: 1 }
    ],
  },
  {
    questionText: "Over the past 20 years in the U.S., which investment has usually had the highest average returns?",
    answerOptions: [
      { answerText: "Investing in stocks", score: 4 },
      { answerText: "Buying bonds", score: 3 },
      { answerText: "Putting money into precious metals like gold or silver", score: 2 },
      { answerText: "Keeping cash in a CD or money market account", score: 1 }
    ],
  },
  {
    questionText: "Over the long run, what's a realistic average yearly return to expect from a well-diversified U.S. stock mutual fund?",
    answerOptions: [
      { answerText: "10%", score: 4 },
      { answerText: "5%", score: 3 },
      { answerText: "15%", score: 2 },
      { answerText: "Over 20%", score: 1 }
    ],
  },
  {
    questionText: "How would you evaluate whether a stock is overvalued or undervalued?",
    answerOptions: [
      { answerText: "I'd analyze fundamentals, trends, and valuation models like DCF.", score: 4 },
      { answerText: "I'd compare its P/E ratio and other metrics to industry averages.", score: 3 },
      { answerText: "I'd look at the current price compared to past prices.", score: 2 },
      { answerText: "I'm not sure.", score: 1 }
    ],
  },
  {
    questionText: "What role do index funds play in a portfolio?",
    answerOptions: [
      { answerText: "They offer diversified exposure to specific sectors using underlying securities.", score: 4 },
      { answerText: "They help spread risk by investing in a broad market.", score: 3 },
      { answerText: "They're similar to stocks.", score: 2 },
      { answerText: "I'm not sure.", score: 1 }
    ],
  },
  {
    questionText: "How do interest rates affect investments?",
    answerOptions: [
      { answerText: "I actively monitor rate trends to adjust my investment strategy.", score: 4 },
      { answerText: "I understand that rising rates can negatively impact bonds and equities.", score: 3 },
      { answerText: "I know they impact the market, but I'm not sure how.", score: 2 },
      { answerText: "I'm not sure.", score: 1 }
    ],
  },
  {
    questionText: "What does the \"time value of money\" mean?",
    answerOptions: [
      { answerText: "A dollar today is worth more than a dollar in the future due to its earning potential.", score: 4 },
      { answerText: "Inflation and other economic conditions can erode the value of money over time.", score: 3 },
      { answerText: "It refers to how long you can hold cash before investing it.", score: 2 },
      { answerText: "It means future money will always grow at the same rate.", score: 1 }
    ],
  },
  {
    questionText: "Which kind of bond is considered the safest to invest in?",
    answerOptions: [
      { answerText: "U.S. Treasury bond", score: 4 },
      { answerText: "Municipal bonds", score: 3 },
      { answerText: "Corporate Bonds", score: 2 },
      { answerText: "Unsure", score: 1 }
    ],
  },
  {
    questionText: "I plan to begin taking money from my investments in…",
    answerOptions: [
      { answerText: "1-2 years", score: 4 },
      { answerText: "3-5 years", score: 3 },
      { answerText: "6-10 years", score: 2 },
      { answerText: "11-15 years", score: 1 }
    ],
  },
  {
    questionText: "My current and future income sources are…",
    answerOptions: [
      { answerText: "Very Unstable", score: 4 },
      { answerText: "Unstable", score: 3 },
      { answerText: "Somewhat stable", score: 2 },
      { answerText: "Stable", score: 1 }
    ],
  },
  {
    questionText: "How would you describe your understanding of how taxes affect your investments?",
    answerOptions: [
      { answerText: "I don't really know how investment taxes work.", score: 1 },
      { answerText: "I've heard of capital gains and tax-advantaged accounts, but don't fully understand them.", score: 2 },
      { answerText: "I understand key concepts like short- vs long-term capital gains and tax deferral.", score: 3 },
      { answerText: "I actively consider tax implications (e.g., harvesting losses, asset location) when investing.", score: 4 }
    ],
  },
  {
    questionText: "How would you describe your current knowledge of investing?",
    answerOptions: [
      { answerText: "I'm completely new and don't know basic terms like \"stock\" or \"bond.\"", score: 1 },
      { answerText: "I know the basics but haven't invested much.", score: 2 },
      { answerText: "I'm comfortable with concepts like diversification and have some experience.", score: 3 },
      { answerText: "I'm experienced and familiar with advanced topics like options or market analysis.", score: 4 }
    ],
  },
  {
    questionText: "Have you ever invested in stocks, bonds, or other securities?",
    answerOptions: [
      { answerText: "No, never.", score: 1 },
      { answerText: "Yes, but only through a retirement account like a 401(k).", score: 2 },
      { answerText: "Yes, I've made a few individual investments.", score: 3 },
      { answerText: "Yes, I actively manage a portfolio.", score: 4 }
    ],
  },
  {
    questionText: "What does \"diversification\" mean in investing?",
    answerOptions: [
      { answerText: "Putting all your money in one stock for higher returns.", score: 1 },
      { answerText: "Spreading investments across different assets to reduce risk.", score: 3 },
      { answerText: "Buying only low-risk bonds.", score: 2 },
      { answerText: "I don't know.", score: 1 }
    ],
  },
  {
    questionText: "How familiar are you with financial ratios like P/E or Debt-to-Equity?",
    answerOptions: [
      { answerText: "Not at all.", score: 1 },
      { answerText: "I've heard of them but don't understand how to use them.", score: 2 },
      { answerText: "I can interpret them for basic stock analysis.", score: 3 },
      { answerText: "I use them regularly in my investment decisions.", score: 4 }
    ],
  },
];

const FinancialKnowledgeSurvey = () => {

  const [step, setStep] = useState("begin");
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (index, choice) => {
    let newAnswers = [...answers];
    newAnswers[index] = choice.answerText;
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      document.getElementsByClassName("next-question-button").style.display = "block"; //TODO: replace with React use state logic
    }
    else {
      document.getElementsByClassName("submit-assessment").style.display = "block"; //TODO: replace with React use state logic
    }
  };


  const testScoreCalculation = (answers) => {
    let score = 0;
    let level = "";
    let learningPath = "";

    answers.forEach((answerText, index) => {
      if (!answerText) return;

      const question = questions[index];
      const selectedAnswer = question.answerOptions.find(
        (opt) => opt.answerText === answerText
      );

      if (selectedAnswer && selectedAnswer.score) {
        score += selectedAnswer.score;
      }
    });

    if (score >= 15 && score <= 30) {
      level = "Beginner";
      learningPath =
        "Basics Track: What is investing?, stocks/bonds/ETFs, starter portfolio, emotional control.";
    } else if (score >= 31 && score <= 45) {
      level = "Intermediate";
      learningPath =
        "Growth Track: diversification, risk-return tradeoffs, valuation basics, comparing stocks/ETFs, common financial ratios.";
    } else if (score >= 46) {
      level = "Advanced";
      learningPath =
        "Analytics Track: portfolio optimization, valuation models, advanced risk management, options, active trader strategies.";
    }
    setStep("results")
    setResult({ "score": score, "level": level, "learningPath": learningPath });
  }

  const nextQuestion = (currentQuestion) => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      document.getElementById("next-question-button").style.display = "none"; //TODO: replace with React use state logic
    }
    else {
      document.getElementById("submit-assessment").style.display = "block"; //TODO: replace with React use state logic
      document.getElementById("next-question-button").style.display = "none"; //TODO: replace with React use state logic
    }
  }

  return (
    <div className="survey-wrapper">
      {step === "begin" && (
        <div className="disclaimer-container">
          <div className="disclaimer-content">
            <h2>Welcome to the financial-knowledge assessment! Please click the button to begin.</h2>
            <div className="disclaimer-buttons">
              <button
                className="agree-button"
                onClick={() => setStep("assessment")}>
                Begin Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "assessment" && (
        <div className="survey-container">
          <div className="survey-content">
            <div className="question-container">
              <p className="question-text">{questions[currentQuestion].questionText}</p>
              <div className="answer-options">
                {questions[currentQuestion].answerOptions.map((opt) => (
                  <button
                    key={opt.answerText}
                    onClick={() => handleAnswer(currentQuestion, opt)}
                    className={`option-button ${answers[currentQuestion] === opt.answerText ? "selected" : ""}`}
                    disabled={answers[currentQuestion] && answers[currentQuestion] !== opt.answerText}
                  >
                    {opt.answerText}
                  </button>
                ))}
              </div>
            </div>
            <div className="navigation-container">
              <button className="next-question-button" onClick={() => nextQuestion(currentQuestion)}>Next</button>
              <button className="submit-assessment" onClick={() => testScoreCalculation(answers)}>Submit Assessment</button>
            </div>
          </div>
        </div>
      )
      }


      {
        step === "results" && (
          <div className="survey-container">
            <div className="result-container">
              <h2 className="result-tilte">Results</h2>
              <p className="result-text">Score: {result?.score}</p>
              <p className="result-text">Investor Type: {result?.level}</p>
              <p className="result-text">Learning Path: {result?.learningPath}</p>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default FinancialKnowledgeSurvey;
