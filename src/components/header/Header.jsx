import React from 'react'
import { useAuth } from '../../contexts/authContext'
import { Link, useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth'

function Header() {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()

    return (
        <>
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
            <div>
                <button>Random</button>
            </div>
        </>
  )
}

export default Header
