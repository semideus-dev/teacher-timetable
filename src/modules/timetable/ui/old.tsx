"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Edit2,
  Save,
  X,
  BarChart3,
  Users,
  BookOpen,
  Clock,
  Calendar,
  Moon,
  Sun,
} from "lucide-react";

// Complete timetable data in JSON format
const timetableData = {
  "MSc(IT) Semester-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "Fuzzy Systems",
        code: "MIT02004T",
        teacher: "Navneet Kaur",
        room: "R-34",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Network Design and Performance Analysis",
        code: "MIT02005T",
        teacher: "Sandeep Bassi",
        room: "R-34",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "Image Processing",
        code: "MIT02003T",
        teacher: "Ravinder Kaur",
        room: "R-34",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "Distributed Databases",
        code: "MIT02002T",
        teacher: "Ratnakar",
        room: "R-34",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "Programming Lab – II",
        code: "MIT02006L",
        teacher: "Jaspreet Saini",
        room: "R & D Lab",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Mobile Computing",
        code: "MIT02001T",
        teacher: "Dr. Sandeep Singh",
        room: "R-34",
        days: "(1-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "MSc(IT) Semester-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "Advanced Java Technology",
        code: "MIT04001T",
        teacher: "Dr. MS Lehal",
        room: "R-33",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Network Security",
        code: "MIT04002T",
        teacher: "Dr. Daljit Kaur",
        room: "R-33",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "Programming Lab –IV (Advanced Java Technology)",
        code: "MIT04004L",
        teacher: "Dr. MS Lehal",
        room: "Lab-III",
        days: "(1-3)",
      },
      {
        time: "12:00-12:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:45-1:30",
        subject: "Artificial Neural Network",
        code: "MIT04003T",
        teacher: "MS Bhatia",
        room: "R-33",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Project Work",
        code: "MIT04005L",
        teacher: "SK Anand",
        room: "Lab-III",
        days: "(4-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BSc(IT) Semester-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "Drug Abuse",
        code: "SOA-105",
        teacher: "NEW",
        room: "R-NR4",
        days: "(5-6)",
      },
      {
        time: "9:45-10:30",
        subject: "C-lab",
        code: "P-II",
        teacher: "Rakhi",
        room: "Lab-III",
        days: "(1-3)",
      },
      {
        time: "10:30-11:15",
        subject: "Pbi / Basic Pbi",
        code: "PBL602 / PBL612",
        teacher: "NEW",
        room: "R-NR4 / R-12",
        days: "(1-3)/(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "Electronics",
        code: "P-III",
        teacher: "Dr. Sandeep Singh",
        room: "R-NR4",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "NM",
        code: "P-IV",
        teacher: "Vaishali Gupta",
        room: "R-NR4",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "Programming in C",
        code: "P-I",
        teacher: "SK Anand",
        room: "R-NR4",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Comm. Skills",
        code: "ENL-ENP122",
        teacher: "NEW",
        room: "R-NR4",
        days: "(4-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BSc(IT) Semester-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "EVS",
        code: "EVS-221",
        teacher: "Dr. Jaswinder Kaur",
        room: "R-32",
        days: "(4-6)",
      },
      {
        time: "9:45-10:30",
        subject: "Human Computer Interaction",
        code: "P-IX",
        teacher: "Ravinder Kaur",
        room: "R-32",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "DBMS",
        code: "P-V",
        teacher: "Sonu Gupta",
        room: "R-32",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "OS LAB",
        code: "P-IV",
        teacher: "Karitika",
        room: "LAB-PT",
        days: "(1-3)",
      },
      {
        time: "12:00-12:45",
        subject: "OS",
        code: "P-III",
        teacher: "Karitika",
        room: "R-32",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "C++",
        code: "P-I",
        teacher: "Heena",
        room: "R-32",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Computer Graphics",
        code: "P-VII",
        teacher: "Dr. MS Lehal",
        room: "R-32",
        days: "(1-6)",
      },
      {
        time: "2:15-3:00",
        subject: "C++ LAB/ DBMS LAB",
        code: "P-II/P-VI",
        teacher: "Vaishali Gupta/ Heena",
        room: "LAB-II",
        days: "(1-3) /(4-6)",
      },
    ],
  },
  "BSc(IT) Semester-VI": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "Project",
        code: "P-III(BIT06006L)",
        teacher: "MS Bhatia",
        room: "LAB-V",
        days: "(4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "NOS",
        code: "P-I (BIT06003T)",
        teacher: "MS Bhatia",
        room: "R-30",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:00-12:45",
        subject: "NOS",
        code: "P-II (BIT06004L)",
        teacher: "MS Bhatia",
        room: "LAB-V",
        days: "(1-3)",
      },
      {
        time: "12:45-1:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BCA Sem-II A": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "Drug Abuse",
        code: "SOA105",
        teacher: "NEW",
        room: "R-NR4",
        days: "(5-6)",
      },
      {
        time: "9:45-10:30",
        subject: "NM",
        code: "P-IV",
        teacher: "Vaishali Gupta",
        room: "R-NR3",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Pbi / Basic Pbi",
        code: "PBL602 / PBL612",
        teacher: "NEW",
        room: "NR3 / R-12",
        days: "(1-3)/(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "C",
        code: "P-I",
        teacher: "SK Anand",
        room: "R-NR3",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "ELECTRONICS",
        code: "P-III",
        teacher: "JASDEEP SINGH",
        room: "R-NR3",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "C LAB",
        code: "P-II",
        teacher: "Ravinder Kaur",
        room: "Lab-SD",
        days: "G1(1-3)",
      },
      {
        time: "1:30-2:15",
        subject: "C LAB/ COMM SKILLS",
        code: "ENL/ENP122",
        teacher: "SK Anand /",
        room: "R-NR3",
        days: "(1-3)/G2(4-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BCA Sem-II B": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "C Lab /Drug Abuse",
        code: "P-II/ SOA105",
        teacher: "JASDEEP SINGH",
        room: "SD LAB/ R-NR4",
        days: "G1(1-3)/(5-6)",
      },
      {
        time: "9:45-10:30",
        subject: "C LAB",
        code: "P-II",
        teacher: "Karitika",
        room: "Lab-I",
        days: "G2(4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Pbi / Basic Pbi",
        code: "PBL602 / PBL612",
        teacher: "NEW",
        room: "R-NR4 / R-12",
        days: "(1-3)/(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "ELECTRONICS",
        code: "P-III",
        teacher: "Dr. Sandeep Singh",
        room: "R-NR4",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "NM",
        code: "P-IV",
        teacher: "Vaishali Gupta",
        room: "R-NR4",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "C",
        code: "P-I",
        teacher: "SK Anand",
        room: "R-NR4",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Comm. Skills",
        code: "ENL/ENP122",
        teacher: "NEW",
        room: "R-NR4",
        days: "(1-3)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BCA Sem-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "EVS",
        code: "ESL221",
        teacher: "Dr. Jaswinder Kaur",
        room: "R-32",
        days: "(1-3)",
      },
      {
        time: "9:45-10:30",
        subject: "Compiler Design",
        code: "BCA04012T",
        teacher: "JASDEEP SINGH",
        room: "R-39",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "C++",
        code: "BCA04007T",
        teacher: "Navneet Kaur",
        room: "R-39",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "DBMS",
        code: "BCA04009T",
        teacher: "Heena",
        room: "R-39",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "C++ LAB",
        code: "BCA04008L",
        teacher: "Navneet Kaur/ Ravinder Kaur",
        room: "LAB-I",
        days: "G1(1-3) / G2(4-6)",
      },
      {
        time: "12:45-1:30",
        subject: "Security in Computing",
        code: "BCA04012T",
        teacher: "Dr. Daljit Kaur",
        room: "R-39",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "COMP. N/W",
        code: "BCA04011T",
        teacher: "Sandeep Bassi",
        room: "R-39",
        days: "(1-6)",
      },
      {
        time: "2:15-3:00",
        subject: "DBMS LAB",
        code: "BCA04010L",
        teacher: "Rakhi / Vaishali Gupta",
        room: "LAB-III",
        days: "(1-3)/(4-6)",
      },
    ],
  },
  "BCA Sem-VI": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "10:30-11:15",
        subject: "GRAPHICS LAB / PROJECT",
        code: "BCA06003L / BCA06004L",
        teacher: "Vaishali Gupta / Heena",
        room: "LAB-IV/ LAB-CYBER",
        days: "(1-3)/(4-6)",
      },
      {
        time: "11:15-12:00",
        subject: "COMP N/W",
        code: "BCA06002T",
        teacher: "MS Bhatia",
        room: "R-33",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "GRAPHICS",
        code: "BCA06001T",
        teacher: "Dr. MS Lehal",
        room: "R-33",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "Project / GRAPHICS LAB",
        code: "BCA06004L / BCA06003L",
        teacher: "Sandeep Bassi / Dr. MS Lehal",
        room: "LAB-CYBER / LAB-IV",
        days: "(1-3) / (4-6)",
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: "PROJECT",
        code: "BCA06004L",
        teacher: "Sonu Gupta/JASDEEP SINGH",
        room: "LAB-CYBER",
        days: "(1-3)/(4-6)",
      },
    ],
  },
  "B.Voc. (SD)-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "LAB C++/ Lab Data Structures",
        code: "BSD02004L OOPLab/ BSD02005L",
        teacher: "Dr. Daljit Kaur/ Dr. Sandeep Singh",
        room: "LAB-PT",
        days: "(1-3)/(4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Lab Data Structures/ Punjabi",
        code: "BSD02005L/ Pbi",
        teacher: "Dr. Sandeep Singh",
        room: "LAB-PT / R-NR4",
        days: "(1-3)/(4-6)",
      },
      {
        time: "11:15-12:00",
        subject: "OOPS",
        code: "BSD02003T",
        teacher: "TARANDEEP SAINI",
        room: "R-42",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "DATA STRUCTURES",
        code: "BSD02002T",
        teacher: "Dr. Sandeep Singh",
        room: "R-42",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "Internet Applications",
        code: "BSD02001T",
        teacher: "Navneet Kaur",
        room: "R-42",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Comm. Skills/ OOPS LAB",
        code: "ENP122/ BSD02004L",
        teacher: "Dr. Daljit Kaur",
        room: "R-NR4 / LAB-SD",
        days: "(1-3) /(4-6)",
      },
      {
        time: "2:15-3:00",
        subject: "Drug Abuse/C.Skills",
        code: "SOA-105/",
        teacher: "NEW",
        room: "R-NR4",
        days: "(5-6)/(1-3)",
      },
    ],
  },
  "B.Voc. (SD)-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "EVS-222",
        code: "EVS",
        teacher: "Dr. Jaswinder Kaur",
        room: "R-32",
        days: "(4-6)",
      },
      {
        time: "9:45-10:30",
        subject: "PYTHON",
        code: "BSD04003T",
        teacher: "Ratnakar",
        room: "R-43",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "ANDROID LAB",
        code: "BBSD04004L",
        teacher: "JASDEEP SINGH",
        room: "LAB-SKILL",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "INFORMATION SECURITY",
        code: "BSD04002T",
        teacher: "Sandeep Bassi",
        room: "R-43",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "OPEN SOURCE SOFTWARE",
        code: "BSD04001T",
        teacher: "Sonu Gupta",
        room: "R-43",
        days: "(1-6)",
      },
      {
        time: "12:45-1:30",
        subject: "PYTHON LAB",
        code: "BSD04005L",
        teacher: "Ratnakar",
        room: "LAB-PT",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "MINOR PROJECT",
        code: "BSD04006L",
        teacher: "Heena",
        room: "LAB-PT",
        days: "(1-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "B.Voc. (SD)-VI": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "10:30-11:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "11:15-12:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:00-12:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:45-1:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: "PROJECT",
        code: "BSD06001L",
        teacher: "Navneet Kaur/Dr. Daljit Kaur",
        room: "LAB-SD",
        days: "G1/G2",
      },
    ],
  },
  "BDMM-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "Drawing & Colour–II",
        code: "BDM02001L",
        teacher: "Sonia",
        room: "LAB-FA",
        days: "(1-3)",
      },
      {
        time: "9:45-10:30",
        subject: "Introduction to 3D–II",
        code: "BDM02002L",
        teacher: "Sonali",
        room: "Lab-MM",
        days: "(4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Pbi./Basic Pbi",
        code: "PBL602 / PBL612",
        teacher: "NEW",
        room: "R-NR4/ R-12",
        days: "(4-6)/(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "Drug Abuse",
        code: "SOA-105",
        teacher: "NEW",
        room: "R-52",
        days: "(1-2)",
      },
      {
        time: "12:00-12:45",
        subject: "Workshop–II /Theory of Media",
        code: "BDM02004L/BDM02003T",
        teacher: "Onkar / Rajat",
        room: "Lab-Anm/R-30",
        days: "(1-3)/(4-6)",
      },
      {
        time: "12:45-1:30",
        subject: "Adobe Illustrator",
        code: "BDM02005L",
        teacher: "Annie",
        room: "LAB-MM",
        days: "(1-3)",
      },
      {
        time: "1:30-2:15",
        subject: "Comm. Skills",
        code: "ENL/ENP122",
        teacher: "NEW",
        room: "R-NR4",
        days: "(1-3)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BDMM-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "Java Script",
        code: "BDM04004L",
        teacher: "MEGHA",
        room: "LAB-I",
        days: "(1-6)",
      },
      {
        time: "9:45-10:30",
        subject: "AI and Cloud Computing",
        code: "BDM04005L",
        teacher: "Rachana",
        room: "LAB-ANM",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Project– II",
        code: "BDM04008L",
        teacher: "Onkar",
        room: "LAB-ANM",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:00-12:45",
        subject: "Film Appreciation–II",
        code: "BDM04007L,BDM04006T",
        teacher: "Sonali",
        room: "Lab-Anm/R-39",
        days: "(1-3)/(4-6)",
      },
      {
        time: "12:45-1:30",
        subject: "FLASH",
        code: "BDM04002T, BDM04003L",
        teacher: "Rachana",
        room: "LAB-ANM/LAB-ANM",
        days: "(1-3)/(4-6)",
      },
      {
        time: "1:30-2:15",
        subject: "EVS",
        code: "EVS-221",
        teacher: "Dr. Jaswinder Kaur",
        room: "R-31",
        days: "(4-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BDMM-VI": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "3D Studio Max",
        code: "6002L",
        teacher: "Sonali",
        room: "LAB-MM",
        days: "(1-3)",
      },
      {
        time: "10:30-11:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "11:15-12:00",
        subject: "Workshop–IV & Blender",
        code: "6005L & 6006L",
        teacher: "Onkar",
        room: "LAB-ANM",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "Project – IV",
        code: "6007L",
        teacher: "Annie",
        room: "LAB-SKILL",
        days: "(1-3)",
      },
      {
        time: "12:45-1:30",
        subject: "Drawing & Illustration",
        code: "6004L",
        teacher: "Sonia",
        room: "LAB-FA",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Introduction to 3D",
        code: "6003T",
        teacher: "Sonali",
        room: "LAB-SKILL",
        days: "(1-3)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BDMM-VIII": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "10:30-11:15",
        subject: "3D Human Modeling",
        code: "P-III",
        teacher: "Sonali",
        room: "LAB-PT",
        days: "(4-6)",
      },
      {
        time: "11:15-12:00",
        subject: "Motion Graphics",
        code: "P-II",
        teacher: "Annie",
        room: "LAB-MM",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:45-1:30",
        subject: "3D & Animation",
        code: "P-I",
        teacher: "Onkar",
        room: "LAB-MM",
        days: "(4-6)",
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: "Industrial Training",
        code: "P-IV",
        teacher: "Onkar",
        room: "LAB-SKILL",
        days: "(4-6)",
      },
    ],
  },
  "BAJMC Semester-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "Design & Graphics (LT)",
        code: "P-III",
        teacher: "Anjali",
        room: "Lab-Media",
        days: "(1-6)",
      },
      {
        time: "9:45-10:30",
        subject: "Press Laws and Media Ethics",
        code: "P-I",
        teacher: "Monika",
        room: "R-NR2",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "Pbi./Basic Pbi",
        code: "PBL602 / PBL612",
        teacher: "NEW",
        room: "R-NR4/ R-12",
        days: "(4-6)/(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:00-12:45",
        subject: "Photography and Photo Journalism",
        code: "SEC",
        teacher: "Monika",
        room: "lab-Media/ R-NR2",
        days: "(4-6)/(1-3)",
      },
      {
        time: "12:45-1:30",
        subject: "Mass Communication : Concepts and Processes",
        code: "P-II",
        teacher: "Rajat Kaur",
        room: "Lab- Media(B)",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "Comm. Skills",
        code: "ENL/ENP122",
        teacher: "NEW",
        room: "R-NR4",
        days: "(1-3)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BAJMC Semester-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: "VIDEO PROD.",
        code: "BJM04004T",
        teacher: "Monika",
        room: "R-30",
        days: "(1-6)",
      },
      {
        time: "9:45-10:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "10:30-11:15",
        subject: "THEATER STUDIES",
        code: "BJM040011T",
        teacher: "Rajat",
        room: "Lab-Media",
        days: "(4-6)",
      },
      {
        time: "11:15-12:00",
        subject: "RADIO&TV/ ADVERTISING",
        code: "BJM04003T &BJM04006T",
        teacher: "Rajat",
        room: "R-31",
        days: "(1-3)/(4-6)",
      },
      {
        time: "12:00-12:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:45-1:30",
        subject: "FOLK MEDIA",
        code: "BJM04005T",
        teacher: "Anjali",
        room: "R-31",
        days: "(1-6)",
      },
      {
        time: "1:30-2:15",
        subject: "RADIO&TVLAB/MEDIA COMM",
        code: "BJM04008L/BJM04002T",
        teacher: "Anjali/Rajat Kaur",
        room: "Lab-Media /R-31",
        days: "(1-3)/(4-6)",
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "BAJMC Semester-VI": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "AUDIO LAB/REPORTING LAB",
        code: "P-606 & P-607",
        teacher: "Anjali/ Rajat Kaur",
        room: "Lab-Media",
        days: "(1-3) & (4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "AUDIO SOUND/ GLOBAL MEDIA",
        code: "P-603 & P-601",
        teacher: "Monika/ Anjali",
        room: "R-NR2",
        days: "(1-3) & (4-6)",
      },
      {
        time: "11:15-12:00",
        subject: "CURRENT AFFAIRS",
        code: "P-602",
        teacher: "Anjali",
        room: "R-NR2",
        days: "(1-3)",
      },
      {
        time: "12:00-12:45",
        subject: "REPORTING",
        code: "P-605",
        teacher: "Rajat",
        room: "Lab-Media",
        days: "(1-3)",
      },
      {
        time: "12:45-1:30",
        subject: "FILM PROJECT/ FILM PROD.",
        code: "P-608 & P-604",
        teacher: "Monika",
        room: "Lab-Media(A)",
        days: "(1-3) & (4-6)",
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "M.Voc (WT&MM)-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "SCRIPTING LAB/ VIDEO EDIT",
        code: "MWT02004L/ MWT02001L",
        teacher: "Karitika / Annie",
        room: "Lab-Skill / Lab-III",
        days: "(1-3) / (4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "VISUAL EFFECTS",
        code: "MWT02002L",
        teacher: "Sonali",
        room: "Lab-MM",
        days: "(1-3)",
      },
      {
        time: "11:15-12:00",
        subject: "DIGITAL MEDIA LAWS",
        code: "MWT02005T",
        teacher: "Ratnakar",
        room: "R-33",
        days: "(1-3)",
      },
      {
        time: "12:00-12:45",
        subject: "STOP MOTION",
        code: "MWT02003L",
        teacher: "Annie",
        room: "Lab-MM",
        days: "(4-6)",
      },
      {
        time: "12:45-1:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "M.Voc (WT&MM)-IV": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "10:30-11:15",
        subject: "ADVANCED 3D",
        code: "MWT04001L",
        teacher: "Annie",
        room: "Lab-SD",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "DIGITAL PAINTING",
        code: "MWT04002L",
        teacher: "Sonali",
        room: "Lab-Skill",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: "DIGITAL PORTFOLIO",
        code: "MWT04003L",
        teacher: "Onkar",
        room: "Lab-Skill",
        days: "(4-6)",
      },
      {
        time: "12:45-1:30",
        subject: "INTERNSHIP",
        code: "MWT04004L",
        teacher: "Rakhi",
        room: "Lab-Skill",
        days: "(4-6)",
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "PGDCA-II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "C LAB/ WEB DESIGN",
        code: "PCA02004L / PCA02005T",
        teacher: "TARANDEEP SAINI / Rakhi",
        room: "Lab-I / R-NR1",
        days: "(1-3) / (4-6)",
      },
      {
        time: "10:30-11:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "11:15-12:00",
        subject: "C/ E-COMM",
        code: "PCA02003T / PCA2010L",
        teacher: "Dr. Daljit Kaur / Sonu Gupta",
        room: "R-NR1 / Lab-1",
        days: "(1-3)/ (4-6)",
      },
      {
        time: "12:00-12:45",
        subject: "N-W/ WEB LAB",
        code: "PCA02001T & PCA02006L",
        teacher: "Jaspreet Saini/ Sandeep Bassi",
        room: "R-NR1/Lab-II",
        days: "(1-3) & (4-6)",
      },
      {
        time: "12:45-1:30",
        subject: "E-COM/N-W LAB",
        code: "PCA02009T / PCA02002L",
        teacher: "Sonu Gupta / Vaishali Gupta",
        room: "R-NR1 / Lab-II",
        days: "(1-3) / (4-6)",
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "Certificate in Computer Application -II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "PC COMPUTING-II",
        code: "DCA02003T",
        teacher: "Karanbir S. Kler",
        room: "R-38",
        days: "(1-6)",
      },
      {
        time: "10:30-11:15",
        subject: "DBMS",
        code: "DCA02001T",
        teacher: "Rakhi",
        room: "R-38",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:00-12:45",
        subject: "DBMS LAB/ PC-II LAB",
        code: "DCA02002L / DCA02004L",
        teacher: "TARANDEEP SAINI / Karanbir S. Kler",
        room: "Lab-VI / LAB-VI",
        days: "(1-3) / (4-6)",
      },
      {
        time: "12:45-1:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "Certificate in Computer Maintenance -II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "10:30-11:15",
        subject: "N/W MGT.",
        code: "DCM02001T",
        teacher: "Karanbir S. Kler",
        room: "R-43",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:00-12:45",
        subject: "S/W INSTALL.",
        code: "DCM02003L",
        teacher: "Jaspreet Saini",
        room: "Lab-IV",
        days: "(4-6)",
      },
      {
        time: "12:45-1:30",
        subject: "N-W MGT/ WORKSHOP",
        code: "DCM02004L / DCM02002L",
        teacher: "Rakhi / Karitika",
        room: "Lab-I",
        days: "(1-3) / (4-6)",
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
  "Certificate in Computer Animation -II": {
    timeSlots: [
      {
        time: "9:00-9:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "9:45-10:30",
        subject: "COREL/ FLASH",
        code: "DAN02003L / DAN02004L",
        teacher: "Sonu Gupta / TARANDEEP SAINI",
        room: "Lab-II",
        days: "(1-3) / (4-6)",
      },
      {
        time: "10:30-11:15",
        subject: "2D",
        code: "DAN02002T",
        teacher: "Karitika",
        room: "R-NR5",
        days: "(1-6)",
      },
      {
        time: "11:15-12:00",
        subject: "MULTIMEDIA TECH.",
        code: "DAN02001T",
        teacher: "MEGHA",
        room: "R-NR5",
        days: "(1-6)",
      },
      {
        time: "12:00-12:45",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "12:45-1:30",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "1:30-2:15",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
      {
        time: "2:15-3:00",
        subject: null,
        code: null,
        teacher: null,
        room: null,
        days: null,
      },
    ],
  },
};

const TimetableDashboard = () => {
  const [theme, setTheme] = useState("system");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("program"); // 'program', 'teacher', 'room', 'class'

  const allTeachers = useMemo(() => {
    const teachers = new Set();
    Object.values(timetableData).forEach((program) => {
      program.timeSlots.forEach((slot) => {
        if (slot.teacher) {
          slot.teacher.split("/").forEach((t) => {
            const teacher = t.trim();
            if (teacher && teacher !== "NEW") {
              teachers.add(teacher);
            }
          });
        }
      });
    });
    return Array.from(teachers).sort();
  }, []);

  const allRooms = useMemo(() => {
    const rooms = new Set();
    Object.values(timetableData).forEach((program) => {
      program.timeSlots.forEach((slot) => {
        if (slot.room) {
          slot.room.split("/").forEach((r) => rooms.add(r.trim()));
        }
      });
    });
    return Array.from(rooms).sort();
  }, []);

  const allClasses = useMemo(() => {
    return Object.keys(timetableData).sort();
  }, []);

  // Get filtered data based on current view mode
  const getFilteredTimetableData = useMemo(() => {
    if (viewMode === "teacher" && filterTeacher) {
      const teacherSchedule: any[] = [];
      Object.entries(timetableData).forEach(([className, programData]) => {
        programData.timeSlots.forEach((slot) => {
          if (slot.teacher && slot.subject) {
            const teachers = slot.teacher.split("/").map((t) => t.trim());
            if (teachers.some((t) => t === filterTeacher)) {
              teacherSchedule.push({
                time: slot.time,
                subject: slot.subject,
                code: slot.code,
                class: className,
                room: slot.room,
                days: slot.days,
              });
            }
          }
        });
      });
      return teacherSchedule;
    } else if (viewMode === "room" && filterRoom) {
      const roomSchedule: any[] = [];
      Object.entries(timetableData).forEach(([className, programData]) => {
        programData.timeSlots.forEach((slot) => {
          if (slot.room && slot.subject) {
            const rooms = slot.room.split("/").map((r) => r.trim());
            if (rooms.some((r) => r === filterRoom)) {
              roomSchedule.push({
                time: slot.time,
                subject: slot.subject,
                code: slot.code,
                class: className,
                teacher: slot.teacher,
                days: slot.days,
              });
            }
          }
        });
      });
      return roomSchedule;
    } else if (viewMode === "class" && filterClass) {
      return timetableData[filterClass as keyof typeof timetableData] || null;
    }
    return null;
  }, [viewMode, filterTeacher, filterRoom, filterClass]);

  const statistics = useMemo(() => {
    let totalClasses = 0;
    const totalTeachers = new Set();
    const totalRooms = new Set();

    Object.values(timetableData).forEach((program) => {
      program.timeSlots.forEach((slot) => {
        if (slot.subject) totalClasses++;
        if (slot.teacher) {
          slot.teacher.split("/").forEach((t) => {
            const teacher = t.trim();
            if (teacher && teacher !== "NEW") {
              totalTeachers.add(teacher);
            }
          });
        }
        if (slot.room) {
          slot.room.split("/").forEach((r) => totalRooms.add(r.trim()));
        }
      });
    });

    return {
      totalPrograms: Object.keys(timetableData).length,
      totalClasses,
      totalTeachers: totalTeachers.size,
      totalRooms: totalRooms.size,
    };
  }, []);

  const filteredPrograms = useMemo(() => {
    return Object.entries(timetableData).filter(([name, data]) => {
      const matchesSearch = name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTeacher) {
        const hasTeacher = data.timeSlots.some(
          (slot) =>
            slot.teacher &&
            slot.teacher.toLowerCase().includes(filterTeacher.toLowerCase())
        );
        if (!hasTeacher) return false;
      }

      return true;
    });
  }, [searchQuery, filterTeacher]);

  const parseDayRange = (dayStr: any) => {
    if (!dayStr) return [];
    const matches = dayStr.match(/\((\d+)-(\d+)\)/g);
    if (!matches) return [];

    const days: number[] = [];
    matches.forEach((match: any) => {
      const nums = match.match(/\d+/g);
      if (nums && nums.length === 2) {
        const start = parseInt(nums[0]);
        const end = parseInt(nums[1]);
        for (let i = start; i <= end; i++) {
          if (!days.includes(i)) days.push(i);
        }
      }
    });
    return days.sort((a, b) => a - b);
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ProgramCard = ({ name, data, onClick }: any) => {
    const classCount = data.timeSlots.filter(
      (slot: any) => slot.subject
    ).length;
    const teacherSet = new Set();
    data.timeSlots.forEach((slot: any) => {
      if (slot.teacher && slot.teacher !== "NEW") {
        slot.teacher.split("/").forEach((t: any) => teacherSet.add(t.trim()));
      }
    });

    return (
      <div
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all duration-200 hover:shadow-lg"
      >
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          {name}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{classCount} Classes</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span>{teacherSet.size} Teachers</span>
          </div>
        </div>
        <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
          View Timetable
        </button>
      </div>
    );
  };

  const FilteredTimetableView = ({ title, data, type }: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <button
            onClick={() => {
              setViewMode("program");
              setFilterTeacher("");
              setFilterRoom("");
              setFilterClass("");
            }}
            className="text-purple-600 hover:text-purple-700 text-sm mb-4 flex items-center"
          >
            <X className="w-4 h-4 mr-1" /> Back to Programs
          </button>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No data found for the selected filter.
          </p>
        </div>
      );
    }

    if (type === "teacher" || type === "room") {
      const schedule = data as any[];
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
          <button
            onClick={() => {
              setViewMode("program");
              setFilterTeacher("");
              setFilterRoom("");
              setFilterClass("");
            }}
            className="text-purple-600 hover:text-purple-700 text-sm mb-4 flex items-center"
          >
            <X className="w-4 h-4 mr-1" /> Back to Programs
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-100 dark:bg-purple-900/30">
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Time
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Subject
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Code
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Class
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {type === "teacher" ? "Room" : "Teacher"}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Days
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((slot, idx) => {
                  const days = parseDayRange(slot.days);
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm font-medium text-gray-900 dark:text-white">
                        {slot.time}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-gray-800 dark:text-gray-200">
                        {slot.subject}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm font-mono text-gray-800 dark:text-gray-200">
                        {slot.code || "-"}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-gray-800 dark:text-gray-200">
                        {slot.class}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-gray-800 dark:text-gray-200">
                        {type === "teacher" ? slot.room : slot.teacher}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm">
                        {days.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {days.map((d) => (
                              <span
                                key={d}
                                className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs"
                              >
                                {dayNames[d - 1]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  const TimetableView = ({ programName, data }: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => {
                setSelectedProgram(null);
                setViewMode("program");
                setFilterClass("");
              }}
              className="text-purple-600 hover:text-purple-700 text-sm mb-2 flex items-center"
            >
              <X className="w-4 h-4 mr-1" /> Back to Programs
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {programName}
            </h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                editMode
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white transition-colors`}
            >
              {editMode ? (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" /> Edit
                </>
              )}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-100 dark:bg-purple-900/30">
                <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Field
                </th>
                {data.timeSlots.map((slot: any, idx: any) => (
                  <th
                    key={idx}
                    className="border border-gray-300 dark:border-gray-600 p-3 text-center text-sm font-semibold text-gray-900 dark:text-white min-w-[150px]"
                  >
                    {slot.time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-white">
                  Subject
                </td>
                {data.timeSlots.map((slot: any, idx: any) => (
                  <td
                    key={idx}
                    className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-gray-800 dark:text-gray-200"
                  >
                    {slot.subject || "-"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-white">
                  Code
                </td>
                {data.timeSlots.map((slot: any, idx: any) => (
                  <td
                    key={idx}
                    className="border border-gray-300 dark:border-gray-600 p-3 text-sm font-mono text-gray-800 dark:text-gray-200"
                  >
                    {slot.code || "-"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-white">
                  Teacher
                </td>
                {data.timeSlots.map((slot: any, idx: any) => (
                  <td
                    key={idx}
                    className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-gray-800 dark:text-gray-200"
                  >
                    {slot.teacher || "-"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-white">
                  Room
                </td>
                {data.timeSlots.map((slot: any, idx: any) => (
                  <td
                    key={idx}
                    className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-gray-800 dark:text-gray-200"
                  >
                    {slot.room || "-"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-white">
                  Days
                </td>
                {data.timeSlots.map((slot: any, idx: any) => {
                  const days = parseDayRange(slot.days);
                  return (
                    <td
                      key={idx}
                      className="border border-gray-300 dark:border-gray-600 p-3 text-sm"
                    >
                      {days.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {days.map((d) => (
                            <span
                              key={d}
                              className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs"
                            >
                              {dayNames[d - 1]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Timetable Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-900 dark:text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-900" />
                )}
              </button>
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isAdmin
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {isAdmin ? "Admin Mode" : "View Mode"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedProgram ? (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={BookOpen}
                label="Total Programs"
                value={statistics.totalPrograms}
                color="bg-purple-600"
              />
              <StatCard
                icon={Clock}
                label="Total Classes"
                value={statistics.totalClasses}
                color="bg-blue-600"
              />
              <StatCard
                icon={Users}
                label="Total Teachers"
                value={statistics.totalTeachers}
                color="bg-green-600"
              />
              <StatCard
                icon={BarChart3}
                label="Total Rooms"
                value={statistics.totalRooms}
                color="bg-orange-600"
              />
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teacher-wise Timetable
                    </label>
                    <select
                      value={filterTeacher}
                      onChange={(e) => {
                        setFilterTeacher(e.target.value);
                        setFilterRoom("");
                        setFilterClass("");
                        if (e.target.value) {
                          setViewMode("teacher");
                        } else {
                          setViewMode("program");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Teacher</option>
                      {(allTeachers as string[]).map((teacher) => (
                        <option key={teacher} value={teacher}>
                          {teacher}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room-wise Timetable
                    </label>
                    <select
                      value={filterRoom}
                      onChange={(e) => {
                        setFilterRoom(e.target.value);
                        setFilterTeacher("");
                        setFilterClass("");
                        if (e.target.value) {
                          setViewMode("room");
                        } else {
                          setViewMode("program");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Room</option>
                      {(allRooms as string[]).map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class-wise Timetable
                    </label>
                    <select
                      value={filterClass}
                      onChange={(e) => {
                        setFilterClass(e.target.value);
                        setFilterTeacher("");
                        setFilterRoom("");
                        if (e.target.value) {
                          setViewMode("class");
                        } else {
                          setViewMode("program");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Class</option>
                      {allClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Filtered Views */}
            {viewMode === "teacher" && filterTeacher ? (
              <FilteredTimetableView
                title={`${filterTeacher}'s Timetable`}
                data={getFilteredTimetableData}
                type="teacher"
              />
            ) : viewMode === "room" && filterRoom ? (
              <FilteredTimetableView
                title={`Room ${filterRoom} Schedule`}
                data={getFilteredTimetableData}
                type="room"
              />
            ) : viewMode === "class" && filterClass ? (
              <TimetableView
                programName={filterClass}
                data={getFilteredTimetableData}
              />
            ) : (
              <>
                {/* Program Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map(([name, data]) => (
                    <ProgramCard
                      key={name}
                      name={name}
                      data={data}
                      onClick={() => {
                        setSelectedProgram(name);
                        setViewMode("program");
                      }}
                    />
                  ))}
                </div>

                {filteredPrograms.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      No programs found matching your criteria.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <TimetableView
            programName={selectedProgram}
            data={timetableData[selectedProgram as keyof typeof timetableData]}
          />
        )}
      </main>
    </div>
  );
};

export default TimetableDashboard;
