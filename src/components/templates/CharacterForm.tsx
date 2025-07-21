import React from "react";
import { CharacterData } from "@/types/templates";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

interface CharacterFormProps {
  onSubmit: (data: CharacterData) => void;
  initialData: CharacterData;
}

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  parentName: z
    .string()
    .min(2, { message: "Parent name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  conduct: z.string().min(2, { message: "Conduct description is required" }),
  institutionName: z
    .string()
    .min(2, { message: "Institution name is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  place: z.string().min(2, { message: "Place is required" }),
  signatoryName: z.string().min(2, { message: "Signatory name is required" }),
  signatoryDesignation: z
    .string()
    .min(2, { message: "Designation is required" }),
  includeDigitalSignature: z.boolean().default(false),
});

export function CharacterForm({ onSubmit, initialData }: CharacterFormProps) {
  const { trackPreviewGeneration } = usePreviewTracking();
  
  const form = useForm<CharacterData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (values: CharacterData) => {
    // Track preview generation
    await trackPreviewGeneration("character-1", "update");
    
    // Submit the form
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Details Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Personal Details</h3>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent's Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Complete residential address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Character Details Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Character Details</h3>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration Known</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 5 years, Since 2020" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conduct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character & Conduct</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the person's character, behavior, and moral conduct"
                    />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Certificate Details Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Certificate Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Signatory Details Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Signatory Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="signatoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signatory Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Digital Signature Toggle */}
          <FormField
            control={form.control}
            name="includeDigitalSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Digital Signature</FormLabel>
                  <FormDescription className="text-sm text-muted-foreground">
                    Include digital signature in the certificate
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Update Preview
        </Button>
      </form>
    </Form>
  );
}
