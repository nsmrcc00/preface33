import React from 'react'
import { useAuth } from '../../contexts/authContexts'
//test
import { Link, useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth'

const AdminHome = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()
    return (
        <>
            <div>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in to PreFace.</div>
            <div>
            {
                userLoggedIn
                ?
                <>
                    <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Logout</button>
                </>
                :
                <>
                    <Link to={'/login'}>Login</Link>
                </>
            }

            </div>
        </>
        

    )
}

export default AdminHome