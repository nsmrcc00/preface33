import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/authContext'
import Header from '../../header/Header'
import background from "/banner_1.jpg"


const AdminHome = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    //navigate to instructor account page
    const navi1 = () => {
        if (userLoggedIn == true) {
            navigate('/instructor-accounts');
        }
        else {
            doSignOut();
            navigate('/login');
        }
    };

    //navigate to student account page
    const navi2 = () => {
        if (userLoggedIn == true) {
            navigate('/student-accounts');
        }
        else {
            doSignOut();
            navigate('/login');
        }
    };

    return (
        <>
            <Header/>
            <main 
            id="adminHome"
            style={{ 
                backgroundImage: `url(${background})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'                         
            }}
            >
                
                <section
                id='adminHome-sec'
                
                >
                    <div id="instructor-acc-div"className="admin-dash-div" onClick={navi1}>
                        <h2>Instructor Accounts</h2>                           
                    </div>

                    <div id="student-acc-div" className="admin-dash-div">
                        <h2>Students Accounts</h2>
                    </div>

                    
                                      
                </section>
            </main>            
        </>
    )
}

export default AdminHome