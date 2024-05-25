import React, { useState } from "react"
import { doCreateUserWithEmailAndPassword } from "../../../firebase/auth"

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')//NEED TO ADD ERROR CHECKING AND VALIDATION

    

    const onSubmit = async (e) => {
        e.preventDefault();
        if(!isRegistering) {
            setIsRegistering(true)
            await new Promise(resolve => setTimeout(resolve, 150));
            /*

            Make adding to auth and firestore at the same time work ASAP

            import { db } from "../../../firebase/firebase"
            import { doc, setDoc } from "firebase/firestore"

            const [instructorInfo] = useState({
                Email: '',
                FirstName: '',
                ID: '',
                LastName: '',
                MiddleName: '',
            });
            await setDoc(doc(db, "Instructors", instructorInfo.Email), {
                Email: instructorInfo.Email,
                FirstName: instructorInfo.FirstName,
                ID: instructorInfo.ID,
                LastName: instructorInfo.LastName,
                MiddleName: instructorInfo.MiddleName,
            });
             */
            
            await doCreateUserWithEmailAndPassword(email, password).then((userCredential) => {
                console.log("Added user!");
                //FOR TESTING ONLY. WILL BE REMOVED AT LAUNCH
                console.log(userCredential);            
            }).catch((error) => {
                console.error(error);
                alert("Error!")
            })
            setIsRegistering(false)
        }

    }



    return (
        <>

            <form id='addInstuctorInfo' onSubmit={onSubmit}>
                <input
                    className="form-control"
                    type="number"
                    placeholder="ID Number"                    
                />
                <input
                    className="form-control" 
                    type="email" 
                    placeholder='Email'
                    autoComplete='email'
                    require 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                />
                
                <input
                    className="form-control"
                    type="text"
                    placeholder="First Name"                    
                />
                                
                <input
                    className="form-control"
                    type="text"
                    placeholder="Middle Name (Leave blank if none.)"                    
                />

                <input
                    className="form-control"
                    type="text"
                    placeholder="Last Name"                    
                />

                <input
                    className="form-control"
                    disabled={isRegistering} 
                    type="password" 
                    placeholder='Password'
                    autoComplete='new-password'
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }}
                />

                <input
                    disabled={isRegistering}
                    className="form-control"
                    type="password"
                    placeholder='Confirm Password'
                    autoComplete='off'
                    required
                    value={confirmPassword} 
                    onChange={(e) => { setconfirmPassword(e.target.value) }}
                />

                <div className="mb-3 text-center">
                    <button
                        id="gen_btn"
                        type="submit"
                        disabled={isRegistering}
                        className={`${isRegistering} btn btn-primary`}
                    >
                        {isRegistering ? 'Adding Account...' : 'Add Account'}
                    </button>
                </div>
                
            </form>  
        </>
    )
}

export default Register