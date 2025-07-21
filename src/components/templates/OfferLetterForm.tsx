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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { OfferLetterData } from "@/types/templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

const formSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateAddress: z.string().min(1, "Candidate address is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  startDate: z.string().min(1, "Start date is required"),
  salary: z.string().min(1, "Salary is required"),
  benefits: z.string().min(1, "Benefits are required"),
  workLocation: z.string().min(1, "Work location is required"),
  workHours: z.string().min(1, "Work hours are required"),
  duties: z.string().min(1, "Duties are required"),
  institutionName: z.string().min(1, "Institution name is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean(),
});

interface OfferLetterFormProps {
  onSubmit: (data: OfferLetterData) => void;
  initialData: OfferLetterData;
}

export const OfferLetterForm: React.FC<OfferLetterFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  
  const form = useForm<OfferLetterData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleSubmit = async (data: OfferLetterData) => {
    // Track preview generation
    await trackPreviewGeneration("offer-letter-1", "update");
    // Submit the form
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="candidateName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter candidate name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="candidateAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter candidate address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary</FormLabel>
                <FormControl>
                  <Input placeholder="Enter salary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter work location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Hours</FormLabel>
                <FormControl>
                  <Input placeholder="Enter work hours" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="duties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Duties and Responsibilities</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List main duties and responsibilities"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benefits</FormLabel>
                <FormControl>
                  <Textarea placeholder="List employee benefits" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
