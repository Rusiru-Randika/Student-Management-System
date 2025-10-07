import React from "react";
import StudentForm from "../components/StudentForm";
import { Container, Typography } from "@mui/material";

const AddStudent = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ my: 4 }}>
        Add New Student
      </Typography>
      <StudentForm />
    </Container>
  );
};

export default AddStudent;
