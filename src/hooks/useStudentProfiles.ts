import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, UserPlus, X, MapPin, BookOpen, Calendar, Users, Check, Loader2, MessageSquare, Shield, Clock, ChevronRight, Heart, Star, Award, Briefcase, Home, GraduationCap, Users2, Camera, Upload, Edit, Trash2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { saveData, loadData } from '../lib/storage';

// Types
export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  program: string;
  year: number;
  level: number;
  bio: string;
  location: {
    campus: string;
    city: string;
    country: string;
  };
  interests: string[];
  subjects: string[];
  skills: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    twitter?: string;
  };
  preferences?: {
    darkMode: boolean;
    notifications: boolean;
    studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    privacy: 'public' | 'friends' | 'private';
  };
  stats?: {
    streak: number;
    tasksCompleted: number;
    studyHours: number;
    gpa?: number;
    achievements: number;
  };
  joinDate: number;
  isOnline?: boolean;
  lastSeen?: number;
}

// Seed realistic student data with diverse backgrounds
function seedStudentProfiles(): StudentProfile[] {
  const now = Date.now();
  return [
    {
      id: 'profile_001',
      studentId: 'STU001',
      name: 'Amina Bello',
      email: 'amina.bello@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Amina&background=random',
      department: 'Computer Science',
      program: 'B.Sc. Software Engineering',
      year: 4,
      level: 4,
      bio: 'Passionate about AI and machine learning. Love solving complex problems and building cool projects. Currently working on a deep learning project for healthcare applications.',
      location: {
        campus: 'Main Campus',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Python', 'Machine Learning', 'Data Science', 'Open Source', 'Hackathons'],
      subjects: ['CS101', 'CS202', 'CS305', 'MATH201'],
      skills: ['Python', 'TensorFlow', 'React', 'Node.js', 'SQL', 'Git'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/aminabello',
        github: 'https://github.com/aminabello',
        instagram: 'https://instagram.com/aminabello'
      },
      preferences: {
        darkMode: true,
        notifications: true,
        studyStyle: 'visual',
        privacy: 'public'
      },
      stats: {
        streak: 12,
        tasksCompleted: 48,
        studyHours: 156,
        gpa: 4.2,
        achievements: 7
      },
      joinDate: now - 365 * 24 * 60 * 60 * 1000, // 1 year ago
      isOnline: true,
      lastSeen: now - 10 * 60 * 1000
    },
    {
      id: 'profile_002',
      studentId: 'STU002',
      name: 'Chukwuma Okoro',
      email: 'chukwuma.okoro@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Okoro&background=random',
      department: 'Mechanical Engineering',
      program: 'B.Eng. Manufacturing',
      year: 3,
      level: 3,
      bio: 'Dreaming of innovating manufacturing processes. Currently researching additive manufacturing and 3D printing for sustainable solutions.',
      location: {
        campus: 'Engineering Faculty',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['3D Printing', 'CAD', 'Manufacturing', ' robotics', 'Energy Systems'],
      subjects: ['ENG101', 'ENG202', 'MATH301', 'PHY101'],
      skills: ['SolidWorks', 'MATLAB', 'AutoCAD', 'Fusion 360', 'Arduino'],
      socialLinks: {
        github: 'https://github.com/chukwumaokoro',
        linkedin: 'https://linkedin.com/in/chukwu'
      },
      preferences: {
        darkMode: false,
        notifications: true,
        studyStyle: 'kinesthetic',
        privacy: 'friends'
      },
      stats: {
        streak: 8,
        tasksCompleted: 32,
        studyHours: 98,
        gpa: 3.6,
        achievements: 4
      },
      joinDate: now - 300 * 24 * 60 * 60 * 1000, // 300 days ago
      isOnline: false,
      lastSeen: now - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 'profile_003',
      studentId: 'STU003',
      name: 'Grace Okonkwo',
      email: 'grace.okonkwo@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Grace&background=random',
      department: 'Nursing',
      program: 'B.Sc. Nursing Science',
      year: 4,
      level: 4,
      bio: 'Future healthcare leader with a passion for patient education and community health. Volunteer at local clinics and mentor aspiring nurses.',
      location: {
        campus: 'Medical School',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Patient Care', 'Health Tech', 'Medical Research', 'Community Health'],
      subjects: ['NUR101', 'MED202', 'BIO101', 'CHEM101'],
      skills: ['First Aid', 'CPR', 'Patient Communication', 'Medical Documentation', 'Health Education'],
      socialLinks: {
        instagram: 'https://instagram.com/grace_okonkwo_nursing'
      },
      preferences: {
        darkMode: true,
        notifications: false,
        studyStyle: 'auditory',
        privacy: 'public'
      },
      stats: {
        streak: 15,
        tasksCompleted: 60,
        studyHours: 142,
        gpa: 4.0,
        achievements: 5
      },
      joinDate: now - 90 * 24 * 60 * 60 * 1000, // 90 days ago
      isOnline: true,
      lastSeen: now - 5 * 60 * 1000
    },
    {
      id: 'profile_004',
      studentId: 'STU004',
      name: 'David Adewale',
      email: 'david.adewale@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=David&background=random',
      department: 'Business Administration',
      program: 'MBA, Marketing',
      year: 2,
      level: 2,
      bio: 'Marketing enthusiast, data-driven decision maker. Looking for peers to discuss entrepreneurship and digital marketing strategies.',
      location: {
        campus: 'Business School',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Marketing', 'Digital Marketing', 'Branding', 'E-commerce', 'Analytics'],
      subjects: ['BUS101', 'MKT202', 'FIN301', 'MKT203'],
      skills: ['Photoshop', 'Google Analytics', 'Social Media', 'Content Marketing', 'Sales'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/davidadewale',
        github: 'https://github.com/davidadewale'
      },
      preferences: {
        darkMode: false,
        notifications: true,
        studyStyle: 'visual',
        privacy: 'friends'
      },
      stats: {
        streak: 4,
        tasksCompleted: 20,
        studyHours: 70,
        gpa: 3.4,
        achievements: 2
      },
      joinDate: now - 120 * 24 * 60 * 60 * 1000, // 120 days ago
      isOnline: false,
      lastSeen: now - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 'profile_005',
      studentId: 'STU005',
      name: 'Osei Asamo',
      email: 'osei.asamo@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Osei&background=random',
      department: 'Physics',
      program: 'B.Sc. Physics',
      year: 3,
      level: 3,
      bio: 'Physics aficionado, currently studying quantum mechanics. Hoping to join research groups and collaborative projects.',
      location: {
        campus: 'Physics Building',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Quantum Mechanics', 'Quantum Computing', 'Research', 'Programming', 'Physics Education'],
      subjects: ['PHY101', 'PHY202', 'PHY303', 'MATH401'],
      skills: ['Python', 'MATLAB', 'LabView', 'Research Methods'],
      socialLinks: {
        github: 'https://github.com/oseiasamo'
      },
      preferences: {
        darkMode: true,
        notifications: true,
        studyStyle: 'reading',
        privacy: 'public'
      },
      stats: {
        streak: 9,
        tasksCompleted: 35,
        studyHours: 100,
        gpa: 3.8,
        achievements: 3
      },
      joinDate: now - 120 * 24 * 60 * 60 * 1000, // 120 days ago
      isOnline: true,
      lastSeen: now - 30 * 60 * 1000
    },
    {
      id: 'profile_006',
      studentId: 'STU006',
      name: 'Fatima Aliyu',
      email: 'fatima.aliyu@unipulse.io',
      avatar: 'https ://api.dicebear.com/96x96/avataaars.svg?seed=Fatima&background=random',
      department: 'Agricultural Science',
      program: 'B.Sc. Agriculture',
      year: 1,
      level: 1,
      bio: 'Young agronomist eager to learn about sustainable farming and crop management. Seeking study partners for agriculture projects.',
      location: {
        campus: 'College of Agriculture',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Farming', 'Sustainable Agriculture', 'Soil Science', 'Crop Management', 'Organic Farming'],
      subjects: ['AGR101', 'AGR202', 'SOC101'],
      skills: ['Fieldwork', 'Soil Analysis', 'Crop Management', 'GIS', 'Data Collection'],
      socialLinks: {
        instagram: 'https://instagram.com/fatimaagri'
      },
      preferences: {
        darkMode: false,
        notifications: true,
        studyStyle: 'kinesthetic',
        privacy: 'public'
      },
      stats: {
        streak: 2,
        tasksCompleted: 8,
        studyHours: 30,
        gpa: 3.2,
        achievements: 1
      },
      joinDate: now - 60 * 24 * 60 * 60 * 1000, // 60 days ago
      isOnline: false,
      lastSeen: now - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 'profile_007',
      studentId: 'STU007',
      name: 'Jumoke Abiodun',
      email: 'jumoke.abiodun@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Jumoke&background=random',
      department: 'English Language & Linguistics',
      program: 'B.A. English Studies',
      year: 2,
      level: 2,
      bio: 'Passionate about literature and communication. Love writing poetry, analyzing texts, and teaching English effectively.',
      location: {
        campus: 'Arts Faculty',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Literature', 'Poetry', 'Teaching', 'Writing', 'Cultural Studies'],
      subjects: ['ENG101', 'LIT202', 'COM303', 'HIS201'],
      skills: ['Creative Writing', 'Public Speaking', 'Editing', 'Literary Analysis', 'Teaching'],
      socialLinks: {
        instagram: 'https://instagram.com/jumoke_writes'
      },
      preferences: {
        darkMode: true,
        notifications: false,
        studyStyle: 'auditory',
        privacy: 'friends'
      },
      stats: {
        streak: 5,
        tasksCompleted: 15,
        studyHours: 45,
        gpa: 3.5,
        achievements: 2
      },
      joinDate: now - 80 * 24 * 60 * 60 * 1000, // 80 days ago
      isOnline: true,
      lastSeen: now - 20 * 60 * 1000
    },
    {
      id: 'profile_008',
      studentId: 'STU008',
      name: 'Samuel Okonkwo',
      email: 'samuel.okonkwo@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Samuel&background=random',
      department: 'Economics',
      program: 'B.Sc. Economics',
      year: 4,
      level: 4,
      bio: 'Economics enthusiast interested in finance, policy, and development economics. Looking for study partners for quantitative methods and econometrics.',
      location: {
        campus: 'Business School',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Econometrics', 'Finance', 'Development Economics', 'Policy Analysis', 'Statistics'],
      subjects: ['ECO101', 'ECO202', 'ECO303', 'MATH401'],
      skills: ['Excel', 'Stata', 'R', 'SPSS', 'Economic Modeling'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/samuelokonkwo',
        github: 'https://github.com/samuelokonkwo'
      },
      preferences: {
        darkMode: false,
        notifications: true,
        studyStyle: 'visual',
        privacy: 'public'
      },
      stats: {
        streak: 14,
        tasksCompleted: 40,
        studyHours: 120,
        gpa: 3.9,
        achievements: 6
      },
      joinDate: now - 180 * 24 * 60 * 60 * 1000, // 180 days ago
      isOnline: false,
      lastSeen: now - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 'profile_009',
      studentId: 'STU009',
      name: 'Rufus Adebayo',
      email: 'rufus.adebayo@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Rufus&background=random',
      department: 'Computer Science',
      program: 'B.Sc. Computer Science',
      year: 3,
      level: 3,
      bio: 'Full-stack developer in the making. Passionate about building web apps, APIs, and exploring cloud technologies.',
      location: {
        campus: 'CS Building',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Web Development', 'Cloud Computing', 'DevOps', 'React', 'Node.js'],
      subjects: ['CS101', 'CS202', 'CS305', 'CS402'],
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'],
      socialLinks: {
        github: 'https://github.com/rufusadebayo',
        linkedin: 'https://linkedin.com/in/rufusadebayo'
      },
      preferences: {
        darkMode: true,
        notifications: true,
        studyStyle: 'visual',
        privacy: 'public'
      },
      stats: {
        streak: 18,
        tasksCompleted: 55,
        studyHours: 180,
        gpa: 4.0,
        achievements: 8
      },
      joinDate: now - 220 * 24 * 60 * 60 * 1000, // 220 days ago
      isOnline: true,
      lastSeen: now - 5 * 60 * 1000
    },
    {
      id: 'profile_010',
      studentId: 'STU010',
      name: 'Esther Nkechi',
      email: 'esther.nkechi@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Esther&background=random',
      department: 'Medicine',
      program: 'MBBS',
      year: 5,
      level: 5,
      bio: 'Medical student on track to be a surgeon. Love anatomy, surgery, and helping patients. Seeking study partners for clinical rotations.',
      location: {
        campus: 'Medical School',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Surgery', 'Anatomy', 'Clinical Practice', 'Medical Ethics', 'Healthcare Leadership'],
      subjects: ['MED101', 'MED202', 'MED303', 'MED404'],
      skills: ['Patient Care', 'Medical Ethics', 'Surgical Skills', 'Clinical Diagnosis', 'Medical Communication'],
      socialLinks: {
        instagram: 'https://instagram.com/esther_medicine'
      },
      preferences: {
        darkMode: false,
        notifications: true,
        studyStyle: 'reading',
        privacy: 'friends'
      },
      stats: {
        streak: 22,
        tasksCompleted: 65,
        studyHours: 210,
        gpa: 4.1,
        achievements: 10
      },
      joinDate: now - 365 * 24 * 60 * 60 * 1000, // 1 year ago
      isOnline: false,
      lastSeen: now - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 'profile_011',
      studentId: 'STU011',
      name: 'Michael Okafor',
      email: 'michael.okafor@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Michael&background=random',
      department: 'Industrial Chemistry',
      program: 'B.Sc. Industrial Chemistry',
      year: 4,
      level: 4,
      bio: 'Chemistry enthusiast, focusing on analytical methods and environmental chemistry. Looking for study groups for lab techniques and data analysis.',
      location: {
        campus: 'Chemistry Department',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Analytical Chemistry', 'Environmental Chemistry', 'Lab Techniques', 'Research', 'Data Analysis'],
      subjects: ['CHM101', 'CHM202', 'CHM303', 'CHM404'],
      skills: ['Spectroscopy', 'Chromatography', 'Lab Techniques', 'Statistical Analysis', 'Research Methods'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/michaelokafor'
      },
      preferences: {
        darkMode: true,
        notifications: false,
        studyStyle: 'kinesthetic',
        privacy: 'public'
      },
      stats: {
        streak: 11,
        tasksCompleted: 38,
        studyHours: 130,
        gpa: 3.7,
        achievements: 5
      },
      joinDate: now - 100 * 24 * 60 * 60 * 1000, // 100 days ago
      isOnline: true,
      lastSeen: now - 15 * 60 * 1000
    },
    {
      id: 'profile_012',
      studentId: 'STU012',
      name: 'Folasade Adegoke',
      email: 'folasade.adegoke@unipulse.io',
      avatar: 'https://api.dicebear.com/96x96/avataaars.svg?seed=Folasade&background=random',
      department: 'Architecture',
      program: 'B.ARCH',
      year: 5,
      level: 5,
      bio: 'Architecture student with a passion for sustainable design. Working on eco-friendly building projects and design competitions.',
      location: {
        campus: 'Architecture Faculty',
        city: 'Jos',
        country: 'Nigeria'
      },
      interests: ['Sustainable Design', 'Eco Architecture', '3D Modeling', 'Design Competitions', 'Urban Planning'],
      subjects: ['ARC101', 'ARC202', 'ARC303', 'ARC404'],
      skills: ['AutoCAD', 'SketchUp', 'Revit', '3D Printing', 'Sustainable Design'],
      socialLinks: {
        instagram: 'https://instagram.com/folasade_arch',
        github: 'https://github.com/folasade-arch'
      },
      preferences: {
        darkMode: false,
        notifications: true,
        studyStyle: 'visual',
        privacy: 'friends'
      },
      stats: {
        streak: 13,
        tasksCompleted: 42,
        studyHours: 150,
        gpa: 3.9,
        achievements: 7
      },
      joinDate: now - 130 * 24 * 60 * 60 * 1000, // 130 days ago
      isOnline: true,
      lastSeen: now - 10 * 60 * 1000
    }
  ];
}

const LOCAL_STORAGE_KEY = 'unipulse_student_profiles';

export const useStudentProfiles = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : seedStudentProfiles();
    } catch {
      return seedStudentProfiles();
    }
  });

  const saveProfiles = useCallback((newProfiles: StudentProfile[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfiles));
    setProfiles(newProfiles);
  }, []);

  const getProfileById = useCallback((id: string) => profiles.find(p => p.id === id), [profiles]);
  const getProfileByStudentId = useCallback((studentId: string) => profiles.find(p => p.studentId === studentId), [profiles]);
  const getProfileByEmail = useCallback((email: string) => profiles.find(p => p.email === email), [profiles]);

  const addProfile = useCallback((newProfile: StudentProfile) => {
    const updated = [...profiles, newProfile];
    saveProfiles(updated);
  }, [profiles, saveProfiles]);

  const updateProfile = useCallback((updated: StudentProfile) => {
    const next = profiles.map(p => p.id === updated.id ? updated : p);
    saveProfiles(next);
  }, [profiles, saveProfiles]);

  const deleteProfile = useCallback((id: string) => {
    const next = profiles.filter(p => p.id !== id);
    saveProfiles(next);
  }, [profiles, saveProfiles]);

  const matchProfiles = useCallback((filters: Partial<StudentProfile>) => {
    return profiles.filter(p => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.year && p.year !== filters.year) return false;
      if (filters.interests?.length && !filters.interests.some(i => p.interests.includes(i))) return false;
      if (filters.location?.city && p.location.city !== filters.location.city) return false;
      return true;
    });
  }, [profiles]);

  const findStudyPartners = useCallback((currentUserId: string, subject?: string, interests?: string[]) => {
    return profiles
      .filter(p => p.id !== currentUserId)
      .filter(p => {
        if (subject && p.subjects?.includes(subject)) return true;
        if (interests?.length && interests.some(i => p.interests.includes(i))) return true;
        return false;
      });
  }, [profiles]);

  return {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfileById,
    getProfileByStudentId,
    getProfileByEmail,
    matchProfiles,
    findStudyPartners,
  };
};

export default useStudentProfiles;
