import InstructorHeader from "../../../header/InstructorHeader";

const StudentProfile = () => {
  return (
    <>
      <header>
        <InstructorHeader />
      </header>
      <main className="subject-home">
        <section className="subject-home-container">
          <div className="table-container">
            <h3>Student Name's Attendance</h3>
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
                  <td>a</td>
                  <td>a</td>
                  <td>a</td>
                </tr>
                <tr>
                  <td>a</td>
                  <td>a</td>
                  <td>a</td>
                </tr>
                <tr>
                  <td>a</td>
                  <td>a</td>
                  <td>a</td>
                </tr>
                <tr>
                  <td>a</td>
                  <td>a</td>
                  <td>a</td>
                </tr>
              </tbody>
            </table>
            <p>Total number of absences: </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default StudentProfile;
