import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StudentForm from "./StudentForm.jsx";
import api from "../services/api.js";

// Mock the api module
vi.mock("../services/api.js");

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("StudentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (student = null) => {
    return render(
      <BrowserRouter>
        <StudentForm student={student} />
      </BrowserRouter>
    );
  };

  describe("Creating a new student", () => {
    it("should render empty form for new student", () => {
      renderForm();

      expect(screen.getByLabelText(/name/i)).toHaveValue("");
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("");
      expect(screen.getByLabelText(/course/i)).toHaveValue("");
      expect(
        screen.getByRole("button", { name: /add student/i })
      ).toBeInTheDocument();
    });

    it("should handle input changes", () => {
      renderForm();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });

      expect(nameInput).toHaveValue("John Doe");
      expect(emailInput).toHaveValue("john@example.com");
    });

    it("should show error when name is empty", async () => {
      renderForm();

      const submitButton = screen.getByRole("button", { name: /add student/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it("should show error when email is empty", async () => {
      renderForm();

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      const submitButton = screen.getByRole("button", { name: /add student/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("should successfully create a student", async () => {
      api.post.mockResolvedValue({ data: { id: 1 } });
      renderForm();

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/course/i), {
        target: { value: "Computer Science" },
      });

      const submitButton = screen.getByRole("button", { name: /add student/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/students", {
          name: "John Doe",
          email: "john@example.com",
          phone: "1234567890",
          course: "Computer Science",
          enrolment_date: "",
        });
        expect(
          screen.getByText(/student added successfully/i)
        ).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        },
        { timeout: 2000 }
      );
    });

    it("should show error when API call fails", async () => {
      api.post.mockRejectedValue(new Error("API Error"));
      renderForm();

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@example.com" },
      });

      const submitButton = screen.getByRole("button", { name: /add student/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save student/i)).toBeInTheDocument();
      });
    });
  });

  describe("Editing an existing student", () => {
    const existingStudent = {
      id: 1,
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "9876543210",
      course: "Information Technology",
      enrolment_date: "2024-01-15T00:00:00.000Z",
    };

    it("should render form with existing student data", () => {
      renderForm(existingStudent);

      expect(screen.getByLabelText(/name/i)).toHaveValue("Jane Doe");
      expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("9876543210");
      expect(screen.getByLabelText(/course/i)).toHaveValue(
        "Information Technology"
      );
      expect(
        screen.getByRole("button", { name: /update student/i })
      ).toBeInTheDocument();
    });

    it("should successfully update a student", async () => {
      api.put.mockResolvedValue({ data: { message: "Success" } });
      renderForm(existingStudent);

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Jane Smith" },
      });

      const submitButton = screen.getByRole("button", {
        name: /update student/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith("/students/1", {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "9876543210",
          course: "Information Technology",
          enrolment_date: "2024-01-15",
        });
        expect(
          screen.getByText(/student updated successfully/i)
        ).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        },
        { timeout: 2000 }
      );
    });
  });
});
