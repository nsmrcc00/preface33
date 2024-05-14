import React, { useState } from 'react';
import Header from '../../header/Header'; 
import background from "/banner_1.jpg"; 
import AddSubject from '../add-subject/addSubject'

const InsAccount = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instructorData, setInstructorData] = useState([
    { email: '202110487@feualabang.edu.ph', name: 'MArk Francis Alfelor', studentNo: '202110487', section: 'aw31' },{ email: '202110488@feualabang.edu.ph', name: 'Nesmarc Manahan', studentNo: '202110488', section: 'aw31' },{ email: '2022104898@feualabang.edu.ph', name: 'Ethan Ferreira', studentNo: '202110489', section: 'aw31' },{ email: '202110490@feualabang.edu.ph', name: 'Ryan Dela Rosa', studentNo: '202110490', section: 'aw31' }
    
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
        id="adminHome"
        style={{
          backgroundImage: `url(${background})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <section id="adminHome-sec">
          <div style={{ width: '800px', height: '200px', backgroundColor: '#AD1212', position: 'relative', borderRadius: '20px' }}>
            <div style={{ height: '75px', backgroundColor: 'white', position: 'absolute', bottom: '0', left: '0', right: '0', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <p style={{ textAlign: 'center', lineHeight: '100px', margin: '0' }}>INSTRUCTOR ACCOUNTS </p>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '20px' }}>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch} style={{ marginBottom: '20px', float: 'right', marginRight: '20px' }} />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
      </main>
    </>
  );
};

export default InsAccount
