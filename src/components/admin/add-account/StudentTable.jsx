import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Import your Firestore instance
import useSortableData from '../../table-sort/TableSort';

const StudentTable = ({ setSelectedAccount }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const studentsCollection = collection(db, "Users");
        const q = query(studentsCollection, where("role", "==", "student"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(studentsData);
            console.log("Updated Table");
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter students based on search term
    const filteredStudents = students.filter((student) => {
        const fullName = `${student.name.firstName} ${student.name.middleName} ${student.name.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
               student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())|| 
               student.idNumber && student.idNumber.toLowerCase().includes(searchTerm.toLowerCase())||
               student.section && student.section.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const { items: sortedStudents, requestSort, sortConfig } = useSortableData(filteredStudents);

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <h2>Accounts List</h2>
            <input
                type="text"
                placeholder="Search Students..."
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
                        <th onClick={() => requestSort('email')} className={getClassNamesFor('email')}>Email</th>
                        <th onClick={() => requestSort('name.firstName')} className={getClassNamesFor('name.firstName')}>Name</th>
                        <th onClick={() => requestSort('section')} className={getClassNamesFor('section')}>Section</th>
                        <th>MAC Address</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedStudents.map((student) => (
                        <tr key={student.id} onClick={() => setSelectedAccount(student)}>
                            <td>{student.idNumber}</td>
                            <td>{student.email}</td>
                            <td>
                                {student.name.firstName} {student.name.middleName} {student.name.lastName}
                            </td>
                            <td>{student.section}</td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StudentTable;
