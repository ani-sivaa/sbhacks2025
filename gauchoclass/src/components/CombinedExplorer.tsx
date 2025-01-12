'use client';

import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';
import { Course, GradeData, CourseOption } from '@/types/course';
import LoadingScreen from './LoadingScreen';
import { X } from 'lucide-react';

const CombinedExplorer: React.FC = () => {
  // States
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [courseNumbers, setCourseNumbers] = useState<CourseOption[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedCourseNumber, setSelectedCourseNumber] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'comments' | 'prerequisites'>('description');
  const [filteredDepts, setFilteredDepts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  // Styles
  const styles = `
  .course-grid {
    display: grid;
    grid-template-areas:
      "prof   center      center    credits    would"
      "gpa      dist      dist      dist      diff"
      "term     desc      desc      desc      term2"
      "term     desc     desc     desc     term2"
    ;
    grid-template-columns: auto 1fr 1fr 1fr auto;
    grid-template-rows: auto minmax(250px, auto) auto auto;
    gap: 1.5rem;
    padding: 2rem;
    max-width: 1600px;
    margin: 0 auto;
  }

  @media (max-width: 1024px) {
    .course-grid {
      grid-template-areas:
        "center center center center center"
        "credits prof rating would diff"
        "gpa desc desc desc term2"
        "term desc desc desc term2"
        "dist dist dist dist dist";
      gap: 1rem;
      padding: 1rem;
    }

  }

  @media (max-width: 768px) {
    .course-grid {
      grid-template-areas:
        "center"
        "credits"
        "prof"
        "rating"
        "would"
        "diff"
        "gpa"
        "desc"
        "term"
        "term2"
        "dist";
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1rem;
    }
    
    
    
   
  }

  .center-card {
    grid-area: center;
    background:#ABD4FF ;
    padding: 1.5rem;
    border-radius: 1rem;
    text-align: center;
    transform: scale(1.0);
    height: 100%;
    
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.2s ease;
    border: 
  }

  .center-card:hover {
    transform: scale(1.07);
    box-shadow: 
      0 0 50px rgba(0, 0, 0, 0.3),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  }

  .metric-card {
    background: linear-gradient(0deg, #202020, #080808);
    border-radius: 1rem;
    padding: 1.5rem;
    color: white;
    transition: transform 0.2s ease;
    height: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 0px solid rgba(255, 255, 255, 0.05);
  }



  .metric-card[data-size="large"] {
    min-height: 400px;
    overflow-y: auto;
  }

  .metric-card[data-size="medium"] {
    min-height: 300px;
  }

  .metric-card[data-size="tall"] {
    grid-row: span 2;
  }

  .metric-card[data-size="wide"] {
    grid-column: span 3;
  }

  .metric-card:hover {
    transform: translateY(-2px);
  }

  .metric-value {
    font-size: 4.0rem;
    font-weight: bold;
    color:rgb(76, 81, 215);
  }

  .metric-label {
    font-size: 1.2rem;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease forwards;
  }
  `;

  // Loading Screen Effect
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('hasSeenIntro');
    }
    
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro === 'true') {
      setShowLoadingScreen(false);
    }
  }, []);

  // Load Course Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/merged_courses.csv');
        const text = await response.text();
        Papa.parse<Course>(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Filter out invalid data and ensure proper typing
            const validCourses = results.data.filter(course => 
              course.dept && 
              course.course && 
              typeof course.dept === 'string' &&
              typeof course.course === 'string'
            );
            
            // Get unique departments, ensuring they're strings and not null/undefined
            const uniqueDepts = Array.from(new Set(
              validCourses.map(course => course.dept?.trim())
            )).filter((dept): dept is string => Boolean(dept)).sort();
            
            setDepartments(uniqueDepts);
            setCourses(validCourses);
            setLoading(false);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update Course Numbers
  useEffect(() => {
    if (selectedDept && courses.length > 0) {
      const deptCourses = courses
        .filter(course => course.dept?.trim() === selectedDept)
        .map(course => {
          // Handle potential spaces in course numbers
          const courseNumber = course.course?.replace(selectedDept, '').trim();
          return {
            code: courseNumber,
            title: course.coursetitle || ''
          };
        })
        .filter(course => course.code); // Filter out any invalid entries
      
      const uniqueCourses = _.uniqBy(deptCourses, 'code')
        .filter((course): course is CourseOption => typeof course.code === 'string');
      setCourseNumbers(uniqueCourses.sort((a, b) => a.code.localeCompare(b.code, undefined, {numeric: true})));
      setSelectedCourseNumber('');
    } else {
      setCourseNumbers([]);
    }
  }, [selectedDept, courses]);

  const handleSearch = () => {
    if (selectedDept && selectedCourseNumber) {
      const fullCourseCode = `${selectedDept} ${selectedCourseNumber}`.toUpperCase();
      const found = courses.find(course => course.course?.toUpperCase() === fullCourseCode);
      setSelectedCourse(found || null);
    }
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setSelectedCourseNumber('');
  };

  const getGradeData = (course: Course): GradeData[] => {
    if (!course) return [];
    return [
      { grade: 'A+', count: Number(course.Ap) || 0, color: '#60A5FA' },
      { grade: 'A', count: Number(course.A) || 0, color: '#3B82F6' },
      { grade: 'A-', count: Number(course.Am) || 0, color: '#2563EB' },
      { grade: 'B+', count: Number(course.Bp) || 0, color: '#4F46E5' },
      { grade: 'B', count: Number(course.B) || 0, color: '#4338CA' },
      { grade: 'B-', count: Number(course.Bm) || 0, color: '#3730A3' },
      { grade: 'C+', count: Number(course.Cp) || 0, color: '#5B21B6' },
      { grade: 'C', count: Number(course.C) || 0, color: '#6D28D9' },
      { grade: 'C-', count: Number(course.Cm) || 0, color: '#7C3AED' },
      { grade: 'D', count: Number(course.D) || 0, color: '#8B5CF6' },
      { grade: 'F', count: Number(course.F) || 0, color: '#9333EA' }
    ].filter(grade => grade.count > 0);
  };

  // Add this effect to handle hydration
  useEffect(() => {
    // This ensures the component only renders client-side
    setIsChatOpen(false);
    setMessages([]);
  }, []);

  const handleChatToggle = () => {
    console.log("🔍 Chat button clicked");
    setIsChatOpen(!isChatOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const formatCourseMessage = (course: any) => {
    return `${course.code}: ${course.title}
Units: ${course.units}
Prerequisites: ${course.prereqs || 'None'}
${course.description ? `\nDescription: ${course.description}` : ''}`
  };

  const handleTranscriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading transcript...');
      const response = await fetch('http://localhost:8000/api/upload-transcript', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      setUserCourses(data.completed_courses);
      setAvailableCourses(data.available_courses);

      // Format course suggestions message
      const suggestionsMessage = `Based on your completed courses, here are some recommended courses:\n\n${
        data.available_courses
          .slice(0, 5)  // Show top 5 suggestions
          .map((course: any) => formatCourseMessage(course))
          .join('\n\n')
      }\n\nI can help you:\n• Find more courses in specific departments\n• Explain prerequisites in detail\n• Suggest courses based on your interests\n\nWhat would you like to know more about?`;

      setMessages(prev => [...prev, {
        text: `Transcript processed! Found ${data.completed_courses.length} completed courses.`,
        isUser: false
      }, {
        text: suggestionsMessage,
        isUser: false
      }]);
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, {
        text: 'Sorry, there was an error processing your transcript: ' + error.message,
        isUser: false
      }]);
    }
  };

  // Add a ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Update useEffect to scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatInterface = typeof window !== 'undefined' && (
    <div 
      className={`fixed bottom-24 right-8 w-96 bg-gray-800 rounded-lg shadow-xl transition-all duration-300 ${
        isChatOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Chat with Oviya</h3>
        <input
          type="file"
          accept=".pdf"
          onChange={handleTranscriptUpload}
          className="hidden"
          id="transcript-upload"
        />
        <label 
          htmlFor="transcript-upload"
          className="cursor-pointer text-blue-400 hover:text-blue-300"
        >
          Upload Transcript
        </label>
        <button onClick={handleChatToggle} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
            }`}>
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white p-3 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Add this div for scrolling */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );

  // Add this effect to debug state changes
  useEffect(() => {
    console.log("🔍 Chat state updated:", isChatOpen);
  }, [isChatOpen]);

  // Render Loading Screen
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />;
  }

  // Render Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Course Details View
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-[#080808] p-8 pb-32 overflow-y-auto h-full">
        <style>{styles}</style>
        
        <div className="course-grid">
          
          
          {/* Credits */}
          <div className="metric-card text-center flex flex-col items-center justify-center" style={{ gridArea: 'credits' }}>
            <div className="metric-label text-lg">Credits</div>
            <div className="metric-value text-5xl">{selectedCourse.units}</div>
          </div>
          
          {/* Professor */}
          <div className="metric-card p-8 text-center flex flex-col items-center justify-center" style={{ gridArea: 'prof' }}>
            <div className="metric-label text-lg">Professor</div>
            <div className="metric-value ">{selectedCourse.instructor}</div>
          </div>
          {/* Center Card - Course Code */}
          <div className="center-card">
          <div className="font-black text-7xl text-black">{selectedCourse.course}</div>
          <div className="text-2xl text-black">{selectedCourse.coursetitle}</div>
            <p className="text-xl text-gray-600">
              
            </p>
          </div>
          
          
          {/* Average GPA */}
          <div className="metric-card text-center flex flex-col items-center justify-center h-48" style={{ gridArea: 'gpa' }}>
            <div className="metric-label text-lg">Average GPA</div>
            <div className="metric-value text-5xl">{selectedCourse.avgGPA?.toFixed(2)}</div>
          </div>

          {/* Difficulty */}
          <div className="metric-card text-center flex flex-col items-center justify-center h-48" style={{ gridArea: 'diff' }}>
            <div className="metric-label text-lg">Difficulty</div>
            <div className="metric-value text-5xl">{selectedCourse.difficultylevel || '—'}</div>
            <div className="text-gray-400 text-base mt-2">out of 5</div>
          </div>
          
          {/* Term */}
          <div className="metric-card text-center flex flex-col items-center justify-center" style={{ gridArea: 'term' }}>
            <div className="metric-label text-lg">Data From</div>
            <div className="metric-value ">
              {selectedCourse.quarter} {selectedCourse.year}
            </div>
          </div>

          {/* Class Size */}
          <div className="metric-card text-center flex flex-col items-center justify-center" style={{ gridArea: 'term2' }}>
            <div className="metric-label text-lg">Total Enrollment</div>
            <div className="metric-value text-5xl">
              {getGradeData(selectedCourse).reduce((sum, grade) => sum + grade.count, 0)}
            </div>
            <div className="text-gray-400 text-base mt-2">students</div>
          </div>
          
          {/* Would Take Again */}
          <div className="metric-card text-center flex flex-col items-center justify-center" style={{ gridArea: 'would' }}>
            <div className="metric-label text-lg">Would Take Again</div>
            <div className="metric-value text-5xl">
              {selectedCourse.wouldtakeagain ? selectedCourse.wouldtakeagain.replace('%', '') : '—'}%
            </div>
            <div className="text-gray-400 text-base mt-2">of students</div>
          </div>
          
          {/* Description Card with Tabs */}
          <div className="metric-card" style={{ gridArea: 'desc' }} data-size="wide">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'description'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'comments'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Student Comments
              </button>
              <button
                onClick={() => setActiveTab('prerequisites')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'prerequisites'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Prerequisites
              </button>
            </div>

            <div className="relative overflow-hidden h-[250px] bg:#202020 rounded-lg">
              <div 
                className="absolute inset-0 transition-transform duration-500 ease-in-out flex"
                style={{
                  transform: `translateX(-${activeTab === 'description' ? 0 : activeTab === 'comments' ? 100 : 200}%)`
                }}
              >
                {/* Description Panel */}
                <div className="w-full flex-none px-6 py-4 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-700">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words text-2xl">
                      {selectedCourse.description || 'No description available.'}
                    </p>
                  </div>
                </div>

                {/* Comments Panel */}
                <div className="w-full flex-none px-6 py-4 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-700">
                  <div className="space-y-4">
                    {selectedCourse.studentcomments ? (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-300 italic whitespace-pre-wrap break-words text-2xl">
                          &ldquo;{selectedCourse.studentcomments}&rdquo;
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-gray-500 text-sm">{selectedCourse.quarter} {selectedCourse.year}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No student comments available.</p>
                    )}
                  </div>
                </div>

                {/* Prerequisites Panel */}
                <div className="w-full flex-none px-6 py-4 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-700">
                  <div className="space-y-4">
                    {selectedCourse.prereqs ? (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-blue-400 font-medium mb-2"></h3>
                        <p className="text-gray-300 whitespace-pre-wrap break-words text-2xl">
                          {selectedCourse.prereqs}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No prerequisites listed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Grade Distribution */}
          <div className="metric-card mb-20" style={{ gridArea: 'dist' }}>
            <div className="metric-label mb-4">Grade Distribution</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getGradeData(selectedCourse)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis 
                    dataKey="grade" 
                    stroke="#FFFFFF" 
                    tick={{ fill: '#FFFFFF' }}
                  />
                  <YAxis 
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#202020',
                      border: '1px solid #2A2A2A',
                      borderRadius: '0.5rem',
                      padding: '10px'
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    formatter={(value) => [
                      <span key="value" className="text-white">{value}</span>,
                      <span key="label" className="text-white">Count</span>
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {getGradeData(selectedCourse).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="rgb(76, 81, 215)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="fixed top-8 right-8 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
        >
          Back to Search
        </button>

        {/* Chat Button */}
        <div className="fixed bottom-8 right-8">
          <button 
            onClick={handleChatToggle}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-lg"
          >
            ASK OVIYA
          </button>
        </div>
        {chatInterface}
      </div>
    );
  }

  // Default Search View
  return (
    <>
      <style>{styles}</style>
      <div className="max-h-screen bg-gray-900 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-8 animate-fade-in relative">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const term = e.target.value.toUpperCase();
                    setSearchTerm(term);
                    setFilteredDepts(
                      departments.filter(dept => 
                        dept.toUpperCase().includes(term)
                      )
                    );
                  }}
                  className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search department (e.g., CMPSC)"
                />
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                    {filteredDepts.map(dept => (
                      <div
                        key={dept}
                        onClick={() => {
                          setSelectedDept(dept);
                          setSearchTerm(dept);
                          setFilteredDepts([]);
                        }}
                        className="p-3 hover:bg-gray-800 cursor-pointer text-white"
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                <select
                  value={selectedCourseNumber}
                  onChange={(e) => setSelectedCourseNumber(e.target.value)}
                  disabled={!selectedDept}
                  className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  {courseNumbers.map(course => (
                    <option key={course.code} value={course.code}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSearch}
                disabled={!selectedDept || !selectedCourseNumber}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                View Course Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CombinedExplorer;