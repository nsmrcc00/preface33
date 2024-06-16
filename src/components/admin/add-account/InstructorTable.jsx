import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Import your Firestore instance
import useSortableData from '../../table-sort/TableSort';

const InstructorsTable = ({ setSelectedAccount }) => {
    const [instructors, setInstructors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const instructorsCollection = collection(db, "Users");
        const q = query(instructorsCollection, where("role", "==", "instructor"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const instructorsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setInstructors(instructorsData);
            console.log("Updated Table");
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter instructors based on search term
    const filteredInstructors = instructors.filter((instructor) => {
        const fullName = `${instructor.name.firstName} ${instructor.name.middleName} ${instructor.name.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            instructor.idNumber && instructor.email.toLowerCase().includes(searchTerm.toLowerCase())|| 
            instructor.idNumber && instructor.idNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const { items: sortedInstructors, requestSort, sortConfig } = useSortableData(filteredInstructors);

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div className='table-container'>
          <h2>Accounts List</h2>
            <input
                type="text"
                placeholder="Search Instructors..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  margin: '0px 0px 10px'
                }}
            />
            <table className='striped-table'>
                <thead>
                    <tr>
                        <th onClick={() => requestSort('idNumber')} className={getClassNamesFor('idNumber')}>ID Number</th>
                        <th onClick={() => requestSort('name.firstName')} className={getClassNamesFor('name.firstName')}>Name</th>
                        <th onClick={() => requestSort('email')} className={getClassNamesFor('email')}>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedInstructors.map((instructor) => (
                        <tr key={instructor.id} onClick={() => setSelectedAccount(instructor)}>
                            <td>{instructor.idNumber}</td>
                            <td>
                                {instructor.name.firstName} {instructor.name.middleName} {instructor.name.lastName}
                            </td>
                            <td>{instructor.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default InstructorsTable;
