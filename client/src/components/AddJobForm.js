import React, { useRef, useState, useEffect } from "react";
import api from "../utils/axios";

const AddJobForm = ({ editingJob, onJobAdded, onJobUpdated }) => {
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    status: "applied",
    notes: "",
    resume: null,
  });

  const fileInputRef = useRef();

  // Prefill data when editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        company: editingJob.company || "",
        title: editingJob.title || "",
        status: editingJob.status || "applied",
        notes: editingJob.notes || "",
        resume: null, // don’t prefill file
      });
    } else {
      setFormData({
        company: "",
        title: "",
        status: "applied",
        notes: "",
        resume: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  }, [editingJob]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        uploadData.append(key, formData[key]);
      }
    });

    try {
      let res;
      if (editingJob) {
        // Update existing job
        res = await api.put(`/jobs/${editingJob.id}/`, uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onJobUpdated(res.data);
      } else {
        // Add new job
        res = await api.post("/jobs/", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onJobAdded(res.data);
      }

      // Reset form + clear file input
      setFormData({
        company: "",
        title: "",
        status: "applied",
        notes: "",
        resume: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = null;

    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
        company: "",
        title: "",
        status: "applied",
        notes: "",
        resume: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
    onJobUpdated(null);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md mb-4">
      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="text"
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
      >
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>
      <input
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        ref={fileInputRef}
        type="file"
        name="resume"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      />
      <div className="flex gap-2">
        <button 
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {editingJob ? "Update Job" : "Add Job"}
        </button>
        {editingJob && (
          <button 
            type="button" 
            onClick={handleCancelEdit} 
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default AddJobForm;
