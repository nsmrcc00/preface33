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
                    <container >
                    <h2>
                    Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.    
                    </h2>

                    <section id="acc-list">
                        <p>a</p>
                           
                    </section>

                    <section id="subj-list">
                        <h2>TEST</h2>
                    </section>
                    </container>
                    
                </section>
            </main>            
        </>
    )
}

export default AdminHome