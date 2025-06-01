
import { FileText, GraduationCap, Briefcase, Building2, Wallet, MapPin, Shield, Plane } from "lucide-react";

export const popularTemplates = [
  {
    id: "bonafide-1",
    title: "Bonafide Certificate",
    description: "Official certificate for students and employees",
    category: "Educational",
    usageCount: 156
  },
  {
    id: "experience-1", 
    title: "Experience Certificate",
    description: "Employment verification and experience document",
    category: "Employment",
    usageCount: 134
  },
  {
    id: "character-1",
    title: "Character Certificate", 
    description: "Certificate of good character and conduct",
    category: "Official",
    usageCount: 89
  },
  {
    id: "leave-application-1",
    title: "Leave Application",
    description: "Standard format for leave requests",
    category: "Employment", 
    usageCount: 78
  },
  {
    id: "address-proof-1",
    title: "Address Proof",
    description: "Verification of residential address",
    category: "Official",
    usageCount: 65
  },
  {
    id: "income-certificate-1",
    title: "Income Certificate",
    description: "Official proof of annual income",
    category: "Financial",
    usageCount: 52
  }
];

export const documentCategories = [
  {
    id: "educational",
    name: "Educational Documents",
    description: "Academic certificates, transcripts, and school-related documents",
    icon: GraduationCap,
    count: 15
  },
  {
    id: "employment",
    name: "Employment Documents", 
    description: "Job-related certificates, applications, and HR documents",
    icon: Briefcase,
    count: 12
  },
  {
    id: "official",
    name: "Official Documents",
    description: "Government and official institutional documents",
    icon: Building2,
    count: 18
  },
  {
    id: "financial",
    name: "Financial Documents",
    description: "Income certificates, financial statements, and related documents",
    icon: Wallet,
    count: 8
  },
  {
    id: "travel",
    name: "Travel Documents",
    description: "Visa applications, embassy letters, and travel-related certificates",
    icon: Plane,
    count: 6
  },
  {
    id: "legal",
    name: "Legal Documents",
    description: "Affidavits, legal certificates, and court-related documents",
    icon: Shield,
    count: 10
  }
];
