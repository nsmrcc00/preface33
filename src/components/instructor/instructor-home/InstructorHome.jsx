import React from 'react'
import InstructorHeader from '../../header/InstructorHeader'
import background from "/banner_1.jpg"

const InstructorHome = () => {
  return (
    <>
    <header>
      <InstructorHeader/>
    </header>
    <main
      id="instructorHome"
      style={{ 
          backgroundImage: `url(${background})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',                         
      }}>
      <section id='adminHome-sec'>
          <div id="instructor-acc-div"className="subject-dash-div">
              <h2>Subject 1</h2>                           
          </div>

          <div id="student-acc-div" className="subject-dash-div">
              <h2>Subject 2</h2>
          </div>

          <div id="student-acc-div" className="subject-dash-div">
              <h2>Subject 3</h2>
          </div>

          <div id="student-acc-div" className="subject-dash-div">
              <h2>Subject 4</h2>
          </div>       
                            
      </section>
    </main>
    
    </>    
  )
}

export default InstructorHome