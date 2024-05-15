import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Header from '../../header/Header'; 
import background from "/banner_1.jpg"; 
import AddSubject from '../add-subject/addSubject'

const InsAccount = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instructorData, setInstructorData] = useState([
    { email: '202110487@feualabang.edu.ph', name: 'Mark Francis Alfelor', studentNo: '202110487', section: 'aw31' },{ email: '202110488@feualabang.edu.ph', name: 'Nesmarc Manahan', studentNo: '202110488', section: 'aw31' },{ email: '2022104898@feualabang.edu.ph', name: 'Ethan Ferreira', studentNo: '202110489', section: 'aw31' },{ email: '202110490@feualabang.edu.ph', name: 'Ryan Dela Rosa', studentNo: '202110490', section: 'aw31' }
    
  ]);

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
                        <th>Email</th>
                        <th>Name</th>
                        <th>Student Number</th>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.email}</td>
                          <td>{item.name}</td>
                          <td>{item.studentNo}</td>
                          <td>{item.section}</td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
            </section>
          </Tab>
          <Tab eventKey="addSubs" title="Subjects">
            <AddSubject />  
          </Tab>
        </Tabs>
        
      </main>
      
    </>
  );
};

export default InsAccount
