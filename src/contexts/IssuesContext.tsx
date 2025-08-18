import React, { createContext } from 'react';

interface IssuesContextType {
  // Placeholder for issues context if needed
}

export const IssuesContext = createContext<IssuesContextType>({});

export const IssuesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Add issues context if needed (currently handled by Redux)
  return <IssuesContext.Provider value={{}}>{children}</IssuesContext.Provider>;
};