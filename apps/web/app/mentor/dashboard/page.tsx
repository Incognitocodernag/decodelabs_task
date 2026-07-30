"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Users, FileText, CheckCircle2, AlertCircle, FileDigit } from "lucide-react";

export default function MentorDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/submissions")
      .then(res => res.json())
      .then(setSubmissions)
      .catch(console.error);
  }, []);

  const handleGrade = async (id: string, grade: number) => {
    try {
      const res = await fetch(`http://localhost:4000/api/submissions/${id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: "GRADED", grade } : s));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="MENTOR">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        
        <motion.div variants={item} className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mentor Overview</h2>
            <p className="text-slate-500 font-medium mt-1">Review assignments and track your students.</p>
          </div>
        </motion.div>

        {/* Submissions Grading Panel */}
        <motion.div variants={item} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <FileDigit className="w-5 h-5 mr-2 text-indigo-500" />
                Pending Submissions
              </h3>
              <p className="text-sm text-slate-500 font-medium">Grade the recent uploads from your assigned interns.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignment</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">File</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action (Grade 0-100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {sub.student?.firstName} {sub.student?.lastName}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium text-sm">
                      {sub.assignment?.title || "Unknown Assignment"}
                    </td>
                    <td className="py-4 px-4">
                      <a href={`http://localhost:4000${sub.fileUrl}`} target="_blank" className="text-indigo-600 font-semibold text-sm hover:underline flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> View Document
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      {sub.status === "PENDING" ? (
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100/50">
                          Pending Review
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100/50">
                          Graded: {sub.grade}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right flex justify-end items-center gap-2">
                      {sub.status === "PENDING" ? (
                        <>
                          <button onClick={() => handleGrade(sub.id, 100)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                            A (100)
                          </button>
                          <button onClick={() => handleGrade(sub.id, 80)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                            B (80)
                          </button>
                          <button onClick={() => handleGrade(sub.id, 60)} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                            C (60)
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 font-medium text-sm flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                      No submissions found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}