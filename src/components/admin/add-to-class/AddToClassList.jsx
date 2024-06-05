import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const AddToClassList = () => {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const q = query(collection(db, 'Subjects'), where('archived', '==', false));
      const querySnapshot = await getDocs(q);
      const subjectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        subjectCode: doc.data().subjectCode,
        title: doc.data().title,
        instructorName: doc.data().instructor.name
      }));
      setSubjects(subjectsList);
    };

    fetchSubjects();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredSubjects = subjects.filter(subject =>
    (subject.subjectCode && subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.title && subject.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.instructorName && subject.instructorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = (subject) => {
    setSelectedSubject(subject);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedSubject(null);
  };

  return (
    <>
      <div>
        <h2>Subjects</h2>
        <input
          type="text"
          placeholder="Search Subjects..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            margin: '0px 0px 10px'
          }}
        />
        <table className='striped-table'>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject</th>
              <th>Instructor</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map(subject => (
              <tr key={subject.id} onClick={() => openModal(subject)}>
                <td>{subject.subjectCode}</td>
                <td>{subject.title}</td>
                <td>{subject.instructorName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Subject Details"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '80%',
            minWidth: '420px',
            width: '100%',
            overflowX: 'auto'
          }
        }}
      >
        {selectedSubject && (
          <div>
            <h2>{selectedSubject.title}</h2>
            <p><strong>Subject Code:</strong> {selectedSubject.subjectCode}</p>
            <p><strong>Instructor:</strong> {selectedSubject.instructorName}</p>
            {/* Add more subject details as needed */}
            <table className='striped-table'>
                <thead>
                    <tr>
                        <th>ID Number</th>
                        <th>Name</th>
                        <th>Section</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Placeholder</td>
                        <td>Placeholder</td>
                        <td>Placeholder</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={closeModal}>Close</button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default AddToClassList;
