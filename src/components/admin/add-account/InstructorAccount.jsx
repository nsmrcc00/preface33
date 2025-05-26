import { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Header from '../../header/Header'; 
import background from "/banner_1.jpg";
import AddSubject from '../add-subject/addSubject';
import Register from './Register1';
import InsAccTable from './InstructorTable';

const InsAccount = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <>
      <Header />
      <main
        id="instructorCrudPage"
      >
            
            style={{ 
                backgroundImage: `url(${background})`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',                         
            }}            
           
        <Tabs
          defaultActiveKey="instructorTable"
          className="mb-3"
          justify
        >
          <Tab eventKey="instructorTable" title="Instructors">
            <section id='schoolInstructorPage'>
              <InsAccTable setSelectedAccount={setSelectedAccount} />
              <Register selectedAccount={selectedAccount} />
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

export default InsAccount;


