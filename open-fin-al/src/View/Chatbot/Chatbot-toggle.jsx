import React, { Component } from "react";
import './ChatbotToggle.css'
import './comment-alt.png'

class ChatbotToggle extends Component {
    handleClick = () => {
        alert('Circle clicked!');
    };
    render() {
        return (
            <div className="chatBotToggle">
                <div className="circle" onClick={this.handleClick}></div>
            </div>
        );
    }
}

export default ChatbotToggle;