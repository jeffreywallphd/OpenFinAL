import React, { Component } from "react";
import './ChatbotToggle.css';  // Ensure styles are correctly linked
import chatbotIcon from './comment-alt.png';
import {LanguageModelInteractor} from "../../Interactor/LanguageModelInteractor";
import {JSONRequest} from "../../Gateway/Request/JSONRequest";

class ChatbotToggle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false, // Toggle chatbot visibility
        };
    }

    handleClick = () => {
        this.setState((prevState) => ({ toggle: !prevState.toggle }));
    };

    render() {
        return (
            <div>
                <div className="chatBotToggle">
                    <div className="circle" onClick={this.handleClick}>
                        <img src={chatbotIcon} alt="Chatbot Icon" className="chatbotIcon" width={30} height={30} />
                    </div>
                </div>

                {this.state.toggle && (
                    <div className="chatbot-modal">
                        <div className="chatbot-modal-content">
                            <button onClick={this.handleClick} className="close-btn">X</button>
                            <Chatbot /> {/* The chatbot component */}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

class Chatbot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [
                { content: "Hey! How can I assist you today?", role: "assistant" } // Initial bot message
            ],
            userInput: ""
        };
    }

    handleInputChange = (event) => {
        this.setState({ userInput: event.target.value });
    };

    handleSendMessage = () => {
        const { userInput, messages } = this.state;
        if (userInput.trim() === "") return; // Prevent sending empty messages

        // Append new user message below existing messages
        const updatedMessages = [...messages, { content: userInput, role: "user" }];

        this.setState({ messages: updatedMessages, userInput: "" }); // Clear input after sending
        var interactor = new LanguageModelInteractor();
        // TODO: Fix to send all messages rather than most recent.
        var requestObj = new JSONRequest({
            "request": {
                "model": {
                    "name": "gpt-4o",
                    "messages": [
                        {
                            "role": "user",
                            "content": `${userInput}` // Correct use of template literals
                        }
                    ]
                }
            }
        });
    };

    render() {
        return (
            <div className="chatBot">
                <header>
                    <h2>ChatBot</h2>
                </header>
                <ul className="chatbox">
                    {this.state.messages.map((msg, index) => (
                        <li key={index} className={`chat ${msg.role === "user" ? "chat-outgoing" : "chat-incoming"}`}>
                            <p>{msg.content}</p>
                        </li>
                    ))}
                </ul>
                <div className="chat-input">
                    <textarea
                        rows="1"
                        cols="17"
                        placeholder="Enter a message..."
                        value={this.state.userInput}
                        onChange={this.handleInputChange}
                    ></textarea>
                </div>
                <button id="sendBTN" onClick={this.handleSendMessage}>Send</button>
            </div>
        );
    }
}

export default ChatbotToggle;
