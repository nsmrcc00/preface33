import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useAuth } from '../../contexts/authContext'
import { Link, useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth'

function Header() {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    //temporarily uses navbar but it looks scuffed so might change to offcanvas in the future
    return (
        <>
            <Navbar id="heading">
                <Container>                    
                    <Navbar.Brand href="#home" style={{color: "white"}}>PreFace</Navbar.Brand>            
                    <Navbar.Collapse className="justify-content-end">               
                        <NavDropdown title={"Signed in as: " + (currentUser.displayName ? currentUser.displayName : currentUser.email)} drop="down-centered" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Navbar.Collapse>
                </Container>
            </Navbar>    

        </>
  )
}

export default Header
/**
 * 
 * 
 * 
            const { userLoggedIn } = useAuth()
            <div>
            {
                userLoggedIn
                ?
                <>
                    <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Logout</button>
                </>
                :
                <>
                    <Link to={'/login'}>Login</Link>
                </>
            }
            </div>
 */