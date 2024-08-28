import React, { useState,useContext, useEffect } from 'react'
import { auth } from '../firebase.js'

import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}

export function AuthProvider({children}) {
    const [currentUser,setCurrentUser] = useState()
    const [loading,setLoading] = useState(true)


    function login(email,password){
        return signInWithEmailAndPassword(auth,email,password)
    }

    function logout(){
        return signOut(auth)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })
        return unsubscribe  // this will unsubscribe the current user whenever we unmount the component.
    },[])
    

    const value = {
        currentUser,
        login,
        logout,
    }
  
    return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}