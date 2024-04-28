import React from 'react'
import { useAuth } from '../../contexts/authContext'
import Header from '../header/Header'

const AdminHome = () => {
    const { currentUser } = useAuth()
    
    return (
        <>
            <Header/>
            <div>
                <h2>
                Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.    
                </h2>            
            </div>
            <div>
                a
            </div>
            <div>
                b
            </div>
        </>
    )
}

export default AdminHome