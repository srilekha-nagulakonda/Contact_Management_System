import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  const getAllData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:7070/getall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const deleteContact = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`http://localhost:7070/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Successfully deleted contact");
        getAllData();
      } catch (error) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <div className="container">
      <div className="header">
        <Link to="/add">
          <button className="addItem">Add Contact</button>
        </Link>
        <button className="logoutButton" onClick={logoutHandler}>
          Logout
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>S/N</th>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>PHONE NUMBER</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr key={contact.id}>
              <td>{index + 1}</td>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>{contact.phone}</td>
              <td>
                <Link to={`/update/${contact.id}`}>
                  <button className="editButton">Edit</button>
                </Link>
                <button
                  className="deleteButton"
                  onClick={() => deleteContact(contact.id)}
                >
                  Delete
                </button>
                <Link to={`/view/${contact.id}`}>
                  <button className="viewButton">View</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
