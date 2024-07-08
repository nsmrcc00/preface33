import { useState } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Header from '../../header/Header'
import background from "/banner_1.jpg"; 
import Register from './Register2';
import StudentTable from './StudentTable';
import AddSection from '../add-section/addSection';
import AddToClassList from '../add-to-class/AddToClassList';

const StudentAccount = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <>
        <Header />        
        <main
          id='studentCrudPage'
          style={{
            backgroundImage: `url(${background})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        >
          <Tabs
          defaultActiveKey="studentTable"
          className="mb-3"
          justify
          >
            <Tab eventKey="studentTable" title="Students">
              <section id='schoolStudentPage'>
                <StudentTable setSelectedAccount={setSelectedAccount} />
                <Register selectedAccount={selectedAccount} />
              </section>
            </Tab>
            <Tab eventKey="sectionTable" title="Sections">
              <section id='schoolSectionPage'>
                <AddSection/>
              </section>
            </Tab>
            {/*
              <Tab eventKey="subjectTable" title="Subjects">
                <section id='schoolSectionPage'>
                  <AddToClassList/>
                </section>
              </Tab>          
            */}
          </Tabs>
        </main>
    </>

  )
}

export default StudentAccount
