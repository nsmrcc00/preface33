import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import Header from '../header/Header'
import Container from 'react-bootstrap/Container';
import background from "/banner_1.jpg"
import { Image } from 'react-bootstrap';

const AdminHome = () => {
    const { currentUser } = useAuth()
    
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

                    

                    <div id="instructor-acc-div"className="admin-dash-div">
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