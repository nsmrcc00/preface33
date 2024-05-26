import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Header from '../../header/Header'; 
import background from "/banner_1.jpg";
import AddSubject from '../add-subject/addSubject';
import Register from './Register1';
import InsAccTable from './InstructorTable';

const InsAccount = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);

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
            <InsAccTable setSelectedInstructor={setSelectedInstructor} />
            <Register selectedInstructor={selectedInstructor} />
          </Tab>
          <Tab eventKey="addSubs" title="Subjects">
            <AddSubject />  
          </Tab>
        </Tabs>
        
      </main>
    </>
  );
};

export default InsAccount;


