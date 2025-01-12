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

  // Styles
  const styles = `
    @keyframes fadeInContent {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fadeInContent 0.8s ease-out forwards;
    }
    .fixed-brand {
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      font-size: 2.75rem;
      font-weight: bold;
      text-align: center;
      background: linear-gradient(to right, #6366f1, #8b5cf6, #3b82f6);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
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

  // Common brand text for both views
  const BrandText = () => (
    <h2 className="fixed-brand">
      GauchoCourse.
    </h2>
  );

  // Render Search View
  if (!selectedCourse) {
    return (
      <>
        <style>{styles}</style>
        <BrandText />
        <div className="min-h-screen bg-gray-900 p-4">
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
  }

  // Render Course Details View
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <style>{styles}</style>
      <BrandText />

      <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 animate-fade-in mt-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{selectedCourse.course}</h1>
            <p className="text-xl text-gray-400">{selectedCourse.coursetitle}</p>
          </div>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Course Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-400">Instructor</p>
                <p className="text-lg font-medium text-white truncate">{selectedCourse.instructor}</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-400">Term</p>
                <p className="text-lg font-medium text-white">{selectedCourse.quarter} {selectedCourse.year}</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-400">Units</p>
                <p className="text-lg font-medium text-white">{selectedCourse.units}</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-400">Average GPA</p>
                <p className="text-lg font-medium text-white">{selectedCourse.avgGPA?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-400">Total Students</p>
                <p className="text-lg font-medium text-white">{selectedCourse.nLetterStudents}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Grade Distribution</h2>
            <div className="h-96 bg-gray-900 rounded-lg p-4 border border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getGradeData(selectedCourse)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="grade" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      color: '#F3F4F6'
                    }}
                  />
                  <Bar dataKey="count">
                    {getGradeData(selectedCourse).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Course Description</h2>
          <p className="text-gray-300 leading-relaxed">{selectedCourse.description}</p>
        </div>

        {selectedCourse.prereqs && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Prerequisites</h2>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-300">{selectedCourse.prereqs}</p>
            </div>
          </div>
        )}

        {selectedCourse.studentcomments && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Student Comments</h2>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-300 italic">{selectedCourse.studentcomments}</p>
            </div>
          </div>
        )}
      </div>

      <button 
        className="fixed bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-full shadow-lg hover:from-pink-600 hover:to-blue-600 transition-all duration-300 font-semibold"
        onClick={() => {/* TODO: Implement chat functionality */}}
      >
        ASK OVIYA
      </button>
    </div>
  );
};

export default CombinedExplorer;