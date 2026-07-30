"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Download, CheckCircle2, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Grading state tracking: Map of submissionId -> grade input string
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [submittingGrade, setSubmittingGrade] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/submissions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissions(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch submissions", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (id: string, value: string) => {
    setGrades(prev => ({ ...prev, [id]: value }));
  };

  const submitGrade = async (id: string) => {
    const gradeVal = parseInt(grades[id], 10);
    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 100) {
      alert("Please enter a valid grade between 0 and 100");
      return;
    }

    setSubmittingGrade(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/submissions/${id}/grade`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ grade: gradeVal })
      });
      
      if (res.ok) {
        const updatedSubmission = await res.json();
        setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, grade: updatedSubmission.grade, status: updatedSubmission.status } : sub));
      } else {
        alert("Failed to save grade.");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving grade.");
    } finally {
      setSubmittingGrade(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const searchString = `${sub.student.firstName} ${sub.student.lastName} ${sub.assignment.title}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="ADMIN">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        
        {/* Header Section */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Intern Submissions</h2>
            <p className="text-slate-500 font-medium mt-1">Review student work and assign grades.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students or assignments..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 shadow-sm font-medium"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 shadow-sm transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Submissions Table */}
        <motion.div variants={item} className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium text-sm">Loading submissions...</td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium text-sm">No submissions found.</td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm mr-3">
                            {sub.student.firstName.charAt(0)}{sub.student.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{sub.student.firstName} {sub.student.lastName}</div>
                            <div className="text-xs text-slate-500">{sub.student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 text-sm">{sub.assignment.title}</div>
                        <div className="text-xs text-slate-500">Due: {new Date(sub.assignment.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-600">{new Date(sub.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {sub.status === "GRADED" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Graded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`http://localhost:4000${sub.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Download
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {sub.status === "GRADED" ? (
                          <div className="text-lg font-bold text-slate-900">
                            {sub.grade}<span className="text-sm text-slate-400 font-medium">/100</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <input 
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={grades[sub.id] || ""}
                              onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                              className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                            />
                            <button
                              onClick={() => submitGrade(sub.id)}
                              disabled={submittingGrade === sub.id || !grades[sub.id]}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                              {submittingGrade === sub.id ? "Saving..." : "Grade"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}