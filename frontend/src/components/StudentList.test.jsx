import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StudentList from "./StudentList.jsx";
import api from "../services/api.js";

// Mock the api module
vi.mock("../services/api.js");

describe("StudentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStudents = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      course: "Computer Science",
      enrolment_date: "2024-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "0987654321",
      course: "Information Technology",
      enrolment_date: "2024-01-15T00:00:00.000Z",
    },
  ];

  const renderList = () => {
    return render(
      <BrowserRouter>
        <StudentList />
      </BrowserRouter>
    );
  };

  it("should render loading state initially", () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderList();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should fetch and display students", async () => {
    api.get.mockResolvedValue({
      data: {
        students: mockStudents,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
  });

  it("should show error message when API call fails", async () => {
    api.get.mockRejectedValue(new Error("Network error"));
    renderList();

    await waitFor(() => {
      expect(screen.getByText(/failed to load students/i)).toBeInTheDocument();
    });
  });

  it("should handle search functionality", async () => {
    api.get.mockResolvedValue({
      data: {
        students: [mockStudents[0]],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search students/i);
    fireEvent.change(searchInput, { target: { value: "John" } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(api.get).toHaveBeenCalledWith("/students", {
          params: { search: "John", page: 1, limit: 10 },
        });
      },
      { timeout: 3000 }
    );
  });

  it("should handle pagination", async () => {
    api.get.mockResolvedValue({
      data: {
        students: mockStudents,
        pagination: {
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
        },
      },
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find and click the next page button
    const nextPageButton = screen.getByRole("button", { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/students", {
        params: { search: "", page: 2, limit: 10 },
      });
    });
  });

  it("should change rows per page", async () => {
    api.get.mockResolvedValue({
      data: {
        students: mockStudents,
        pagination: {
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
        },
      },
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Change rows per page
    const rowsPerPageSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(rowsPerPageSelect);

    await waitFor(() => {
      const option25 = screen.getByRole("option", { name: "25" });
      fireEvent.click(option25);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/students", {
        params: { search: "", page: 1, limit: 25 },
      });
    });
  });

  it("should open delete dialog when delete button is clicked", async () => {
    api.get.mockResolvedValue({
      data: {
        students: mockStudents,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  it("should delete student when confirmed", async () => {
    api.get.mockResolvedValue({
      data: {
        students: mockStudents,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    });
    api.delete.mockResolvedValue({ status: 204 });

    renderList();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/students/1");
    });
  });

  it("should display empty state when no students", async () => {
    api.get.mockResolvedValue({
      data: {
        students: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      },
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText(/no students found/i)).toBeInTheDocument();
    });
  });
});
