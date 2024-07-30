import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const View = () => {
  const { id } = useParams();
  const [contact, setContact] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:7070/getsingle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        setContact(result.data[0]);
        console.log(result.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "An error occurred");
        console.log("something is fishing");
      });
  }, [id]);

  return (
    <div className="view-container">
      <ToastContainer />
      <h1 className="view-back">
        <Link to={"/home"}>Go Home</Link>
      </h1>
      <div className="view-card">
        <p className="view-label">USER CONTACT DETAILS:</p>
        <div className="view-info">
          <strong className="view-label">NAME: </strong>
          <span className="view-value">{contact.name}</span>
          <br />
          <strong className="view-label">EMAIL: </strong>
          <span className="view-value">{contact.email}</span>
          <br />
          <strong className="view-label">PHONE NO: </strong>
          <span className="view-value">{contact.phone}</span>
          <br />
        </div>
      </div>
    </div>
  );
};

export default View;
