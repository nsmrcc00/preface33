import React from 'react'
import { useAuth } from '../../contexts/authContexts'
import Header from '../header/Header'

const AdminHome = () => {
    const { currentUser } = useAuth()
    
    return (
        <>
            <Header/>
            <div>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
            
        </>
    )
}

export default AdminHome