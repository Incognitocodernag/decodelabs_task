"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Award,
  CalendarDays,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InternshipPage() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  
  const handleClockInOut = async () => {
    const endpoint = clockedIn ? "clock-out" : "clock-in";
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/attendance/${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });
      if (res.ok) {
        if (!clockedIn) {
          setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setClockInTime(null);
        }
        setClockedIn(!clockedIn);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [assignments, setAssignments] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Check if we are clocked in today
    fetch(`http://localhost:4000/api/attendance/today`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.checkInTime && !data.checkOutTime) {
          setClockedIn(true);
          setClockInTime(new Date(data.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      })
      .catch(console.error);

    fetch(`http://localhost:4000/api/assignments`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setAssignments([]);
          return;
        }
        
        // Compute dynamic statuses
        const mappedData = data.map((a: any) => {
          const submission = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null;
          
          let status = "PENDING";
          if (submission) {
             status = submission.status; // "SUBMITTED" or "GRADED"
          } else if (new Date(a.dueDate).getTime() < Date.now()) {
             status = "OVERDUE";
          }
          
          return {
             ...a,
             status,
             grade: submission?.grade
          };
        });

        setAssignments(mappedData);
      })
      .catch((err) => {
        console.error("Failed to fetch assignments", err);
        setAssignments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(assignmentId);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignmentId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/submissions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        setAssignments(prev => prev.map(a => 
          a.id === assignmentId ? { ...a, status: "SUBMITTED" } : a
        ));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(null);
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

  // Metrics calculation
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === "SUBMITTED" || a.status === "GRADED").length;
  const progressPercentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  
  const pendingAssignments = assignments.filter(a => a.status === "PENDING" || a.status === "OVERDUE");
  const nextDeadline = pendingAssignments.length > 0 
    ? pendingAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
    : null;

  return (
    <DashboardLayout role="STUDENT">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-6xl mx-auto pb-12">
        
        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Progress Card */}
          <motion.div variants={item} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-4">
                <Target className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Milestone Progress</h3>
              </div>
              <div className="flex items-end space-x-2 mb-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">{progressPercentage}%</span>
                <span className="text-slate-500 font-medium pb-1.5">Completed</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{completedAssignments} of {totalAssignments} assignments submitted</p>
            </div>
            
            <div className="mt-8">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Next Deadline Card */}
          <motion.div variants={item} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div>
              <div className="flex items-center space-x-2 text-amber-500 mb-4">
                <CalendarDays className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Next Deadline</h3>
              </div>
              {nextDeadline ? (
                <>
                  <h4 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{nextDeadline.title}</h4>
                  <div className="text-sm font-semibold text-amber-600 bg-amber-50 inline-flex items-center px-3 py-1 rounded-lg mt-2">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(nextDeadline.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-start mt-2">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">All Caught Up!</h4>
                  <p className="text-sm text-slate-500 font-medium mt-1">You have no pending assignments.</p>
                </div>
              )}
            </div>
            
            {nextDeadline && (
               <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                 View Assignment <ArrowRight className="w-4 h-4 ml-1" />
               </div>
            )}
          </motion.div>

          {/* Attendance Card */}
          <motion.div variants={item} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700 flex flex-col justify-between relative overflow-hidden">
            <div className={cn(
              "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/2 transition-colors duration-1000",
              clockedIn ? "bg-emerald-400" : "bg-indigo-500"
            )} />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-slate-300 mb-4">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Today's Shift</h3>
              </div>
              
              <div className="flex items-center space-x-4 mb-2">
                <div className="relative">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    clockedIn ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-slate-500"
                  )}></div>
                  {clockedIn && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>}
                </div>
                <h4 className="text-2xl font-bold text-white">
                  {clockedIn ? "Clocked In" : "Off the Clock"}
                </h4>
              </div>
              <p className="text-sm text-slate-400 font-medium ml-7">
                {clockedIn ? `Started at ${clockInTime}` : "Ready to start your day?"}
              </p>
            </div>
            
            <button
              onClick={handleClockInOut}
              className={cn(
                "relative z-10 w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center mt-6 text-sm tracking-wide uppercase",
                clockedIn 
                  ? "bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600 backdrop-blur-sm" 
                  : "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/25"
              )}
            >
              {clockedIn ? "End Shift" : "Begin Shift"}
            </button>
          </motion.div>
        </div>

        {/* Assignments List */}
        <motion.div variants={item} className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Action Items</h3>
              <p className="text-slate-500 font-medium mt-1">Review and complete your assigned tasks.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2 text-sm font-bold text-slate-600">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>{assignments.length} Total</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-slate-200 border-dashed">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium text-sm">Loading your action items...</p>
              </div>
            ) : assignments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] shadow-sm border border-slate-100 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative z-10">
                  <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
                  <Inbox className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 relative z-10">Inbox Zero!</h3>
                <p className="text-slate-500 font-medium mt-2 max-w-sm relative z-10">
                  You have no pending assignments at the moment. Take a break, or check back later when new tasks are assigned.
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {assignments.map((assignment, index) => (
                  <motion.div 
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                  >
                    {/* Status Edge Indicator */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                      assignment.status === "PENDING" ? "bg-amber-400" :
                      assignment.status === "OVERDUE" ? "bg-red-500" :
                      assignment.status === "SUBMITTED" ? "bg-indigo-400" :
                      "bg-emerald-500"
                    )}></div>

                    <div className="pl-4">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{assignment.title}</h4>
                        
                        {/* Status Badges */}
                        {assignment.status === "PENDING" && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100">Action Required</span>
                        )}
                        {assignment.status === "SUBMITTED" && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100">In Review</span>
                        )}
                        {assignment.status === "GRADED" && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 uppercase tracking-widest border border-emerald-100 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Graded
                          </span>
                        )}
                        {assignment.status === "OVERDUE" && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-red-50 text-red-600 uppercase tracking-widest border border-red-100 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{assignment.description}</p>
                      
                      <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5 text-slate-300" /> 
                          Due {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        {assignment.status !== "PENDING" && assignment.status !== "OVERDUE" && (
                          <div className="flex items-center text-indigo-400">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Submitted Successfully
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                      {assignment.status === "GRADED" ? (
                        <div className="flex items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                           <div className="flex flex-col items-end mr-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Final Score</span>
                             <span className="text-2xl font-black text-slate-900 leading-none">{assignment.grade}<span className="text-sm text-slate-400">/100</span></span>
                           </div>
                           <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                             <Award className="w-6 h-6" />
                           </div>
                        </div>
                      ) : assignment.status === "SUBMITTED" ? (
                        <div className="flex items-center justify-center text-indigo-600 font-bold text-sm bg-indigo-50/50 px-6 py-3.5 rounded-xl border border-indigo-100/50 w-full md:w-auto">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Work Submitted
                        </div>
                      ) : (
                        <div className="relative w-full md:w-auto">
                          <input
                            type="file"
                            id={`file-${assignment.id}`}
                            className="hidden"
                            onChange={(e) => handleUpload(e, assignment.id)}
                            disabled={uploading === assignment.id}
                          />
                          <label 
                            htmlFor={`file-${assignment.id}`}
                            className={cn(
                              "cursor-pointer flex items-center justify-center font-bold text-sm px-6 py-3.5 rounded-xl transition-all w-full md:w-auto",
                              uploading === assignment.id 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                : "bg-slate-900 text-white hover:bg-indigo-600 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                            )}
                          >
                            {uploading === assignment.id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Uploading...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <UploadCloud className="w-4 h-4 mr-2" />
                                Upload Deliverable
                              </span>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}