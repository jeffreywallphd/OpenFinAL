import React, { useState, useMemo, useContext } from "react";
import { Outlet } from "react-router-dom";
import { UserInfo } from "./UserInfo";
import ChatbotToggle from "../Chatbot/ChatbotToggle";


export const HeaderContext = React.createContext({
  title: "Open FinAL",
  icon: null,
  setHeader: () => {},
});

export function useHeader() {
  return useContext(HeaderContext);
}

export function AppLoadedLayout(props) {
  const [header, setHeader] = useState({
    title: null,
    icon: null,
  });

  const value = useMemo(
    () => ({
      title: header.title,
      icon: header.icon,
      setHeader,
    }),
    [header]
  );

  return (
    <HeaderContext.Provider value={value}>
        <header className="pageHeader"
          
        >
            <h2><span className="material-icons">{header.icon}</span> {header.title}</h2>
            <div className="toolset">
                <ChatbotToggle/>
                <UserInfo onLogout={props.onLogout} />
            </div>
        </header>
        <main>
          <Outlet />
        </main>
    </HeaderContext.Provider>
  );
}