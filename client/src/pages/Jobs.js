import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    company: "",
    title: "",
    status: "applied",
    notes: ""
  });

  // Filter jobs
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const filteredJobs = jobs.filter((job) => {
    const matchStatus = filter ? job.status === filter : true;
    const matchSearch = 
      job.company.toLowerCase().includes(search.toLowerCase()) || 
      job.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch && matchStatus;
  });

  // Loader + Empty State
  const [loading, setLoading] = useState(true);

  // Edit jobs
  const [editingId, setEditingId] = useState(null);

  // Fetch jobs
  useEffect(() => {
    let isMounted = true;
    api.get("/jobs/")
      .then((res) => {
        if (isMounted) setJobs(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/jobs/${editingId}/`, form);
        setJobs(jobs.map((job) => (job.id === editingId ? res.data : job)));
        setEditingId(null);
      } else {
        const res = await api.post("/jobs/", form);
        setJobs([...jobs, res.data]);
      }
      setForm({ company: "", title: "", status: "applied", notes: "" });
    } catch (err) {
      console.error("Error submitting job:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleEdit = (job) => {
    setForm({
      company: job.company,
      title: job.title,
      status: job.status,
      notes: job.notes || "",
    });
    setEditingId(job.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}/`);
      setJobs(jobs.filter((job) => job.id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Job Tracker</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />
        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? "Update Job" : "Add Job"}</button>
        {editingId && (
          <button 
            type="button" 
            onClick={() => {
              setEditingId(null);
              setForm({ company: "", title: "", status: "applied", notes: "" });
            }}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Filtered Search */}
      <div style={{ marginBottom: "10px" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} >
          <option value="">All</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        <input 
          type="text" 
          placeholder="Search" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ marginLeft: "8px" }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Company</th>
              <th>Title</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {filteredJobs.length ? (
              filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.company}</td>
                  <td>{job.title}</td>
                  <td>{job.status}</td>
                  <td>{job.notes}</td>
                  <td>
                    <button onClick={() => handleEdit(job)}>Edit</button>
                    <button onClick={() => handleDelete(job.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Jobs;
