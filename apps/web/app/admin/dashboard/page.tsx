"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Briefcase, Clock, Activity, ChevronRight, MoreHorizontal, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // Assignment Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };

    fetch("http://localhost:4000/api/dashboard/admin", { headers })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
      
    fetch("http://localhost:4000/api/users/students", { headers })
      .then(res => res.json())
      .then(setStudents)
      .catch(console.error);
  }, []);

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/assignments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title, 
          description, 
          dueDate, 
          assignedToId: assignedToId === "all" ? null : assignedToId 
        })
      });
      if (res.ok) {
        alert("Project assigned successfully!");
        setTitle("");
        setDescription("");
        setDueDate("");
        setAssignedToId("");
      } else {
        alert("Failed to assign project");
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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="ADMIN">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Corporate Command Center</h2>
            <p className="text-slate-500 font-medium mt-1">High-level telemetry across all active interns and groups.</p>
          </div>
          <button className="hidden sm:flex items-center text-sm font-semibold text-white bg-slate-900 px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
            Generate Executive Report
          </button>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">Total Students</div>
            <div className="text-3xl font-bold text-slate-900">{data?.stats?.totalStudents || 0}</div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">Total Assignments</div>
            <div className="text-3xl font-bold text-slate-900">{data?.stats?.totalAssignments || 0}</div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">Requires Review</span>
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">Pending Grading</div>
            <div className="text-3xl font-bold text-slate-900">{data?.stats?.pendingGrading || 0}</div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-1 rounded-full">Stable</span>
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">Avg Attendance</div>
            <div className="text-3xl font-bold text-slate-900">{data?.stats?.avgAttendance || 0}%</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Table Area */}
          <motion.div variants={item} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Registrations</h3>
                <p className="text-sm text-slate-500 font-medium">Manage the newest users on the platform.</p>
              </div>
              <button className="flex items-center text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors">
                View All Students <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.recentRegistrations?.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 shadow-sm">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium text-sm">{student.email}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {!data?.recentRegistrations?.length && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                        No recent registrations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Assign Project Form */}
          <motion.div variants={item} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Direct Assignment</h3>
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <form onSubmit={handleAssignProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Q3 Architecture Review"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Detail the project requirements..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assign To Student</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="" disabled>Select a student</option>
                  <option value="all">Global (All Students)</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                <input 
                  type="datetime-local" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
                Deploy Assignment
              </button>
            </form>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}