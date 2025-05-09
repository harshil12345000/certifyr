
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle 
} from 'lucide-react';

export const statsData = [
  {
    title: "Total Documents",
    value: "284",
    icon: FileText,
    description: "this month",
    trend: { value: "12%", positive: true }
  },
  {
    title: "Active Templates",
    value: "24",
    icon: FileText,
    description: "across 6 categories"
  },
  {
    title: "Staff Members",
    value: "48",
    icon: Users,
    description: "with access"
  },
  {
    title: "Avg. Processing Time",
    value: "2.4h",
    icon: Clock,
    trend: { value: "30%", positive: true },
    description: "faster than last month"
  }
];

export const popularTemplates = [
  {
    id: "bonafide-1",
    title: "Bonafide Certificate",
    description: "Standard certificate confirming student enrollment status",
    category: "Student",
    usageCount: 156
  },
  {
    id: "experience-1",
    title: "Experience Letter",
    description: "Official document certifying employment period and role",
    category: "Employment",
    usageCount: 89
  },
  {
    id: "noc-visa-1",
    title: "NOC for Visa",
    description: "No objection certificate for visa application purposes",
    category: "Travel",
    usageCount: 67
  },
  {
    id: "internship-1",
    title: "Internship Completion",
    description: "Certificate verifying successful internship completion",
    category: "Student",
    usageCount: 53
  }
];

export const recentDocuments = [
  {
    id: "doc-001",
    name: "Bonafide Certificate - Rahul Sharma",
    type: "Certificate",
    status: "Signed",
    date: "Today, 10:45 AM",
    recipient: "rahul.s@gmail.com"
  },
  {
    id: "doc-002",
    name: "Experience Letter - Priya Patel",
    type: "Letter",
    status: "Sent",
    date: "Today, 09:23 AM",
    recipient: "priya.p@outlook.com"
  },
  {
    id: "doc-003",
    name: "NOC for Banking - Amit Kumar",
    type: "Certificate",
    status: "Created",
    date: "Yesterday, 04:17 PM",
    recipient: ""
  },
  {
    id: "doc-004",
    name: "Internship Offer - Sneha Gupta",
    type: "Letter",
    status: "Signed",
    date: "Yesterday, 11:30 AM",
    recipient: "sneha.g22@gmail.com"
  },
  {
    id: "doc-005",
    name: "Address Verification - Vikram Singh",
    type: "Certificate",
    status: "Created",
    date: "Jun 12, 2025",
    recipient: ""
  }
];

export const documentCategories = [
  { 
    id: "cat-student", 
    name: "Student Documents",
    description: "Certificates and letters for educational purposes",
    count: 15,
    icon: CheckCircle
  },
  { 
    id: "cat-employment", 
    name: "Employment Records",
    description: "Employment verification and work experience",
    count: 12,
    icon: CheckCircle
  },
  { 
    id: "cat-official", 
    name: "Official Certificates",
    description: "Government and legally binding documents",
    count: 8,
    icon: CheckCircle
  },
  { 
    id: "cat-financial", 
    name: "Financial Documents",
    description: "Income and financial status verification",
    count: 6,
    icon: CheckCircle
  },
  { 
    id: "cat-travel", 
    name: "Travel & Visa",
    description: "Documents for travel and visa applications",
    count: 5,
    icon: CheckCircle
  },
  { 
    id: "cat-misc", 
    name: "Miscellaneous",
    description: "Other institutional documents and letters",
    count: 4,
    icon: CheckCircle
  }
];
