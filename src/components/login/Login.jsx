import React, { useState } from "react"
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from "../../contexts/authContext"
import { doSignInWithEmailAndPassword } from "../../firebase/auth"

const Login = () => {
    const { userLoggedIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const logIn = async (e) => {
        e.preventDefault();
        if(!isSigningIn){
            setIsSigningIn(true)
            await doSignInWithEmailAndPassword(email, password).then((userCredential) => {
                //FOR TESTING ONLY. WILL BE REMOVED AT LAUNCH
                console.log(userCredential);            
            }).catch((error) => {
                console.error(error);
              })
        }
    }

    return (
        <main id="login-page">
            {userLoggedIn && (<Navigate to={'/admin-home'} replace={true} />)}

            <div className="mb-3 text-center">
                    <h1 id="login_heading">PREFACE</h1>
            </div>
            <form id="inputs" onSubmit={logIn}>
                <input
                    className="form-control" 
                    type="email" 
                    placeholder='Email' 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                ></input>
                
                <input
                    className="form-control" 
                    type="password" 
                    placeholder='Password'
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }}
                ></input>
        
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
        </main>
    )
}

export default Login