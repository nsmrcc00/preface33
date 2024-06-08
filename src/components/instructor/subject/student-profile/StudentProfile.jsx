import InstructorHeader from "../../../header/InstructorHeader"


const StudentProfile = () => {
  return (
    <>
      <header>
        <InstructorHeader/>
      </header>
      <main>
      <div className="table-container">
        <p> Student Name's Attendance</p>
        <table className="striped-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <p>Total number of absences: </p>
      </div> 
      </main>      
    </>
  )
}

export default StudentProfile
