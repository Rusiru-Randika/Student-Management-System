import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Alert } from "@mui/material";
import api from "../services/api";

/**
 * StudentForm
 * - Creates or updates a student
 * - Performs minimal client-side validation
 */
const StudentForm = ({ student }) => {
  const [formData, setFormData] = useState({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    course: student?.course || "",
    enrolment_date: student?.enrolment_date
      ? student.enrolment_date.split("T")[0]
      : "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Minimal validation
    if (!formData.name.trim()) return setError("Name is required.");
    if (!formData.email.trim()) return setError("Email is required.");

    try {
      if (student) {
        await api.put(`/students/${student.id}`, formData);
        setSuccess("Student updated successfully!");
      } else {
        await api.post("/students", formData);
        setSuccess("Student added successfully!");
      }
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError("Failed to save student. Please check the data.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Student name' }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Student email address' }}
      />
      <TextField
        margin="normal"
        fullWidth
        id="phone"
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Student phone number' }}
      />
      <TextField
        margin="normal"
        fullWidth
        id="course"
        label="Course"
        name="course"
        value={formData.course}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Student course' }}
      />
      <TextField
        margin="normal"
        fullWidth
        id="enrolment_date"
        label="Enrolment Date"
        name="enrolment_date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.enrolment_date}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Student enrolment date' }}
      />
      <Box sx={{ mt: 3, mb: 2, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained">
          {student ? "Update Student" : "Add Student"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default StudentForm;
