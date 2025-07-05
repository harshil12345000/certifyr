import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BankVerificationData } from "@/types/templates";

const bankVerificationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountType: z.enum(["savings", "current", "salary"], {
    required_error: "Account type is required",
  }),
  ifscCode: z.string().min(1, "IFSC code is required"),
  branchName: z.string().min(1, "Branch name is required"),
  branchAddress: z.string().min(1, "Branch address is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  joinDate: z.string().min(1, "Join date is required"),
  currentSalary: z.string().min(1, "Current salary is required"),
  purpose: z.string().min(1, "Purpose is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean(),
});

interface BankVerificationFormProps {
  onSubmit: (data: BankVerificationData) => void;
  initialData?: Partial<BankVerificationData>;
}

export const BankVerificationForm: React.FC<BankVerificationFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const form = useForm<BankVerificationData>({
    resolver: zodResolver(bankVerificationSchema),
    defaultValues: {
      fullName: "",
      employeeId: "",
      designation: "",
      department: "",
      bankName: "",
      accountNumber: "",
      accountType: "savings",
      ifscCode: "",
      branchName: "",
      branchAddress: "",
      accountHolderName: "",
      joinDate: "",
      currentSalary: "",
      purpose: "",
      institutionName: "",
      date: new Date().toISOString().split("T")[0],
      place: "",
      signatoryName: "",
      signatoryDesignation: "",
      includeDigitalSignature: false,
      ...initialData,
    },
  });

  const handleSubmit = (data: BankVerificationData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...form.register("fullName")}
            placeholder="Enter full name"
          />
          {form.formState.errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="employeeId">Employee ID *</Label>
          <Input
            id="employeeId"
            {...form.register("employeeId")}
            placeholder="Enter employee ID"
          />
          {form.formState.errors.employeeId && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.employeeId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="designation">Designation *</Label>
          <Input
            id="designation"
            {...form.register("designation")}
            placeholder="Enter designation"
          />
          {form.formState.errors.designation && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.designation.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            {...form.register("department")}
            placeholder="Enter department"
          />
          {form.formState.errors.department && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.department.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="joinDate">Date of Joining *</Label>
          <Input id="joinDate" type="date" {...form.register("joinDate")} />
          {form.formState.errors.joinDate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.joinDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentSalary">Current Salary *</Label>
          <Input
            id="currentSalary"
            {...form.register("currentSalary")}
            placeholder="Enter current salary"
          />
          {form.formState.errors.currentSalary && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.currentSalary.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            {...form.register("bankName")}
            placeholder="Enter bank name"
          />
          {form.formState.errors.bankName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.bankName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            {...form.register("accountNumber")}
            placeholder="Enter account number"
          />
          {form.formState.errors.accountNumber && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.accountNumber.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="accountType">Account Type *</Label>
          <Select
            value={form.watch("accountType")}
            onValueChange={(value) =>
              form.setValue(
                "accountType",
                value as "savings" | "current" | "salary",
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.accountType && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.accountType.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="accountHolderName">Account Holder Name *</Label>
          <Input
            id="accountHolderName"
            {...form.register("accountHolderName")}
            placeholder="Enter account holder name"
          />
          {form.formState.errors.accountHolderName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.accountHolderName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ifscCode">IFSC Code *</Label>
          <Input
            id="ifscCode"
            {...form.register("ifscCode")}
            placeholder="Enter IFSC code"
          />
          {form.formState.errors.ifscCode && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.ifscCode.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="branchName">Branch Name *</Label>
          <Input
            id="branchName"
            {...form.register("branchName")}
            placeholder="Enter branch name"
          />
          {form.formState.errors.branchName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.branchName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="branchAddress">Branch Address *</Label>
        <Textarea
          id="branchAddress"
          {...form.register("branchAddress")}
          placeholder="Enter complete branch address"
          rows={3}
        />
        {form.formState.errors.branchAddress && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.branchAddress.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="purpose">Purpose *</Label>
        <Textarea
          id="purpose"
          {...form.register("purpose")}
          placeholder="Enter purpose for bank verification"
          rows={3}
        />
        {form.formState.errors.purpose && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.purpose.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="institutionName">Institution Name *</Label>
          <Input
            id="institutionName"
            {...form.register("institutionName")}
            placeholder="Enter institution name"
          />
          {form.formState.errors.institutionName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.institutionName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" {...form.register("date")} />
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="place">Place *</Label>
          <Input
            id="place"
            {...form.register("place")}
            placeholder="Enter place"
          />
          {form.formState.errors.place && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.place.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="signatoryName">Signatory Name *</Label>
          <Input
            id="signatoryName"
            {...form.register("signatoryName")}
            placeholder="Enter signatory name"
          />
          {form.formState.errors.signatoryName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.signatoryName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
          <Input
            id="signatoryDesignation"
            {...form.register("signatoryDesignation")}
            placeholder="Enter signatory designation"
          />
          {form.formState.errors.signatoryDesignation && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.signatoryDesignation.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeDigitalSignature"
          checked={form.watch("includeDigitalSignature")}
          onCheckedChange={(checked) =>
            form.setValue("includeDigitalSignature", checked as boolean)
          }
        />
        <Label htmlFor="includeDigitalSignature">
          Include Digital Signature
        </Label>
      </div>

      <Button type="submit" className="w-full">
        Update Preview
      </Button>
    </form>
  );
};
