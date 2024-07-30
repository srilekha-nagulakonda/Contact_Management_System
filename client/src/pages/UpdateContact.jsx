import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateContact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhoneNo] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getSingleContactRecord();
    }
  }, [id]);

  const getSingleContactRecord = async () => {
    const token = localStorage.getItem("token");

    try {
      const result = await axios.get(`http://localhost:7070/getsingle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contact = result.data[0];
      setName(contact.name);
      setEmail(contact.email);
      setPhoneNo(contact.phone);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = { name, email, phone };

    if (name && email && phone) {
      const token = localStorage.getItem("token");

      try {
        await axios.put(`http://localhost:7070/update/${id}`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Contact successfully updated");
        setTimeout(() => navigate("/home"), 1000);
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      toast.error("Please fill all fields");
    }
  };

  return (
    <div className="updatecontact-container">
      <ToastContainer />
      <h1 id="heading" className="updatecontact-heading">
        Update the contact below
      </h1>
      <form onSubmit={handleSubmit} className="updatecontact-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Name here"
          className="updatecontact-input"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email here"
          className="updatecontact-input"
          required
        />
        <input
          value={phone}
          onChange={(e) => setPhoneNo(e.target.value)}
          type="text"
          placeholder="Contact here"
          className="updatecontact-input"
          required
        />
        <button type="submit" className="updatecontact-button">
          Update
        </button>
      </form>
      <Link to="/home" className="updatecontact-link">
        <p>Go back</p>
      </Link>
    </div>
  );
};

export default UpdateContact;
