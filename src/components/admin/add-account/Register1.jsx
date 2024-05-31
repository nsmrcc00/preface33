import React, { useState, useEffect } from "react";
import { doCreateUserWithEmailAndPassword, doDeleteUser, doUpdateUser } from "../../../firebase/auth";

const Register = ({ selectedAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('instructor'); // Example role, you can make this dynamic based on your UI

  useEffect(() => {
    if (selectedAccount) {
      setIdNumber(selectedAccount.idNumber);
      setEmail(selectedAccount.email);
      setFirstName(selectedAccount.name.firstName);
      setMiddleName(selectedAccount.name.middleName);
      setLastName(selectedAccount.name.lastName);      
    }
  }, [selectedAccount]);

  //Add Account
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setIsRegistering(true);
    try {
      await doCreateUserWithEmailAndPassword(email, password, role, firstName, middleName, lastName, idNumber); // Pass idNumber here
      console.log("User registered successfully");
      // Clear the input fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setIdNumber('');
      setErrorMessage(''); // Clear any previous error messages
      setSuccessMessage('User registered successfully'); // Set success message
    } catch (error) {
      console.error(error);
      setErrorMessage("Error registering user");
    } finally {
      setIsRegistering(false);
    }
  };
 
  //Update Account Information
  const onUpdate = async () => {
    if (!selectedAccount) {
      setErrorMessage('No instructor selected');
      return;
    }
    setIsUpdating(true);
    try {
      await doUpdateUser(selectedAccount.id, email, firstName, middleName, lastName, idNumber);
      console.log("User updated successfully");
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setIdNumber('');
      setErrorMessage('');
      setSuccessMessage('User updated successfully');
    } catch (error) {
      console.error(error);
      setErrorMessage("Error updating user");
    } finally {
      setIsUpdating(false);
    }
  };

  //Delete Account
  const onDelete = async () => {
    if (!selectedAccount) {
      setErrorMessage('No instructor selected');
      return;
    }
    setIsDeleting(true);
    try {
      await doDeleteUser(selectedAccount.id);
      console.log("User deleted successfully");
      setErrorMessage('');
      setSuccessMessage('User deleted successfully');
      // Clear the input fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setIdNumber('');
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <form id='addInstructorInfo' onSubmit={onSubmit}>
        <label>
          <h2>Instructor Info</h2>
        </label>
        <input className="form-control" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input className="form-control" type="text" placeholder="Middle Name (Optional)" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
        <input className="form-control" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <input className="form-control" type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="form-control" type="text" placeholder="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
        <input className="form-control" type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="form-control" type="password" placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <div className="mb-3 text-center acc-crud">
          <button type="submit" disabled={isRegistering} className="acc-crud-btn btn btn-danger">
            {isRegistering ? 'Adding Account...' : 'Add Account'}
          </button>
          {selectedAccount && (
            <>
              <button type="button" onClick={onUpdate} disabled={isUpdating} className="acc-crud-btn btn btn-danger">
                {isUpdating ? 'Updating Account...' : 'Update Account'}
              </button>
              <button type="button" onClick={onDelete} disabled={isDeleting} className="acc-crud-btn btn btn-danger">
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </button>
            </>
            
          )}
        </div>
        
      </form>
    </>
  );
};

export default Register;






/* 
import 'bootstrap/dist/css/bootstrap.min.css';

{errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

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

*/