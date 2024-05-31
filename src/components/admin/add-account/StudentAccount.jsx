import React from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Header from '../../header/Header'
import background from "/banner_1.jpg"; 
import Register from './Register2';
import StudentTable from './StudentTable';

const StudentAccount = () => {

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
          fill
          >
            <Tab className='studentCrudContent' eventKey="studentTable" title="Students">
              <section >
                <StudentTable/>
                <Register/>
              </section>
            </Tab>
            <Tab className='studentCrudContent' eventKey="subjectTable" title="Subjects">
              <section className='studentCrudContent'>
                <h1>Subjects</h1>
              </section>
            </Tab>
          </Tabs>
        </main>
    </>

  )
}

export default StudentAccount
