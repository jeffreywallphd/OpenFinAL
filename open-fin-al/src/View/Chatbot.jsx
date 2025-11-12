/*
Chatbot.jsx
-----------
This file defines a React component that provides a chat UI for interacting with a local AI chatbot backend. The component manages chat state, handles user input, and communicates with a local Node.js server (chatbot_server.js) that runs a Hugging Face Transformers model (Xenova/gpt2) for text generation. The UI displays the chat history and allows the user to send messages and receive AI-generated replies.

Key Data Types:
- State: {
    messages: Array<{ content: string, role: 'user' | 'assistant' }>,
    userInput: string
  }
- Props: {
    handleToggle: function (for closing the chat modal)
  }
- Backend API: POST /chat with { messages: Array<{ content, role }> } returns { reply: string }
*/

import React, { Component } from "react";

/**
 * Chatbot React component
 * Renders a chat modal UI, manages chat state, and communicates with the backend chatbot server.
 * Usage: <Chatbot handleToggle={...} />
 *
 * State:
 * - messages: Array of chat message objects ({ content: string, role: 'user' | 'assistant' })
 * - userInput: Current value of the user's input textarea
 *
 * Props:
 * - handleToggle: Function to close/hide the chat modal
 */
class Chatbot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [
                { content: "Hey! How can I assist you today?", role: "assistant" }
            ],
            userInput: ""
        };
    }

    /**
     * Handles changes in the user input textarea.
     * @param {React.ChangeEvent<HTMLTextAreaElement>} event
     */
    handleInputChange = (event) => {
        this.setState({ userInput: event.target.value });
    };

    /**
     * Handles sending a user message to the backend and updating the chat history.
     * Sends a POST request directly to the local backend with the full message history.
     * Updates state with the assistant's reply or an error message.
     */
    handleSendMessage = async () => {
        const { userInput, messages } = this.state;
        if (userInput.trim() === "") return;

        let updatedMessages = [...messages, { content: userInput, role: "user" }];
        this.setState({ messages: updatedMessages, userInput: "" });

        // Use direct fetch to call the new Python backend (Flask)
        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages })
            });
            const data = await response.json();
            console.log("Backend response:", data); // Debug log
            updatedMessages = [...updatedMessages, { content: data.reply, role: "assistant" }];
            this.setState({ messages: updatedMessages });
        } catch (error) {
            updatedMessages = [...updatedMessages, { content: "[Error: Could not reach local model]", role: "assistant" }];
            this.setState({ messages: updatedMessages });
        }
    };

    /**
     * Renders the chat modal UI, including chat history, input, and controls.
     */
    render() {
        return (
            <div className="chatbot-modal">
                <div className="chatbot-modal-content">
                    <header>
                        <button onClick={this.props.handleToggle} className="close-btn">X</button>
                    </header>
                    <div className="chatHistory">
                        <h3>Chat History</h3>
                    </div>
                    <div className="chatControls">
                        <button>New Chat</button>
                        <div className="chatSettings"><span className="material-icons">settings</span></div>
                    </div>
                    <div className="chatBot">
                        <ul className="chatbox">
                            {this.state.messages.map((msg, index) => (
                                <li key={index} className={`chat ${msg.role === "user" ? "chat-outgoing" : "chat-incoming"}`}>
                                    <p>{msg.content}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="chat-input">
                            <textarea
                                placeholder="Enter a message..."
                                value={this.state.userInput}
                                onChange={this.handleInputChange}
                            ></textarea>
                        </div>
                        <button id="sendBTN" onClick={this.handleSendMessage}>Send</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chatbot;