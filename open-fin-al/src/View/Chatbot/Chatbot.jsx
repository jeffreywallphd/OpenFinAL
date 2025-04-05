import React, { Component } from "react";
import {LanguageModelInteractor} from "../../Interactor/LanguageModelInteractor";
import {JSONRequest} from "../../Gateway/Request/JSONRequest";

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

    handleSendMessage = async () => {
        const { userInput, messages } = this.state;
        if (userInput.trim() === "") return; // Prevent sending empty messages

        // Append new user message below existing messages
        let updatedMessages = [...messages, { content: userInput, role: "user" }];

        this.setState({ messages: updatedMessages, userInput: "" }); // Clear input after sending
        var interactor = new LanguageModelInteractor();
        // TODO: Fix to send all messages rather than most recent.
        var requestObj = new JSONRequest(`{
            "request": {
                "model": {
                    "name": "gpt-4",
                    "messages": [
                        {
                            "role": "user",
                            "content": "${userInput}"
                        }
                    ]
                }
            }
        }`);
        
        let response = await interactor.post(requestObj);

        updatedMessages = [...this.state.messages, response];

        this.setState({
            messages: updatedMessages, 
            userInput: this.state.userInput
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

export default Chatbot;