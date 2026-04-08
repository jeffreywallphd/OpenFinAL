import React from "react";

const DataContext = React.createContext({
    state: null,
    setState: () => {},
    user: null,
    setUser: () => {},
    isAuthenticated: false,
    setIsAuthenticated: () => {}
});

export { DataContext };
