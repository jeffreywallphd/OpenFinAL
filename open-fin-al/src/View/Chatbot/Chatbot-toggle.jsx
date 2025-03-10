import React, { Component } from "react";
import './ChatbotToggle.css';  // Ensure this file contains the necessary styles
import chatbotIcon from './comment-alt.png';

class ChatbotToggle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false, // State to toggle visibility
        };
    }

    handleClick = () => {
        this.setState(
            (prevState) => {
                const newToggleState = !prevState.toggle; // Toggle the state
                //alert(newToggleState ? 'Chatbot Visible' : 'Chatbot Hidden'); // Alert when the state changes
                return { toggle: newToggleState };
            }
        );
    };

    render() {
        return (
            <div>
                <div className="chatBotToggle">
                    <div className="circle" onClick={this.handleClick}>
                        <img src={chatbotIcon} alt="Chatbot Icon" className="chatbotIcon" width={30} height={30}  />
                    </div>
                </div>

                {this.state.toggle && (
                    <Chatbot />  /* Conditionally render the Chatbot component */
                    )}
            </div>
        );
    }
}

class Chatbot extends Component {
    render() {
        return (
            <div className="chatBot">
                <header>
                    <h2>ChatBot</h2>
                </header>
                <ul className="chatbox">
                    <li className="chat-incoming chat">
                        <p>Hey! How can I assist you today?</p>
                    </li>
                </ul>
                <div className="chat-input">
          <textarea
              rows="0"
              cols="17"
              placeholder="Enter a message..."
          ></textarea>
                    <button id="sendBTN">Send</button>
                </div>
            </div>
        );
    }
}

export default ChatbotToggle;
