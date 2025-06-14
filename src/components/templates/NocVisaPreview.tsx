
import { NocVisaData } from '@/types/templates';

interface NocVisaPreviewProps {
  data: NocVisaData;
}

export const NocVisaPreview: React.FC<NocVisaPreviewProps> = ({ data }) => {
  const {
    fullName,
    employeeOrStudentId,
    designationOrCourse,
    department,
    passportNumber,
    destinationCountry,
    travelStartDate,
    travelEndDate,
    purposeOfVisit,
    // contactPersonInDestination, // Not typically in the letter body directly
    // accommodationDetails, // Not typically in the letter body directly
    tripFundSource,
    institutionName,
    date,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const formattedStartDate = travelStartDate ? new Date(travelStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Start Date]';
  const formattedEndDate = travelEndDate ? new Date(travelEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[End Date]';
  const formattedIssueDate = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead Section - Placeholder */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-blue-700">{institutionName || '[Institution Name]'}</h1>
        <p className="text-xs">123 Institution Address, City, State, ZIP</p>
        <p className="text-xs">Phone: (123) 456-7890 | Email: info@institution.example.com</p>
      </div>

      <div className="mb-6">
        <p>Date: {formattedIssueDate}</p>
        <p>Place: {place || '[Place of Issue]'}</p>
      </div>

      <div className="mb-6">
        <p>To,</p>
        <p>The Visa Officer,</p>
        <p>The Embassy/Consulate of {destinationCountry || '[Destination Country]'}</p>
        <p>[Embassy/Consulate Address, City]</p>
      </div>

      <h2 className="text-center font-bold mb-6 underline">
        Subject: No Objection Certificate for Mr./Ms. {fullName || '[Full Name]'} – Passport No: {passportNumber || '[Passport Number]'}
      </h2>

      <p className="mb-4">Dear Sir/Madam,</p>

      <p className="mb-4 text-justify">
        This is to certify that Mr./Ms. <strong>{fullName || '[Full Name]'}</strong>, holding Passport No. <strong>{passportNumber || '[Passport Number]'}</strong>, is a bonafide employee/student of <strong>{institutionName || '[Institution Name]'}</strong>. 
        He/She is currently working as <strong>{designationOrCourse || '[Designation/Course]'}</strong> in the <strong>{department || '[Department]'}</strong>.
      </p>

      <p className="mb-4 text-justify">
        Mr./Ms. <strong>{fullName || '[Full Name]'}</strong> intends to travel to <strong>{destinationCountry || '[Destination Country]'}</strong> from <strong>{formattedStartDate}</strong> to <strong>{formattedEndDate}</strong> for the purpose of <strong>{purposeOfVisit || '[Purpose of Visit]'}</strong>.
      </p>
      
      {tripFundSource && (
         <p className="mb-4 text-justify">
           {tripFundSource === 'self' 
             ? `All expenses related to this trip will be borne by Mr./Ms. ${fullName || '[Full Name]'}.`
             : `All expenses related to this trip will be borne by ${institutionName || '[Institution Name]'}.`}
         </p>
      )}

      <p className="mb-4 text-justify">
        <strong>{institutionName || '[Institution Name]'}</strong> has no objection to his/her visit to <strong>{destinationCountry || '[Destination Country]'}</strong> for the stated purpose and duration. We request that his/her visa application be favorably considered.
      </p>

      <p className="mb-6">Thank you for your consideration.</p>

      <div className="mt-12">
        <p>Sincerely,</p>
        {includeDigitalSignature && (
          <div className="h-16 w-48 my-2 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic">
            [Digital Signature Placeholder]
          </div>
        )}
        {!includeDigitalSignature && <div className="h-16"></div>}
        <p><strong>{signatoryName || '[Signatory Name]'}</strong></p>
        <p>{signatoryDesignation || '[Signatory Designation]'}</p>
        <p>{institutionName || '[Institution Name]'}</p>
        {/* Placeholder for seal */}
        <div className="mt-2 h-12 w-12 border border-dashed border-gray-400 rounded-full flex items-center justify-center text-gray-500 text-xs">
          Seal
        </div>
      </div>
    </div>
  );
};
