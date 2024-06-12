import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/auth";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Stack } from "react-bootstrap";
import ListGroup from "react-bootstrap/ListGroup";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc } from "firebase/firestore";

function InstructorHeader() {
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [unloading, setUnloading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navi1 = (subjectId) => {
    if (userLoggedIn === true) {
      navigate(`/subject/${subjectId}`);
      handleClose();
    } else {
      doSignOut();
      navigate("/login");
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      if (currentUser) {
        const cachedSubjects = localStorage.getItem("subjects");
        if (cachedSubjects) {
          setSubjects(JSON.parse(cachedSubjects));
        } else {
          try {
            const userDoc = doc(db, "Users", currentUser.uid);
            const subjectsCollection = collection(userDoc, "subjectsHandled");
            const subjectsSnapshot = await getDocs(subjectsCollection);
            const subjectsList = subjectsSnapshot.docs.map((doc) => {
              return {
                id: doc.id,
                title: doc.data().title,
                section: doc.data().section,
              };
            });
            localStorage.setItem("subjects", JSON.stringify(subjectsList));
            setSubjects(subjectsList);
          } catch (error) {
            console.error("Error fetching subjects:", error);
          }
        }
      }
    };

    fetchSubjects();
  }, [currentUser]);

  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (userLoggedIn) {
        setUnloading(true);
        await doSignOut();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !unloading) {
        window.addEventListener("beforeunload", handleBeforeUnload);
      } else {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userLoggedIn, unloading]);

  const handleLogout = () => {
    doSignOut()
      .then(() => {
        localStorage.removeItem("subjects"); // Clear cached subjects
        localStorage.removeItem("subjectDashDivs"); // Clear subject-dash-div cache
        navigate("/login");
      })
      .catch((error) => console.error(error));
  };

  const navi3 = () => {
    if (userLoggedIn === true) {
      navigate("/instructor-home", { state: {} }); // Ensure state is not null
    }
  };

  return (
    <>
      <header>
        <Navbar id="heading">
          <Container fluid>
            <Navbar.Brand onClick={handleShow} style={{ cursor: "pointer" }}>
              <img src="/hamburger.svg" alt="Menu" />
            </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Brand style={{ cursor: "pointer" }}>
                <img
                  src="/preface.png"
                  alt="PreFace"
                  width="135"
                  height="30"
                  onClick={navi3}
                />
              </Navbar.Brand>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      <Offcanvas className="header-off-canvas" show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <Stack gap={2} className="col-md mx-auto">
            Signed in as:{" "}
            {currentUser.displayName
              ? currentUser.displayName
              : currentUser.email}
            <ListGroup>
              <ListGroup.Item action onClick={navi3}>
                Home
              </ListGroup.Item>
              {subjects.map((subject) => {
                return (
                  <ListGroup.Item
                    key={subject.id}
                    action
                    onClick={() => navi1(subject.id)}
                  >
                    {subject.title} - {subject.section}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
            <button
              id="gen_btn"
              className="btn btn-primary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </Stack>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default InstructorHeader;
