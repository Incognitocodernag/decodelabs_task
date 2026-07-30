"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Calendar, MessageSquare, TrendingUp, AlertCircle, Target, Award, Activity, BookOpen, ArrowUpRight } from "lucide-react";

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:4000/api/dashboard/student", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

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
    <DashboardLayout role="STUDENT">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Internship Overview Dashboard</h2>
            <p className="text-slate-500 font-medium mt-1">Track your progress and compliance metrics.</p>
          </div>
          <button className="hidden sm:flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
            View Analytics <ArrowUpRight className="ml-1.5 w-4 h-4" />
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{data?.progress !== undefined ? data.progress : 0}%</h3>
            <p className="text-sm font-medium text-slate-500">Program Completion</p>
          </motion.div>

          <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{data?.performanceScore || 'N/A'}</h3>
            <p className="text-sm font-medium text-slate-500">Performance Score (Avg)</p>
          </motion.div>

          <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{data?.attendanceRate !== undefined ? data.attendanceRate : 0}%</h3>
            <p className="text-sm font-medium text-slate-500">Attendance Rate</p>
          </motion.div>

          <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{data?.activeDeliverables || 0}</h3>
            <p className="text-sm font-medium text-slate-500">Active Deliverables</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <motion.div variants={item} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Submissions</h3>
            </div>
            <div className="space-y-4">
              {data?.recentSubmissions?.length > 0 ? (
                data.recentSubmissions.map((sub: any) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{sub.assignment?.title || "Unknown Assignment"}</h4>
                        <p className="text-sm text-slate-500 mt-1">Status: {sub.status}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border whitespace-nowrap ml-4 ${sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {sub.status === 'GRADED' ? `Grade: ${sub.grade}` : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <p>No recent submissions.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Assignments */}
          <motion.div variants={item} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                Upcoming Assignments
              </h3>
            </div>
            <div className="space-y-4">
              {data?.upcomingAssignments?.length > 0 ? (
                data.upcomingAssignments.map((assignment: any) => {
                  const date = new Date(assignment.dueDate);
                  return (
                    <div key={assignment.id} className="flex items-start p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold mr-4 shrink-0 border border-indigo-100/50">
                        <span className="text-[10px] uppercase tracking-wider mb-0.5">{date.toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="leading-none text-lg">{date.getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{assignment.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{assignment.description.substring(0, 50)}...</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <p>No upcoming assignments!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}