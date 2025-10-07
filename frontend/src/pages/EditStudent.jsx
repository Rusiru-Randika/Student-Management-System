import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentForm from "../components/StudentForm";
import { Container, Typography, CircularProgress, Alert } from "@mui/material";
import api from "../services/api";

const EditStudent = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/students/${id}`);
        setStudent(response.data);
      } catch (err) {
        setError("Failed to fetch student data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ my: 4 }}>
        Edit Student
      </Typography>
      <StudentForm student={student} />
    </Container>
  );
};

export default EditStudent;
