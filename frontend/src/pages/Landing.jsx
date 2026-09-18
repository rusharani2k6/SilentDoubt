import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquareOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  CheckCircle2,
  ChevronUp,
  Flame,
  UserX,
  Radio,
  BookOpen,
  HelpCircle,
  Clock,
  Layers,
  GraduationCap,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Logo } from '../components/ui/Logo';

export const Landing = () => {
  const navigate = useNavigate();
  const [mockUpvoted, setMockUpvoted] = useState(false);
  const [mockPollSelected, setMockPollSelected] = useState(null);

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#0D0F0D] flex flex-col selection:bg-[#9BE5E3]/50">
      
      {/* Floating SD-Style Navbar */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto w-full px-4">
        <div className="bg-white/90 backdrop-blur-md border border-[#E4E8EE] rounded-full px-6 py-3 shadow-sd-md flex items-center justify-between">
          {/* Logo */}
          <Logo size="sm" subtitle="Silent Doubt" href="/" />

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#3D3F4A]">
            <a href="#features" className="hover:text-[#0D0F0D] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[#0D0F0D] transition-colors">Demo</a>
            <a href="#how-it-works" className="hover:text-[#0D0F0D] transition-colors">How It Works</a>
            <a href="#ai-experience" className="hover:text-[#0D0F0D] transition-colors">AI Intelligence</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm" iconRight={ArrowRight}>
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center relative">
        {/* Soft SD dual-tone ambient background */}
        <div
          className="absolute inset-x-0 top-0 h-full -z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 30% 20%, rgba(246,228,159,0.22) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 75% 60%, rgba(155,229,227,0.20) 0%, transparent 60%)',
          }}
        />

        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="cyan" size="md" icon={Sparkles}>
            Real-Time Classroom Intelligence
          </Badge>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0D0F0D] tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Turn Every Academic Doubt Into{' '}
          <span className="inline-block relative">
            Understanding
            <span className="absolute left-0 bottom-1 w-full h-3 bg-[#9BE5E3]/45 -z-10 rounded-full" />
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#3D3F4A] max-w-2xl mx-auto leading-relaxed font-normal">
          <strong className="text-[#0D0F0D] font-bold">SD</strong> empowers students to ask doubts{' '}
          <strong className="text-[#0D0F0D] font-bold">silently and anonymously</strong>, upvote peer
          questions, and participate in live classroom comprehension polls without interrupting lecture momentum.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/login">
            <Button variant="primary" size="lg" iconRight={ArrowRight} className="w-full sm:w-auto shadow-sd-md">
              Start Free Today
            </Button>
          </Link>
          <a href="#preview">
            <Button variant="outline" size="lg" icon={Play} className="w-full sm:w-auto">
              Explore Live Demo
            </Button>
          </a>
        </div>

        {/* Social Proof / Avatars */}
        <div className="mt-10 flex items-center justify-center gap-3 text-xs font-semibold text-[#8A8B97]">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#9BE5E3] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0D0F0D]">AR</div>
            <div className="w-7 h-7 rounded-full bg-[#F6E49F] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0D0F0D]">PS</div>
            <div className="w-7 h-7 rounded-full bg-[#A6C8DE] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0D0F0D]">SS</div>
          </div>
          <span>Trusted by 5,000+ students and professors</span>
        </div>
      </section>


      {/* Hero Product Preview Mockup (The Dribbble Reference Core) */}
      <section id="preview" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-6">
        <div className="bg-white rounded-4xl border border-[#E4E8EE] shadow-sd-xl p-4 sm:p-7 relative overflow-hidden">
          
          {/* Top Browser / App Header Bar */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#F0F2F5]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FCA5A5]"></span>
                <span className="w-3 h-3 rounded-full bg-[#FDE047]"></span>
                <span className="w-3 h-3 rounded-full bg-[#86EFAC]"></span>
              </div>
              <div className="h-4 w-px bg-[#E4E8EE] mx-1"></div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-extrabold text-[#0D0F0D] uppercase tracking-wider">
                  Operating Systems & Concurrency — Section 2-CSM-F
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm" icon={Users}>
                38 Students Present
              </Badge>
              <Badge variant="warm" size="sm">
                Live Session #2
              </Badge>
            </div>
          </div>

          {/* Interactive Mockup Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Stream: Live Doubts Feed */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-[#0D0F0D] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3DA8A5]" /> Live Question Stream
                </span>
                <span className="text-[11px] font-semibold text-[#8A8B97]">Ranked by Upvotes</span>
              </div>

              {/* Doubt Item 1 (Interactive) */}
              <div className="bg-[#FAFBFB] hover:bg-white border border-[#E4E8EE] rounded-3xl p-4 transition-all shadow-sd-sm">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setMockUpvoted(!mockUpvoted)}
                    className={`flex flex-col items-center justify-center w-11 h-12 rounded-2xl border transition-all ${
                      mockUpvoted
                        ? 'bg-[#3DA8A5] border-[#3DA8A5] text-white'
                        : 'bg-white border-[#E4E8EE] text-[#3D3F4A] hover:border-[#3DA8A5]'
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-xs font-bold">{mockUpvoted ? 15 : 14}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="neutral" size="sm" icon={UserX}>
                        Anonymous Student
                      </Badge>
                      <Badge variant="warm" size="sm" icon={Flame}>
                        Re-Raised
                      </Badge>
                      <span className="text-[11px] text-[#8A8B97] ml-auto">2m ago</span>
                    </div>
                    <p className="text-sm font-semibold text-[#0D0F0D] leading-snug">
                      How does the Banker’s Algorithm ensure safe state without leading to starvation?
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8B97] pt-2 border-t border-[#F0F2F5]">
                      <span>Topic: Deadlock Avoidance</span>
                      <span className="text-[#3DA8A5] font-bold">Faculty Reviewing • Open</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doubt Item 2 */}
              <div className="bg-[#FAFBFB] border border-[#E4E8EE] rounded-3xl p-4 shadow-sd-sm">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center w-11 h-12 rounded-2xl bg-white border border-[#E4E8EE] text-[#3D3F4A]">
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-xs font-bold">9</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="neutral" size="sm" icon={UserX}>
                        Anonymous Student
                      </Badge>
                      <span className="text-[11px] text-[#8A8B97] ml-auto">6m ago</span>
                    </div>
                    <p className="text-sm font-semibold text-[#0D0F0D] leading-snug">
                      What is the primary difference between spinlocks and sleep locks in multi-threaded kernels?
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8B97] pt-2 border-t border-[#F0F2F5]">
                      <span>Topic: Synchronization</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved by Dr. Smith
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stream: Live Poll Widget & AI Insights */}
            <div className="lg:col-span-5 space-y-4">
              {/* Poll Widget */}
              <div className="bg-[#FAFBFB] border border-[#E4E8EE] rounded-3xl p-4.5 shadow-sd-sm">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="cyan" size="sm" icon={BarChart3}>
                    Live Comprehension Poll
                  </Badge>
                  <span className="text-[11px] font-bold text-emerald-600">Voting Open</span>
                </div>

                <h4 className="text-sm font-extrabold text-[#0D0F0D] mb-3">
                  Which condition is NOT required for deadlock to occur?
                </h4>

                <div className="space-y-2">
                  {[
                    { label: 'Mutual Exclusion', pct: 8, count: 3 },
                    { label: 'Hold and Wait', pct: 6, count: 2 },
                    { label: 'Preemption Allowed', pct: 81, count: 31, correct: true },
                    { label: 'Circular Wait', pct: 5, count: 2 },
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMockPollSelected(idx)}
                      className={`w-full relative overflow-hidden text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        mockPollSelected === idx
                          ? 'border-[#3DA8A5] bg-[#3DA8A5]/10 text-[#0D0F0D]'
                          : 'border-[#E4E8EE] bg-white text-[#3D3F4A] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-[#9BE5E3]/30 transition-all duration-500"
                        style={{ width: `${opt.pct}%` }}
                      ></div>
                      <div className="relative flex items-center justify-between z-10">
                        <span>{String.fromCharCode(65 + idx)}. {opt.label}</span>
                        <span className="font-bold text-[#0D0F0D]">{opt.pct}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Assistant Insight Card */}
              <div className="bg-gradient-to-br from-[#F6E49F]/30 via-white to-white border border-[#E8CF82]/60 rounded-3xl p-4 shadow-sd-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#7A620E]" />
                  <span className="text-xs font-bold text-[#7A620E] uppercase tracking-wider">
                    AI Concept Simplifier
                  </span>
                </div>
                <p className="text-xs text-[#3D3F4A] leading-relaxed">
                  "Deadlock requires 4 simultaneous conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock is naturally prevented."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Metrics */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            label="Doubts Solved"
            value="10,000+"
            color="cyan"
            description="Across active lectures"
          />
          <StatCard
            label="Comfort Score"
            value="99.4%"
            color="warm"
            description="Students feel safer asking"
          />
          <StatCard
            label="Lecture Momentum"
            value="0 Interruption"
            color="blue"
            description="Zero spoken disruptions"
          />
          <StatCard
            label="Privacy Standard"
            value="100% Anon"
            color="primary"
            description="Identity stripped on WS"
          />
        </div>
      </section>

      {/* Features Matrix Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="blue" size="md" icon={Layers} className="mb-3">
            Core Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D0F0D] tracking-tight">
            Designed for Modern Academic Flow
          </h2>
          <p className="mt-3 text-sm text-[#3D3F4A]">
            Everything professors and students need to elevate understanding in high-enrollment classes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Anonymous Inquiries */}
          <Card hover className="bg-gradient-to-br from-[#9BE5E3]/20 via-white to-white border-[#CCE9EB]">
            <div className="w-12 h-12 rounded-2xl bg-[#9BE5E3] text-[#0D0F0D] flex items-center justify-center font-bold mb-5 shadow-sm">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0D0F0D] mb-2">
              Silent & Anonymous Inquiries
            </h3>
            <p className="text-sm text-[#3D3F4A] leading-relaxed">
              Students ask questions with a single toggle. The backend automatically strips user identifiers on faculty and peer feeds while verifying the student author locally.
            </p>
          </Card>

          {/* Card 2: Dynamic Upvoting & Bumping */}
          <Card hover className="bg-gradient-to-br from-[#F6E49F]/25 via-white to-white border-[#F2E7C9]">
            <div className="w-12 h-12 rounded-2xl bg-[#F6E49F] text-[#0D0F0D] flex items-center justify-center font-bold mb-5 shadow-sm">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0D0F0D] mb-2">
              Democratic Upvoting & Re-Raising
            </h3>
            <p className="text-sm text-[#3D3F4A] leading-relaxed">
              High-value doubts naturally float to the top of the professor's dashboard. Students can re-raise / bump persistent questions to highlight common points of confusion.
            </p>
          </Card>

          {/* Card 3: Live Pulse Polls */}
          <Card hover className="bg-gradient-to-br from-[#A6C8DE]/20 via-white to-white border-[#D2E2ED]">
            <div className="w-12 h-12 rounded-2xl bg-[#A6C8DE] text-[#0D0F0D] flex items-center justify-center font-bold mb-5 shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0D0F0D] mb-2">
              Instant Comprehension Polls
            </h3>
            <p className="text-sm text-[#3D3F4A] leading-relaxed">
              Faculty can launch 1-click understanding checks during live lectures with instant, animated percentage bars and synchronized real-time classroom statistics.
            </p>
          </Card>

          {/* Card 4: Automatic Attendance */}
          <Card hover className="bg-gradient-to-br from-[#3DA8A5]/15 via-white to-white border-[#D6E0F2]">
            <div className="w-12 h-12 rounded-2xl bg-[#3DA8A5] text-white flex items-center justify-center font-bold mb-5 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0D0F0D] mb-2">
              Zero-Friction Auto Attendance
            </h3>
            <p className="text-sm text-[#3D3F4A] leading-relaxed">
              Attendance records are registered the millisecond a student connects to the WebSocket session room. Faculty can view live presence lists at any time.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Workflow Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full bg-white rounded-4xl border border-[#E4E8EE] shadow-sd-md my-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="warm" size="md" icon={Clock} className="mb-3">
            Simple 4-Step Flow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D0F0D] tracking-tight">
            How DoubtFlow Works in Class
          </h2>
          <p className="mt-3 text-sm text-[#3D3F4A]">
            Frictionless collaboration between professor and students in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ask Silently',
              desc: 'Student posts a doubt with the anonymous switch toggled on.',
              color: 'bg-[#9BE5E3]',
            },
            {
              step: '02',
              title: 'Peers Upvote',
              desc: 'Classmates upvote questions they also have, creating democratic priority.',
              color: 'bg-[#F6E49F]',
            },
            {
              step: '03',
              title: 'Faculty Resolves',
              desc: 'Instructor addresses the top questions and marks them resolved in 1 click.',
              color: 'bg-[#A6C8DE]',
            },
            {
              step: '04',
              title: 'Master Concepts',
              desc: 'Interactive polls verify comprehension across the entire classroom.',
              color: 'bg-[#3DA8A5] text-white',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col p-5 rounded-3xl bg-[#FAFBFB] border border-[#E4E8EE]">
              <span className={`w-10 h-10 rounded-2xl ${item.color} font-extrabold text-sm flex items-center justify-center mb-4 shadow-sm`}>
                {item.step}
              </span>
              <h4 className="text-base font-bold text-[#0D0F0D] mb-1.5">{item.title}</h4>
              <p className="text-xs text-[#3D3F4A] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Bottom CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div
          className="rounded-4xl p-8 sm:p-14 text-center relative overflow-hidden shadow-sd-xl border border-[#E4E8EE]"
          style={{
            background: 'linear-gradient(135deg, #FEF9E8 0%, #F5F7F8 40%, #E6FAF9 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(246,228,159,0.50) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(155,229,227,0.45) 0%, transparent 70%)' }}
          />
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[#0D0F0D]">
              Ready to Upgrade Your Classroom?
            </h2>
            <p className="text-base text-[#3D3F4A] mb-8 max-w-lg mx-auto">
              Join professors and students transforming lecture engagement with SD today.
            </p>
            <Link to="/login">
              <Button variant="primary" size="lg" iconRight={ArrowRight} className="shadow-sd-md">
                Enter Live Classroom
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E4E8EE] bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3D3F4A]">
          <div className="flex items-center gap-2">
            <Logo size="xs" subtitle="" href="/" />
            <span>— Silent Doubt Intelligence Platform</span>
          </div>
          <p>© 2026 SD Intelligence Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

};
