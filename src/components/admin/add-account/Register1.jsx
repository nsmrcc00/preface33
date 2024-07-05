import React, { useState, useEffect } from "react";
import { doCreateUserWithEmailAndPassword, doDeleteUser, doUpdateUser } from "../../../firebase/auth";
import emailjs from "@emailjs/browser"

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
  const [role, setRole] = useState('instructor');
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (selectedAccount) {
      setIdNumber(selectedAccount.idNumber);
      setEmail(selectedAccount.email);
      setFirstName(selectedAccount.name.firstName);
      setMiddleName(selectedAccount.name.middleName);
      setLastName(selectedAccount.name.lastName);
      setStatus(selectedAccount.status || '');      
    }
  }, [selectedAccount]);

  const generatePassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const sendPasswordEmail = (email, password) => {
    const serviceID = "***REMOVED***";
    const templateID = "***REMOVED***";
    const userID = "***REMOVED***";

    const templateParams = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    };

    emailjs.send(serviceID, templateID, templateParams, userID)
      .then((response) => {
        console.log('Email sent successfully', response.status, response.text);
      })
      .catch((error) => {
        console.error('Failed to send email', error);
      });
  };

  // Add Account
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const generatedPassword = generatePassword();
      await doCreateUserWithEmailAndPassword(email, generatedPassword, role, firstName, middleName, lastName, idNumber, null, status, null);
      console.log("User registered successfully");
      sendPasswordEmail(email, generatedPassword);
      clearForm();
      setErrorMessage('');
      setSuccessMessage('User registered successfully. The temporary password has been sent to the user\'s email.');
    } catch (error) {
      console.error(error);
      setErrorMessage("Error registering user");
    } finally {
      setIsRegistering(false);
    }
  };

  
 
  const onUpdate = async () => {
    if (!selectedAccount) {
      setErrorMessage('No instructor selected');
      return;
    }
    
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password should be at least 6 characters long');
        return;
      }
    }
  
    setIsUpdating(true);
    try {
      await doUpdateUser(
        selectedAccount.id, 
        email, 
        firstName, 
        middleName, 
        lastName, 
        idNumber, 
        null, 
        status, 
        null,
        password // Pass the new password if it's been entered
      );
      console.log("User updated successfully");
      clearForm();
      setErrorMessage('');
      setSuccessMessage('User updated successfully');
    } catch (error) {
      console.error(error);
      setErrorMessage("Error updating user");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Account
  const onDelete = async () => {
    if (!selectedAccount) {
      setErrorMessage('No instructor selected');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete the account for ${selectedAccount.name.firstName} ${selectedAccount.name.lastName}?`);
    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await doDeleteUser(selectedAccount.id);
      console.log("User deleted successfully");
      setErrorMessage('');
      setSuccessMessage('User deleted successfully');
      clearForm(); // Clear the input fields
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear all input fields
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setIdNumber('');
    setStatus('');
    setErrorMessage('');
    setSuccessMessage('');
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
        <select className="form-control" name="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {selectedAccount ? (
          <>
            <input 
              className="form-control" 
              type="password" 
              placeholder='New Password' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <input 
              className="form-control" 
              type="password" 
              placeholder='Confirm New Password' 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </>
        ) : null}
        {successMessage && (
          <span>{successMessage}</span>
        )}

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
          <button type="button" onClick={clearForm} className="acc-crud-btn btn btn-danger">
            Clear Form
          </button>
        </div>
      </form>
    </>
  );
};

export default Register;
