import React from 'react'

const AddToClassList = () => {
  
  
    return (
    <>
        <div>
            <h2>Subjects</h2>
            <input
                type="text"
                placeholder="Search Students..."            
                style={{
                  margin: '0px 0px 10px'
                }}
            />
            <table className='striped-table'>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Subject Code</th>
                        <th>Instructor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Placeholder</td>
                        <td>Placeholder</td>
                        <td>Placeholder</td>
                    </tr>
                    <tr>
                        <td>Placeholder</td>
                        <td>Placeholder</td>
                        <td>Placeholder</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </>
  )
}

export default AddToClassList
