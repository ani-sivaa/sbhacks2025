// types/course.ts

export interface Course {
    course?: string;
    coursetitle?: string;
    dept?: string;
    description?: string;
    instructor?: string;
    prereqs?: string;
    quarter?: string;
    year?: number;
    units?: number;
    studentcomments?: string;
    avgGPA?: number;
    nLetterStudents?: number;
    wouldtakeagain?: string;
    difficultylevel?: number;
    // Grade distribution fields
    Ap?: number;
    A?: number;
    Am?: number;
    Bp?: number;
    B?: number;
    Bm?: number;
    Cp?: number;
    C?: number;
    Cm?: number;
    D?: number;
    F?: number;
  }
  
  export interface CourseOption {
    code: string;
    title: string;
  }
  
  export interface GradeData {
    grade: string;
    count: number;
    color: string;
  }