import React, { useState } from 'react';
import Modal from 'react-modal';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Header from '../../header/Header'; 
import background from "/banner_1.jpg";
import AddSubject from '../add-subject/addSubject';
import Register from './Register1';

Modal.setAppElement('#root');

const InsAccount = () => {
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
      <Header />
      <main
        id="instructorHome"
        style={{
          backgroundImage: `url(${background})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          padding: '20px'  
        }}
      >
        <Tabs
          defaultActiveKey="instructorTable"
          className="mb-3"
          fill
        >
          <Tab eventKey="instructorTable" title="Instructors">
            <section id='instructorsTable'>
              
              <div 
                style={{ 
                  marginTop: '20px', 
                  padding: '20px', 
                  backgroundColor: 'white', 
                  borderRadius: '20px' , 
                  width: '65%'}}>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery} 
                  onChange={handleSearch} 
                  style={{ marginBottom: '20px', 
                  float: 'right', 
                  marginRight: '20px' }} />
                <table 
                  style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Student Number</th>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Section</th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <tr key={index} onClick={() => openModal(item)}>
                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.email}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.name}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.studentNo}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.section}</td>
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
            <Register/>
          </Tab>
          <Tab eventKey="addSubs" title="Subjects">
            <AddSubject />  
          </Tab>
        </Tabs>
        
      </main>
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

export default InsAccount;


