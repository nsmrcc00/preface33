import React, { useState } from "react"
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from "../../contexts/authContexts"
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
                console.log(error);
            })
        }
    }

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/admin-home'} replace={true} />)}
            <form onSubmit={logIn}>
                <h1>PreFace</h1>
                <input 
                    type="email" 
                    placeholder='Email' 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                ></input>

                <input 
                    type="password" 
                    placeholder='Password'
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }}
                ></input>
                
                {errorMessage && (<span>{errorMessage}</span>)}


                <button
                    type="submit"
                    disabled={isSigningIn}
                    className={`${isSigningIn}`}
                >
                    {isSigningIn ? 'Signing In...' : 'Sign In'}
                </button>

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
