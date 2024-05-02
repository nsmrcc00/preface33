import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import Header from '../header/Header'
import Container from 'react-bootstrap/Container';

const AdminHome = () => {
    const { currentUser } = useAuth()
    
    return (
        <>
            <Header/>
            <main id='adminHome'>
                
                <section>
                    <Container >
                    <h2>
                    Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.    
                    </h2>

                    <div id="student-account-div">
                    
                           
                    </div>

                    <div id="student-account-div">
                        <h2>TEST</h2>
                    </div>
                    </Container>                    
                </section>
            </main>            
        </>
    )
}

export default AdminHome