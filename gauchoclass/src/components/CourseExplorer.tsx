'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';
import { Course, GradeData, CourseOption } from '@/types/course';

const CourseExplorer: React.FC = () => {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [courseNumbers, setCourseNumbers] = React.useState<CourseOption[]>([]);
  const [selectedDept, setSelectedDept] = React.useState<string>('');
  const [selectedCourseNumber, setSelectedCourseNumber] = React.useState<string>('');
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
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

  React.useEffect(() => {
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
      { grade: 'A+', count: Number(course.Ap) || 0, color: '#34D399' },
      { grade: 'A', count: Number(course.A) || 0, color: '#34D399' },
      { grade: 'A-', count: Number(course.Am) || 0, color: '#34D399' },
      { grade: 'B+', count: Number(course.Bp) || 0, color: '#60A5FA' },
      { grade: 'B', count: Number(course.B) || 0, color: '#60A5FA' },
      { grade: 'B-', count: Number(course.Bm) || 0, color: '#60A5FA' },
      { grade: 'C+', count: Number(course.Cp) || 0, color: '#F59E0B' },
      { grade: 'C', count: Number(course.C) || 0, color: '#F59E0B' },
      { grade: 'C-', count: Number(course.Cm) || 0, color: '#F59E0B' },
      { grade: 'D', count: Number(course.D) || 0, color: '#EF4444' },
      { grade: 'F', count: Number(course.F) || 0, color: '#DC2626' }
    ].filter(grade => grade.count > 0);
  };

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

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">Instructor</p>
                  <p className="text-lg font-medium text-white truncate">{selectedCourse.instructor}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">Term</p>
                  <p className="text-lg font-medium text-white">{selectedCourse.quarter} {selectedCourse.year}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">Units</p>
                  <p className="text-lg font-medium text-white">{selectedCourse.units}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">Average GPA</p>
                  <p className="text-lg font-medium text-white">{selectedCourse.avgGPA?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">Total Students</p>
                  <p className="text-lg font-medium text-white">{selectedCourse.nLetterStudents}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Grade Distribution</h2>
              <div className="h-96 bg-gray-700 rounded-lg p-4">
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
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-300">{selectedCourse.prereqs}</p>
              </div>
            </div>
          )}

          {selectedCourse.studentcomments && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Student Comments</h2>
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-300 italic">{selectedCourse.studentcomments}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-white mb-2">GauchoClass</h1>
        <p className="text-center text-gray-400 mb-8">Explore UCSB courses and grade distributions</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Course</label>
            <select
              value={selectedCourseNumber}
              onChange={(e) => setSelectedCourseNumber(e.target.value)}
              disabled={!selectedDept}
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
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
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            View Course Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseExplorer;