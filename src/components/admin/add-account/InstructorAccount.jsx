import React, { useState } from 'react';
import Header from '../../header/Header'; 
import background from "/banner_1.jpg"; 

const InsAccount = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instructorData, setInstructorData] = useState([
    { email: '202110487@feualabang.edu.ph', name: 'Mark Francis Alfelor', studentNo: '202110487', section: 'aw31' },
    { email: '202110488@feualabang.edu.ph', name: 'Nesmarc Manahan', studentNo: '202110488', section: 'aw31' },
    { email: '2022104898@feualabang.edu.ph', name: 'Ethan Ferreira', studentNo: '202110489', section: 'aw31' },
    { email: '202110490@feualabang.edu.ph', name: 'Ryan Dela Rosa', studentNo: '202110490', section: 'aw31' }
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
          padding: '20px'  
        }}
      >
        <section id="adminHome-sec" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '800px', height: '200px', backgroundColor: '#AD1212', position: 'relative', borderRadius: '20px', marginBottom: '20px' }}>
            <div style={{ height: '75px', backgroundColor: 'white', position: 'absolute', bottom: '0', left: '0', right: '0', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <p style={{ textAlign: 'center', lineHeight: '75px', margin: '0' }}>INSTRUCTOR ACCOUNTS</p>
            </div>
          </div>
          <div style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                style={{ padding: '5px', width: '100%', maxWidth: '200px', borderRadius: '10px', border: '1px solid #ccc' }}
              />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    <tr key={index}>
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
      </main>
    </>
  );
};

export default InsAccount;
