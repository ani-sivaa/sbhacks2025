'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';
import { Course, GradeData, CourseOption } from '@/types/course';
import LoadingScreen from './LoadingScreen';

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

// Styles
const styles = `
.course-grid {
  display: grid;
  grid-template-areas:
    "credits   prof      center    rating    would"
    "gpa      desc      desc      desc      diff"
    "term     desc      desc      desc      term2"
    "dist     dist      dist      dist      dist"
  ;
  grid-template-columns: auto 1fr 1fr 1fr auto;
  grid-template-rows: auto minmax(250px, auto) auto auto;
  gap: 1rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.center-card {
  grid-area: center;
  background: #E2EEFF;
  padding: 2rem;
  border-radius: 1.5rem;
  text-align: center;
  transform: scale(1.1);
  z-index: 10;
}

.metric-card {
  background: #1E1E1E;
  border-radius: 1rem;
  padding: 1.5rem;
  color: white;
  transition: transform 0.2s ease;
  height: 100%;
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
  font-size: 2.5rem;
  font-weight: bold;
  color: #69A7FF;
}

.metric-label {
  font-size: 0.875rem;
  color: #9CA3AF;
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
      const response = await fetch('/courses.csv');
      const text = await response.text();
      Papa.parse<Course>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const uniqueDepts = _.uniq(results.data.map(course => course.dept)).filter(Boolean).sort();
          setDepartments(uniqueDepts);
          setCourses(results.data);
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
      .filter(course => course.dept === selectedDept)
      .map(course => ({
        code: course.course?.split(' ')[1] || '',
        title: course.coursetitle || ''
      }));
    
    const uniqueCourses = _.uniqBy(deptCourses, 'code');
    setCourseNumbers(uniqueCourses.filter(course => course.code));
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
    <div className="min-h-screen bg-black p-8">
      <style>{styles}</style>
      
      <div className="course-grid">
        {/* Center Card - Course Code */}
        <div className="center-card">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {selectedCourse.course}
          </h1>
          <p className="text-xl text-gray-600">
            {selectedCourse.coursetitle}
          </p>
        </div>
        
        {/* Credits */}
        <div className="metric-card" style={{ gridArea: 'credits' }}>
          <div className="metric-label">Credits</div>
          <div className="metric-value">{selectedCourse.units}</div>
        </div>
        
        {/* Professor */}
        <div className="metric-card" style={{ gridArea: 'prof' }}>
          <div className="metric-label">Professor</div>
          <div className="metric-value text-xl">{selectedCourse.instructor}</div>
        </div>
        
        {/* Rating */}
        <div className="metric-card" style={{ gridArea: 'rating' }}>
          <div className="metric-label">Overview</div>
          <div className="text-sm">This data was made available through the FERPA act.</div>
        </div>
        
        {/* Average GPA */}
        <div className="metric-card" style={{ gridArea: 'gpa' }}>
          <div className="metric-label">Average GPA</div>
          <div className="metric-value">{selectedCourse.avgGPA}</div>
        </div>

        {/* Difficulty */}
        <div className="metric-card" style={{ gridArea: 'diff' }}>
          <div className="metric-label">Difficulty</div>
          <div className="metric-value">3.7</div>
        </div>
        
        {/* Term */}
        <div className="metric-card" style={{ gridArea: 'term' }}>
          <div className="metric-label">Data From</div>
          <div className="metric-value text-xl">
            {selectedCourse.quarter} {selectedCourse.year}
          </div>
        </div>

        {/* Class Size */}
        <div className="metric-card" style={{ gridArea: 'term2' }}>
          <div className="metric-label">Total Enrollment</div>
          <div className="metric-value">
            {getGradeData(selectedCourse).reduce((sum, grade) => sum + grade.count, 0)}
          </div>
          <div className="text-gray-400 text-sm mt-2">students</div>
        </div>
        
        {/* Would Take Again */}
        <div className="metric-card" style={{ gridArea: 'would' }}>
          <div className="metric-label">Would Take Again</div>
          <div className="metric-value">36%</div>
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

          <div className="overflow-hidden h-[250px]">
            <div 
              className="transition-transform duration-300 ease-in-out flex h-full"
              style={{
                transform: `translateX(-${
                  activeTab === 'description' ? 0 : activeTab === 'comments' ? 100 : 200
                }%)`,
                width: '300%'
              }}
            >
              {/* Description Panel */}
              <div className="w-full  flex-shrink-0 px-4 overflow-y-auto h-full">
                <div className="text-gray-300 leading-relaxed">
                  {selectedCourse.description}
                </div>
              </div>

              {/* Comments Panel */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-300 italic">"Great course! The professor was very engaging and the material was interesting. The homework assignments were challenging but helped reinforce the concepts learned in class."</p>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-gray-500 text-sm">Fall 2023</p>
                      <div className="flex items-center">
                        <span className="text-green-400 text-sm mr-2">Grade: A</span>
                        <span className="text-blue-400 text-sm">Hours/Week: 8</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-300 italic">"Challenging but rewarding. Be prepared to put in the work. The professor is knowledgeable and always willing to help during office hours."</p>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-gray-500 text-sm">Spring 2023</p>
                      <div className="flex items-center">
                        <span className="text-green-400 text-sm mr-2">Grade: B+</span>
                        <span className="text-blue-400 text-sm">Hours/Week: 10</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-300 italic">"The course content is fascinating, but the workload can be intense. Make sure to start assignments early and attend all the lectures."</p>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-gray-500 text-sm">Winter 2023</p>
                      <div className="flex items-center">
                        <span className="text-green-400 text-sm mr-2">Grade: A-</span>
                        <span className="text-blue-400 text-sm">Hours/Week: 12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prerequisites Panel */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-blue-400 font-medium mb-2">Required Prerequisites</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>MATH 101 - Calculus I (Minimum grade: C)</li>
                      <li>CS 201 - Introduction to Programming</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-purple-400 font-medium mb-2">Recommended Background</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Familiarity with Python programming</li>
                      <li>Basic understanding of algorithms</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-red-400 font-medium mb-2">Notes</h3>
                    <p className="text-gray-300">
                      Students without the required prerequisites must obtain instructor permission to enroll.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grade Distribution */}
        <div className="metric-card" style={{ gridArea: 'dist' }}>
          <div className="metric-label mb-2">Grade Distribution</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getGradeData(selectedCourse)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="grade" stroke="#69A7FF" />
                <YAxis stroke="#69A7FF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#69A7FF'
                  }}
                />
                <Bar dataKey="count">
                  {getGradeData(selectedCourse).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#69A7FF" />
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
        <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-lg">
          ASK OVIYA
        </button>
      </div>
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
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
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

      <button 
        className="fixed bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-full shadow-lg hover:from-pink-600 hover:to-blue-600 transition-all duration-300 font-semibold"
        onClick={() => {/* TODO: Implement chat functionality */}}
      >
        ASK OVIYA
      </button>
    </div>
  </>
);
};

export default CombinedExplorer;