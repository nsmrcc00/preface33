import { useState, useEffect } from "react";
import { doCreateUserWithEmailAndPassword, doDeleteUser, doUpdateUser } from "../../../firebase/auth";
import { db } from '../../../firebase/firebase';
import { getDocs, collection } from 'firebase/firestore';

const Register = ({ selectedAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [/*errorMessage, */setErrorMessage] = useState('');
  const [/*successMessage, */setSuccessMessage] = useState('');

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, /*setRole*/] = useState('student');
  const [section, setSection] = useState('');
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (selectedAccount) {
      setIdNumber(selectedAccount.idNumber);
      setEmail(selectedAccount.email);
      setSection(selectedAccount.section)
      setFirstName(selectedAccount.name.firstName);
      setMiddleName(selectedAccount.name.middleName);
      setLastName(selectedAccount.name.lastName);      
    }
  }, [selectedAccount]);

  //Fetch Sections from Collections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Sections"));
        const sectionsList = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          ref: doc.ref
        }));
        setSections(sectionsList);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

    fetchSections();
  }, []);

  // Add Account
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setIsRegistering(true);
    try {
      await doCreateUserWithEmailAndPassword(email, password, role, firstName, middleName, lastName, idNumber, section); // Pass section here
      console.log("User registered successfully");
      // Clear the input fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setIdNumber('');
      setSection('');
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
      setErrorMessage('No student selected');
      return;
    }
    setIsUpdating(true);
    try {
      await doUpdateUser(selectedAccount.id, email, firstName, middleName, lastName, idNumber, section); // Pass section here
      console.log("User updated successfully");
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setIdNumber('');
      setSection('');
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
      setErrorMessage('No student selected');
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
      setSection('');
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <form id='addStudentInfo' onSubmit={onSubmit}>
        <label>
          <h2>Student Info</h2>
        </label>
        <input className="form-control" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input className="form-control" type="text" placeholder="Middle Name (Optional)" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
        <input className="form-control" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <input className="form-control" type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="form-control" type="text" placeholder="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
        <input className="form-control" type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="form-control" type="password" placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        
        <select className="form-control" name="section" value={section} onChange={(e) => setSection(e.target.value)} required>
          <option value="">Select Section</option>
          {sections.map((section, index) => (
            <option key={index} value={`${section.sectionName}`}>
              {`${section.sectionName}`}
            </option>
          ))}
        </select>

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
