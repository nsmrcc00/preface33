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
                console.log(userCredential);
            }).catch((error) => {
                console.error(error);
                setErrorMessage(error.message || "An error occurred during sign-in."); // Set generic message if error.message is not available
              })
        }
    }

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/admin-home'} replace={true} />)}
            <form onSubmit={logIn}>
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

                
                
                {errorMessage && (<span>{errorMessage}</span>)}
                
                <div className="mb-3 text-center">
                    <button
                        id="login_btn"
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

export default Login

    
    /*
    const logIn = async (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential);
        }).catch((error) => {
            console.log(error);
        })
    }

    <button
                    type="submit"
                >Log In</button>
    */
