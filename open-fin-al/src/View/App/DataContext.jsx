import React from "react";

// ## Recent change
// Provide safe defaults so Settings and other consumers can render
// even before the authenticated app shell mounts the provider.
const DataContext = React.createContext({
    state: null,
    setState: () => {},
    user: null,
    setUser: () => {},
    isAuthenticated: false,
    setIsAuthenticated: () => {}
});

export { DataContext };
