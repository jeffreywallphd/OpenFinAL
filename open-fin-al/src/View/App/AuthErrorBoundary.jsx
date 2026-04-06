import React, { Component } from "react";

class AuthErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Authenticated app crashed, recovering to login screen.', error, errorInfo);

        if (this.props.onRecover) {
            this.props.onRecover(error, errorInfo);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return null;
        }

        return this.props.children;
    }
}

export { AuthErrorBoundary };
