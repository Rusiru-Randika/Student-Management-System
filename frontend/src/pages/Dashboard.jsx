import React from "react";
import StudentList from "../components/StudentList";
import { Container, Typography, Button, Box, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Student Management Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              component={Link}
              to="/students/add"
              variant="contained"
              color="primary"
            >
              Add Student
            </Button>
            <Button onClick={logout} variant="outlined" color="secondary">
              Logout
            </Button>
          </Stack>
        </Stack>
      </Box>
      <StudentList />
    </Container>
  );
};

export default Dashboard;
