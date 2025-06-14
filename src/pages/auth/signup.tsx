import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries'; // Assuming you have a list of countries

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
} 