import React, { useState } from "react"
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from "../../contexts/authContext"
import { doCreateUserWithEmailAndPassword } from "../../firebase/auth"
/*

ADD ACCOUNT, FIND A WAY TO DO ROLE BASED AUTHENTICATION ASAP
replace login stuff

*/
const AccountsPage = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const { userLoggedIn } = useAuth()

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isRegistering) {
            setIsRegistering(true)
            await doCreateUserWithEmailAndPassword(email, password)
        }
    }

    return (
        <div id="accounts-page">
            {userLoggedIn && (<Navigate to={'/admin-home'} replace={true} />)}
            <form id="inputs" onSubmit={logIn}>
                <div className="mb-3 text-center">
                    <h1 id="login_heading">PREFACE</h1>
                </div>

                <div className="mb-3">
                    <input
                        className="form-control" 
                        type="email" 
                        placeholder='Email' 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value) }}
                    ></input>
                </div>
                

                <div className="mb-3">
                    <input
                        className="form-control" 
                        type="password" 
                        placeholder='Password'
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                    ></input>
                </div>

                <div className="mb-3 text-center">
                    <button
                        id="gen_btn"
                        type="submit"
                        disabled={isSigningIn}
                        className={`${isSigningIn} btn btn-primary`}
                    >
                        {isSigningIn ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>  
        </div>
    )
}

export default AccountsPage
