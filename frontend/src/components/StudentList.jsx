import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  Snackbar,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link } from "react-router-dom";
import api from "../services/api";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get("/students", {
        params: { search, page: page + 1, limit: rowsPerPage },
      });
      setStudents(response.data.students);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, page, rowsPerPage]);

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        await api.delete(`/students/${studentToDelete.id}`);
        setSuccessMessage(`${studentToDelete.name} has been successfully deactivated.`);
        setOpenSuccessSnackbar(true);
        fetchStudents(); // Refresh list
      } catch (err) {
        setError("Failed to delete student.");
      } finally {
        setOpenDeleteDialog(false);
        setStudentToDelete(null);
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid #e5eaf2' }}>
      <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>Students</Typography>
        <TextField
          placeholder="Search students..."
          value={search}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {loading && <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>}
      {error && <Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>
                  <Chip
                    label={student.is_active ? "Active" : "Deactivated"}
                    size="small"
                    color={student.is_active ? "success" : "default"}
                    variant={student.is_active ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>
                  <IconButton component={Link} to={`/students/edit/${student.id}`} color="primary" size="small" aria-label="Edit">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(student)} color="error" size="small" aria-label="Delete">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate {studentToDelete?.name}? This will mark the student as inactive and they will no longer appear in the active students list. This action can be reversed by editing the student.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Notification Snackbar */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSuccessSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default StudentList;
