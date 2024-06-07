import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const InsAccTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instructorData, setInstructorData] = useState([
    { email: '202110487@feualabang.edu.ph', name: 'Mark Francis Alfelor', studentNo: '202110487', section: 'aw31' },
    { email: '202110488@feualabang.edu.ph', name: 'Nesmarc Manahan', studentNo: '202110488', section: 'aw31' },
    { email: '2022104898@feualabang.edu.ph', name: 'Ethan Ferreira', studentNo: '202110489', section: 'aw31' },
    { email: '202110490@feualabang.edu.ph', name: 'Ryan Dela Rosa', studentNo: '202110490', section: 'aw31' },    
  ]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = instructorData.filter((item) => {
    return (
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <>
        <section id='instructorsTable'>            
            <div 
              style={{ 
                marginTop: '20px', 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '20px' , 
                width: '65%',
                overflowX: 'auto'}}>
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={handleSearch} 
                style={{ 
                  marginBottom: '20px', 
                  float: 'right', 
                  marginRight: '20px' }}/>
            <table 
                style={{ 
                width: '100%', 
                borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                  <th className='adminTableStyle'>Email</th>
                  <th className='adminTableStyle'>Name</th>
                  <th className='adminTableStyle'>Student Number</th>
                  <th className='adminTableStyle'>Section</th>
                  </tr>
                </thead>
                
                <tbody>
                  {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} onClick={() => openModal(item)}>
                    <td className='adminTableStyle'>{item.email}</td>
                    <td className='adminTableStyle'>{item.name}</td>
                    <td className='adminTableStyle'>{item.studentNo}</td>
                    <td className='adminTableStyle'>{item.section}</td>
                    </tr>
                  ))
                  ) : (
                  <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No results found</td>
                  </tr>
                  )}
                </tbody>
                
            </table>
            </div>
        </section>        

        {selectedStudent && (
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Student Information"
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
                    maxWidth: '500px',
                    width: '100%',
                }
                }}
            >
                <h2>Student Information</h2>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Student Number:</strong> {selectedStudent.studentNo}</p>
                <p><strong>Section:</strong> {selectedStudent.section}</p>
                <button onClick={closeModal} style={{ marginTop: '20px', padding: '10px', borderRadius: '5px', backgroundColor: '#AD1212', color: 'white', border: 'none' }}>Close</button>
            </Modal>
        )}
    </>
  );
};

export default InsAccTable;


