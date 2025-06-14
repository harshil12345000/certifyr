
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { NocVisaData } from '@/types/templates';

const nocVisaSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  employeeOrStudentId: z.string().min(1, "Employee/Student ID is required"),
  designationOrCourse: z.string().min(1, "Designation/Course is required"),
  department: z.string().min(1, "Department is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  travelStartDate: z.string().min(1, "Travel start date is required"),
  travelEndDate: z.string().min(1, "Travel end date is required"),
  purposeOfVisit: z.string().min(1, "Purpose of visit is required"),
  contactPersonInDestination: z.string().optional(),
  accommodationDetails: z.string().optional(),
  tripFundSource: z.enum(['self', 'company']).optional(),
  institutionName: z.string().min(1, "Institution name is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean().default(false),
});

interface NocVisaFormProps {
  onSubmit: (data: NocVisaData) => void;
  initialData?: NocVisaData;
}

export const NocVisaForm: React.FC<NocVisaFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<NocVisaData>({
    resolver: zodResolver(nocVisaSchema),
    defaultValues: initialData || {
      fullName: '',
      employeeOrStudentId: '',
      designationOrCourse: '',
      department: '',
      passportNumber: '',
      destinationCountry: '',
      travelStartDate: '',
      travelEndDate: '',
      purposeOfVisit: '',
      contactPersonInDestination: '',
      accommodationDetails: '',
      tripFundSource: 'self',
      institutionName: 'Your Institution Name', // Default or from context
      date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      place: 'Your City', // Default or from context
      signatoryName: '',
      signatoryDesignation: '',
      includeDigitalSignature: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Details */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeOrStudentId">Employee/Student ID</Label>
          <Input id="employeeOrStudentId" {...register('employeeOrStudentId')} />
          {errors.employeeOrStudentId && <p className="text-sm text-red-500">{errors.employeeOrStudentId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="designationOrCourse">Designation / Course & Year</Label>
          <Input id="designationOrCourse" {...register('designationOrCourse')} />
          {errors.designationOrCourse && <p className="text-sm text-red-500">{errors.designationOrCourse.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" {...register('department')} />
          {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="passportNumber">Passport Number</Label>
          <Input id="passportNumber" {...register('passportNumber')} />
          {errors.passportNumber && <p className="text-sm text-red-500">{errors.passportNumber.message}</p>}
        </div>

        {/* Travel Details */}
        <div className="space-y-2">
          <Label htmlFor="destinationCountry">Destination Country</Label>
          <Input id="destinationCountry" {...register('destinationCountry')} />
          {errors.destinationCountry && <p className="text-sm text-red-500">{errors.destinationCountry.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="travelStartDate">Travel Start Date</Label>
          <Input id="travelStartDate" type="date" {...register('travelStartDate')} />
          {errors.travelStartDate && <p className="text-sm text-red-500">{errors.travelStartDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="travelEndDate">Travel End Date</Label>
          <Input id="travelEndDate" type="date" {...register('travelEndDate')} />
          {errors.travelEndDate && <p className="text-sm text-red-500">{errors.travelEndDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
          <Textarea id="purposeOfVisit" {...register('purposeOfVisit')} placeholder="e.g., Tourism, Conference, Family Visit" />
          {errors.purposeOfVisit && <p className="text-sm text-red-500">{errors.purposeOfVisit.message}</p>}
        </div>

        {/* Optional Details */}
         <div className="space-y-2">
          <Label htmlFor="tripFundSource">Trip Funding Source</Label>
          <Controller
            name="tripFundSource"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self">Self-Funded</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">Company-Funded</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPersonInDestination">Contact Person in Destination (Optional)</Label>
          <Input id="contactPersonInDestination" {...register('contactPersonInDestination')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accommodationDetails">Accommodation Details in Destination (Optional)</Label>
          <Textarea id="accommodationDetails" {...register('accommodationDetails')} />
        </div>

        {/* Issuing Authority Details */}
        <div className="space-y-2">
          <Label htmlFor="institutionName">Issuing Institution Name</Label>
          <Input id="institutionName" {...register('institutionName')} />
          {errors.institutionName && <p className="text-sm text-red-500">{errors.institutionName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date of Issue</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="place">Place of Issue</Label>
          <Input id="place" {...register('place')} />
          {errors.place && <p className="text-sm text-red-500">{errors.place.message}</p>}
        </div>
        
        {/* Signatory Details */}
        <div className="space-y-2">
          <Label htmlFor="signatoryName">Signatory Name</Label>
          <Input id="signatoryName" {...register('signatoryName')} />
          {errors.signatoryName && <p className="text-sm text-red-500">{errors.signatoryName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signatoryDesignation">Signatory Designation</Label>
          <Input id="signatoryDesignation" {...register('signatoryDesignation')} />
          {errors.signatoryDesignation && <p className="text-sm text-red-500">{errors.signatoryDesignation.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Controller
          name="includeDigitalSignature"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="includeDigitalSignature"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="includeDigitalSignature">Include Digital Signature (if available)</Label>
      </div>

      <Button type="submit" className="w-full md:w-auto">Generate Preview</Button>
    </form>
  );
};
