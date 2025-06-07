
import { BonafideData } from "@/types/templates";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";

interface BonafidePreviewProps {
  data: BonafideData;
}

export function BonafidePreview({ data }: BonafidePreviewProps) {
  const { branding } = useOrganizationBranding();

  return (
    <div className="a4-document bg-white p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header with Organization Branding */}
      <div className="text-center mb-8" style={{ color: branding?.header_color || '#1e40af' }}>
        {branding?.logo_url && (
          <img src={branding.logo_url} alt="Organization Logo" className="h-16 mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold mb-2">
          {branding?.organization_name || data.institutionName || "INSTITUTION NAME"}
        </h1>
        <p className="text-sm">
          {branding?.address || "Institution Address"}
        </p>
        {branding?.phone && (
          <p className="text-sm">Phone: {branding.phone}</p>
        )}
        {branding?.email && (
          <p className="text-sm">Email: {branding.email}</p>
        )}
        {branding?.website && (
          <p className="text-sm">Website: {branding.website}</p>
        )}
        <hr className="mt-4 border-2" style={{ borderColor: branding?.header_color || '#1e40af' }} />
      </div>

      {/* Certificate Content */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold mb-6 underline">BONAFIDE CERTIFICATE</h2>
      </div>

      <div className="space-y-4 text-justify leading-relaxed">
        <p>This is to certify that <strong>{data.fullName || "_______________"}</strong>, 
        {data.gender === 'male' ? ' son' : ' daughter'} of <strong>{data.parentName || "_______________"}</strong>, 
        is a bonafide {data.type === 'student' ? 'student' : 'employee'} of this {branding?.organization_type || 'institution'}.</p>

        {data.type === 'student' ? (
          <p>{data.gender === 'male' ? 'He' : 'She'} is studying <strong>{data.courseOrDesignation || "_______________"}</strong> 
          in the <strong>{data.department || "_______________"}</strong> department and has been with us since <strong>{data.startDate || "_______________"}</strong>.</p>
        ) : (
          <p>{data.gender === 'male' ? 'He' : 'She'} is working as <strong>{data.courseOrDesignation || "_______________"}</strong> 
          in the <strong>{data.department || "_______________"}</strong> department and has been with us since <strong>{data.startDate || "_______________"}</strong>.</p>
        )}

        <p>This certificate is being issued for the purpose of <strong>{data.purpose || "_______________"}</strong>.</p>

        <p>We wish {data.gender === 'male' ? 'him' : 'her'} all the best in {data.gender === 'male' ? 'his' : 'her'} future endeavors.</p>
      </div>

      {/* Footer */}
      <div className="mt-16 flex justify-between items-end">
        <div>
          <p className="text-sm">Date: {data.date || "_______________"}</p>
          <p className="text-sm">Place: {data.place || "_______________"}</p>
        </div>

        <div className="text-right">
          {data.includeDigitalSignature && branding?.signature_url && (
            <img src={branding.signature_url} alt="Digital Signature" className="h-12 mb-2" />
          )}
          <div className="border-t border-black w-48 pt-2">
            <p className="font-semibold">{data.signatoryName || "Authorized Signatory"}</p>
            <p className="text-sm">{data.signatoryDesignation || "Designation"}</p>
            <p className="text-sm">{branding?.organization_name || data.institutionName || "Institution Name"}</p>
          </div>
        </div>
      </div>

      {/* Seal */}
      {branding?.seal_url && (
        <div className="absolute bottom-24 left-16">
          <img src={branding.seal_url} alt="Official Seal" className="h-20 opacity-80" />
        </div>
      )}

      {/* Footer with organization colors */}
      <div 
        className="mt-8 pt-4 border-t-2 text-center text-sm"
        style={{ borderColor: branding?.footer_color || '#1e40af', color: branding?.footer_color || '#1e40af' }}
      >
        <p>{branding?.organization_name || "Organization Name"} - Official Document</p>
      </div>
    </div>
  );
}
