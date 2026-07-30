"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code, Users, Rocket, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg mr-3">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">NexusTech</h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Internship Portal</p>
          </div>
        </div>
        <div>
          <Link 
            href="/login" 
            className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all shadow-sm"
          >
            Intern Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6">
            <Target className="w-4 h-4 mr-2" />
            Class of 2026 Applications Open
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Launch Your Career at <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              NexusTech
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Welcome to the NexusTech Engineering Internship Programme. Connect with industry-leading mentors, build real-world projects, and accelerate your tech career.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center group"
            >
              Apply Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 border border-blue-100 rounded-full font-bold shadow-sm hover:bg-blue-50 transition-all flex items-center"
            >
              Intern Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 w-full px-4"
        >
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Code className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-World Projects</h3>
            <p className="text-slate-500 text-sm font-medium">Work on production systems and ship code that impacts millions of users globally.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Mentorship</h3>
            <p className="text-slate-500 text-sm font-medium">Get 1:1 guidance from Senior Engineers and participate in weekly architecture reviews.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Rocket className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Career Acceleration</h3>
            <p className="text-slate-500 text-sm font-medium">Over 85% of our interns receive full-time return offers upon graduation.</p>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm font-medium z-10 relative mt-10">
        <p className="mb-2">© {new Date().getFullYear()} NexusTech Inc. All rights reserved. | Internship Portal</p>
        <Link href="/admin/login" className="text-slate-300 hover:text-slate-500 transition-colors text-xs">
          Admin Gateway
        </Link>
      </footer>
    </div>
  );
}