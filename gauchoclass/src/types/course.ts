export interface Course {
    course: string;
    instructor: string;
    quarter: string;
    year: number;
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
    nLetterStudents: number;
    nPNPStudents: number;
    avgGPA: number;
    P: number;
    dept: string;
    S: number;
    su: number;
    Ap: number;
    Bp: number;
    Cp: number;
    Dp: number;
    Am: number;
    Bm: number;
    Cm: number;
    Dm: number;
    IP: number;
    coursetitle: string;
    units: string;
    prereqs: string;
    description: string;
    overallrating: string;
    studentcomments: string;
    reviewcount: number;
    wouldtakeagain: string;
    difficultylevel: number;
  }
  
  export interface GradeData {
    grade: string;
    count: number;
    color: string;
  }
  
  export interface CourseOption {
    code: string;
    title: string;
  }