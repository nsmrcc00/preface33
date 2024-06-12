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
  const [role, setRole] = useState('instructor');

  useEffect(() => {
    if (selectedAccount) {
      setIdNumber(selectedAccount.idNumber);
      setEmail(selectedAccount.email);
      setFirstName(selectedAccount.name.firstName);
      setMiddleName(selectedAccount.name.middleName);
      setLastName(selectedAccount.name.lastName);      
    }
  }, [selectedAccount]);

  // Add Account
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
      clearForm(); // Clear the input fields
      setErrorMessage(''); // Clear any previous error messages
      setSuccessMessage('User registered successfully'); // Set success message
    } catch (error) {
      console.error(error);
      setErrorMessage("Error registering user");
    } finally {
      setIsRegistering(false);
    }
  };
 
  // Update Account Information
  const onUpdate = async () => {
    if (!selectedAccount) {
      setErrorMessage('No instructor selected');
      return;
    }
    setIsUpdating(true);
    try {
      await doUpdateUser(selectedAccount.id, email, firstName, middleName, lastName, idNumber);
      console.log("User updated successfully");
      clearForm(); // Clear the input fields
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
          <button type="button" onClick={clearForm} className="acc-crud-btn btn btn-danger">
            Clear Form
          </button>
        </div>
      </form>
    </>
  );
};

export default Register;
