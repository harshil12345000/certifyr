import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CompletionCertificateData } from "@/types/templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  courseTitle: z.string().min(1, "Course title is required"),
  courseDuration: z.string().min(1, "Course duration is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  grade: z.string().min(1, "Grade is required"),
  percentage: z.string().min(1, "Percentage is required"),
  programType: z.string().min(1, "Program type is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean(),
});

interface CompletionCertificateFormProps {
  onSubmit: (data: CompletionCertificateData) => void;
  initialData: CompletionCertificateData;
}

export const CompletionCertificateForm: React.FC<
  CompletionCertificateFormProps
> = ({ onSubmit, initialData }) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  
  const form = useForm<CompletionCertificateData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleSubmit = async (data: CompletionCertificateData) => {
    // Track preview generation
    await trackPreviewGeneration("completion-certificate-1", "update");
    // Submit the form
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter father's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter registration number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Duration</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course duration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input placeholder="Enter grade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentage</FormLabel>
                <FormControl>
                  <Input placeholder="Enter percentage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="programType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter program type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="institutionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter institution name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="place"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place</FormLabel>
                <FormControl>
                  <Input placeholder="Enter place" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signatoryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signatory Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter signatory name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signatoryDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signatory Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter signatory designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="includeDigitalSignature"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Include Digital Signature</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Update Preview
        </Button>
      </form>
    </Form>
  );
};
