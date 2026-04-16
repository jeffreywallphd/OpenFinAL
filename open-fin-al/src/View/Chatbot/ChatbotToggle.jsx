import React, { Component } from "react";
import chatbotIcon from './comment-alt.png';
import Chatbot from "../Chatbot";

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
                    <button
                      className="circle"
                      onClick={this.handleClick}
                      aria-label={this.state.toggle ? "Close chatbot" : "Open chatbot"}
                      aria-expanded={this.state.toggle}
                    >
                        <img src={chatbotIcon} alt="Chatbot Icon" className="chatbotIcon" width={30} height={30} />
                    </button>
                </div>

                {this.state.toggle && (                                                
                    <Chatbot handleToggle={this.handleClick} />                         
                )}
            </div>
        );
    }
}

export default ChatbotToggle;
