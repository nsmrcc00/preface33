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
import { collection, getDocs, doc, query, where, updateDoc } from "firebase/firestore";

function InstructorHeader() {
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [unloading, setUnloading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

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

  
  const fetchNotifs = async () => {
    try {
      if (currentUser) {
        const userDoc1 = doc(db, "Users", currentUser.uid);
        const notifCollection = collection(userDoc1, "Notifications");
        const notifQuery = query(notifCollection, where("visible", "==", true));
        const notifSnapshot = await getDocs(notifQuery);
        const notifList = notifSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            title: doc.data().title || "", // Handle missing title
            message: doc.data().message || "", // Handle missing message
          };
        });
        console.log("Notifications fetched:", notifList);
        setNotifs(notifList);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [currentUser]); // Fetch on currentUser change

  const handleRefreshNotifications = async () => {
    await fetchNotifs(); // Call the fetch function to refresh
  };

  const handleCloseNotification = async (notifId) => {
    try {
      const notificationRef = doc(db, "Users", currentUser.uid, "Notifications", notifId);
      await updateDoc(notificationRef, { visible: false }); // Update "visible" to false
      const updatedNotifs = notifs.filter((notif) => notif.id !== notifId); // Filter out closed notification
      setNotifs(updatedNotifs);
    } catch (error) {
      console.error("Error hiding notification:", error);
    }
  };

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
              <Navbar.Brand onClick={handleShow2} style={{ cursor: "pointer" }}>
                <img src="/notification-bell.svg" width="30" height="30" alt="Notifications" />
              </Navbar.Brand>
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

      <Offcanvas className="header-off-canvas" show={show} onHide={handleClose} >
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

      <Offcanvas className="header-off-canvas" show={show2} onHide={handleClose2} placement="end">
        <Offcanvas.Header closeButton>
          <h4><b>Notifications</b></h4>
        </Offcanvas.Header>
        <Offcanvas.Body>
        <Stack gap={3} className="col-md mx-auto">
          <button onClick={handleRefreshNotifications}>
            Refresh
          </button>
          {notifs.length === 0 ? ( // Check if notifs array is empty
            <div className="notification-blank">
              <p>No notifications found.</p>
            </div>
            
          ) : (
            <ListGroup>
              {notifs.map((notif) => {
                return (
                  <ListGroup.Item key={notif.id} action>
                    <div>
                      <h5>{notif.title}</h5>
                      <p>{notif.message}</p>
                    </div>
                    <img
                      src="/close.svg"
                      width="18"
                      height="18"
                      alt="Close"
                      onClick={() => handleCloseNotification(notif.id)}
                    />
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Stack>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default InstructorHeader;
