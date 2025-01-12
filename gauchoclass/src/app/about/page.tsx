'use client';

import React from 'react';
import { BookOpen, Star, TrendingUp, Users, Database, School, Award, LineChart } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Database className="w-8 h-8 text-indigo-500" />,
      title: "Comprehensive Data Sources",
      description: "Aggregated data from California Public Schools Accountability Act and RateMyProfessor.com"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      title: "Grade Distribution Insights",
      description: "Historical grade distributions and trends for every course"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Professor Ratings",
      description: "Real student feedback and ratings for UCSB professors"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Student Experience",
      description: "Authentic student comments and course reviews"
    }
  ];

  const stats = [
    { value: "50K+", label: "Students Helped", icon: <School className="w-6 h-6" /> },
    { value: "1000+", label: "Courses Analyzed", icon: <BookOpen className="w-6 h-6" /> },
    { value: "2M+", label: "Data Points", icon: <LineChart className="w-6 h-6" /> },
    { value: "4.8/5", label: "User Rating", icon: <Award className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
              Data-Driven Course Selection
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              GauchoCourse combines official UCSB data with student experiences to help you make informed decisions about your academic journey.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-center text-gray-400 mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400">Explore our features through this interactive guide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl mb-4">1. Search</div>
            <p className="text-gray-400">Find your course using our intuitive search interface</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl mb-4">2. Analyze</div>
            <p className="text-gray-400">Review comprehensive grade distributions and professor ratings</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl mb-4">3. Decide</div>
            <p className="text-gray-400">Make informed decisions based on real data and student experiences</p>
          </div>
        </div>
      </div>
    </div>
  );
}
