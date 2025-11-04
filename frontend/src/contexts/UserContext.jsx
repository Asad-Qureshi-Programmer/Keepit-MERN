import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserContextProvider = ({children})=>{
    const [userData, setUserData] = useState({
    userId: "",
    username: "",
    email: "",
  })
 
    const [userDataError, setUserDataError] = useState("");

    return (
        <UserContext.Provider value={{userData, setUserData, userDataError, setUserDataError}}>
            {children}
        </UserContext.Provider>
    )
}
