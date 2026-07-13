import { useEffect, useState } from "react";

function App() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    salary: "",
  });

  const API_URL = "https://ems-backend-1-u33p.onrender.com/employees";

  useEffect(() => {
    getEmployees();
  }, []);

  const getEmployees = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setError("Unable to load employees. Please check the backend API.");
    }
  };

  const averageSalary =
    employees.length === 0
      ? "₹0"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(
          employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length
        );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "salary" ? parseInt(value) || 0 : value,
    });
  };

  const addEmployee = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      setFormData({ name: "", department: "", salary: "" });
      getEmployees();
    } catch (err) {
      console.error("Failed to add employee:", err);
      setError("Unable to add employee. Please try again.");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      getEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      setError("Unable to delete employee. Please try again.");
    }
  };

  const updateEmployee = async (e, id) => {
    e.preventDefault();

    try {
      setError(null);
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      setFormData({ name: "", department: "", salary: "" });
      setEditingId(null);
      getEmployees();
    } catch (err) {
      console.error("Failed to update employee:", err);
      setError("Unable to update employee. Please try again.");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      filterDepartment === "" || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map((emp) => emp.department))];

  return (
    <div className="container">
      {error && <div className="error-banner">{error}</div>}
      <h1>Employee Management System</h1>
      <p className="subtitle">
        Manage employee records, add new team members, and keep your data organized.
      </p>

      <div className="stats">
        <div className="stat">Total Employees: {employees.length}</div>
        <div className="stat">Average Salary: {averageSalary}</div>
        <div className="stat">Departments: {new Set(employees.map((e) => e.department)).size}</div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("add");
            setEditingId(null);
            setFormData({ name: "", department: "", salary: "" });
          }}
        >
          Add Employee
        </button>
        <button
          className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Search
        </button>
        <button
          className={`tab-btn ${activeTab === "filter" ? "active" : ""}`}
          onClick={() => setActiveTab("filter")}
        >
          Filter
        </button>
        <button
          className={`tab-btn ${activeTab === "edit" ? "active" : ""}`}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </button>
      </div>

      {activeTab === "add" && (
        <form onSubmit={addEmployee} className="form">
          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Employee</button>
        </form>
      )}

      {activeTab === "search" && (
        <div className="tab-content">
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {filteredEmployees.length === 0 && searchQuery ? (
            <div className="empty-state">No employees found matching your search.</div>
          ) : (
            <div className="employee-grid">
              {filteredEmployees.map((employee) => (
                <div key={employee._id} className="card">
                  <h3>{employee.name}</h3>
                  <p>Department: {employee.department}</p>
                  <p>
                    Salary: {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(employee.salary)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "filter" && (
        <div className="tab-content">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {filteredEmployees.length === 0 && filterDepartment ? (
            <div className="empty-state">No employees in this department.</div>
          ) : (
            <div className="employee-grid">
              {filteredEmployees.map((employee) => (
                <div key={employee._id} className="card">
                  <h3>{employee.name}</h3>
                  <p>Department: {employee.department}</p>
                  <p>
                    Salary: {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(employee.salary)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="tab-content">
          {editingId ? (
            <form onSubmit={(e) => updateEmployee(e, editingId)} className="form">
              <input
                type="text"
                name="name"
                placeholder="Employee Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
              <button type="submit">Update Employee</button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", department: "", salary: "" });
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="employee-grid">
              {employees.length === 0 ? (
                <div className="empty-state">No employees found. Add one to get started!</div>
              ) : (
                employees.map((employee) => (
                  <div key={employee._id} className="card">
                    <h3>{employee.name}</h3>
                    <p>Department: {employee.department}</p>
                    <p>
                      Salary: {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(employee.salary)}
                    </p>
                    <div className="button-group">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingId(employee._id);
                          setFormData({
                            name: employee.name,
                            department: employee.department,
                            salary: employee.salary,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteEmployee(employee._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "add" && employees.length === 0 && (
        <div className="empty-state">
          No employees found yet. Add a team member using the form above.
        </div>
      )}
    </div>
  );
}

export default App;
