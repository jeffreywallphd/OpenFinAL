import React, { Component } from "react";
import './ChatbotToggle.css';  // Ensure styles are correctly linked
import chatbotIcon from './comment-alt.png';
import Chatbot from "./Chatbot";

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
                            <Chatbot handleToggle={this.handleClick} /> {/* The chatbot component */}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default ChatbotToggle;
