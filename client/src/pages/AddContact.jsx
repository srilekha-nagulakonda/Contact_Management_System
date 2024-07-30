import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddContact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhoneNo] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = { name, email, phone };

    if (name && email && phone) {
      const token = localStorage.getItem("token");
      try {
        await axios.post("http://localhost:7070/add", dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName("");
        setEmail("");
        setPhoneNo("");
        toast.success("Contact added successfully");
        setTimeout(() => navigate("/home"), 1000);
      } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred");
      }
    } else {
      toast.error("Please fill all fields");
    }
  };

  return (
    <div className="addcontact-container">
      <ToastContainer />
      <h1 className="addcontact-heading">Add a contact below</h1>
      <form onSubmit={handleSubmit} className="addcontact-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Name here"
          className="addcontact-input"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email here"
          className="addcontact-input"
          required
        />
        <input
          value={phone}
          onChange={(e) => setPhoneNo(e.target.value)}
          type="text"
          placeholder="Contact here"
          className="addcontact-input"
          required
        />
        <button type="submit" className="addcontact-button">
          Save
        </button>
      </form>
      <Link to="/home" className="addcontact-link">
        <p>Go back</p>
      </Link>
    </div>
  );
};

export default AddContact;
