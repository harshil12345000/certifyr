import React, { useState, useEffect } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "../Letterhead";
import { QRCode } from "../QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";
import { parse } from "date-fns";

interface AgreementLayoutProps {
  config: any;
  data: any;
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const AgreementLayout: React.FC<AgreementLayoutProps> = ({
  config,
  data,
  isEmployeePreview = false,
  requestStatus = "pending",
}) => {
  const { signatureUrl, organizationDetails, organizationId } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    const generateQR = async () => {
      const url = await generateDocumentQRCode(
        `${config.id}-1`,
        data,
        organizationId || undefined,
        user?.id,
      );
      setQrCodeUrl(url);
    };
    generateQR();
  }, [data, organizationId, user?.id, config.id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "[Date]";
    try {
      const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
      return parsedDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  const renderContent = () => {
    const docId = config.id;

    switch (docId) {
      case "nda":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">NON-DISCLOSURE AGREEMENT</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">1. PARTIES</h3>
                <p>This Agreement is entered into on <strong>{formatDate(data.effectiveDate)}</strong> between:</p>
                <p className="ml-4 mt-2">
                  <strong>Disclosing Party:</strong> {data.disclosingParty || "[Disclosing Party]"}<br />
                  Address: {data.disclosingPartyAddress || "[Address]"}
                </p>
                <p className="ml-4 mt-2">
                  <strong>Receiving Party:</strong> {data.receivingParty || "[Receiving Party]"}<br />
                  Address: {data.receivingPartyAddress || "[Address]"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">2. CONFIDENTIAL INFORMATION</h3>
                <p className="whitespace-pre-line">{data.confidentialInformation || "[Define confidential information]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">3. PERMITTED USE</h3>
                <p className="whitespace-pre-line">{data.permittedUse || "[Specify permitted uses]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">4. OBLIGATIONS</h3>
                <p>The Receiving Party agrees to:</p>
                <ul className="list-disc ml-8 mt-2">
                  <li>Keep all Confidential Information strictly confidential</li>
                  <li>Use the Confidential Information only for the permitted purpose</li>
                  <li>Not disclose the Confidential Information to any third party</li>
                  <li>Take reasonable measures to protect the confidentiality</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">5. TERM</h3>
                <p>This Agreement shall remain in effect for <strong>{data.duration || "[Duration]"}</strong>.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">6. GOVERNING LAW</h3>
                <p>This Agreement shall be governed by the laws of <strong>{data.governingLaw || "[Governing Law]"}</strong>.</p>
              </div>
            </div>
          </div>
        );

      case "employment-agreement":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">EMPLOYMENT AGREEMENT</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">1. PARTIES</h3>
                <p>This Employment Agreement is entered into between:</p>
                <p className="ml-4 mt-2">
                  <strong>Employer:</strong> {data.employerName || organizationDetails?.name || "[Employer Name]"}
                </p>
                <p className="ml-4 mt-2">
                  <strong>Employee:</strong> {data.employeeName || "[Employee Name]"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">2. POSITION AND DUTIES</h3>
                <p>Job Title: <strong>{data.jobTitle || "[Job Title]"}</strong></p>
                <p>Department: <strong>{data.department || "[Department]"}</strong></p>
                <p>Start Date: <strong>{formatDate(data.startDate)}</strong></p>
                <p>Work Location: <strong>{data.workLocation || "[Work Location]"}</strong></p>
                <p>Work Hours: <strong>{data.workHours || "[Work Hours]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">3. COMPENSATION</h3>
                <p>Salary: <strong>{data.salary || "[Salary]"}</strong></p>
                <p className="mt-2"><strong>Benefits:</strong></p>
                <p className="whitespace-pre-line ml-4">{data.benefits || "[Benefits]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">4. TERMS & CONDITIONS</h3>
                <p className="whitespace-pre-line">{data.terminationClause || "[Termination Clause]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">5. GOVERNING LAW</h3>
                <p>This Agreement shall be governed by applicable employment laws.</p>
              </div>
            </div>
          </div>
        );

      case "articles-incorporation":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">ARTICLES OF INCORPORATION</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE I: NAME</h3>
                <p>The name of the corporation is <strong>{data.corporationName || "[Corporation Name]"}</strong>.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE II: REGISTERED AGENT</h3>
                <p>Registered Agent: <strong>{data.registeredAgent || "[Registered Agent]"}</strong></p>
                <p>Agent Address: {data.registeredAgentAddress || "[Agent Address]"}</p>
                <p>Corporate Address: {data.corporateAddress || "[Corporate Address]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE III: PURPOSE</h3>
                <p className="whitespace-pre-line">{data.businessPurpose || "[Business Purpose]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE IV: SHARES</h3>
                <p>Authorized Shares: <strong>{data.authorizedShares || "[Number]"}</strong></p>
                <p>Par Value per Share: <strong>₹{data.shareValue || "[Value]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE V: INCORPORATOR</h3>
                <p>Name: <strong>{data.incorporatorName || "[Incorporator Name]"}</strong></p>
                <p>Address: {data.incorporatorAddress || "[Incorporator Address]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE VI: FILING</h3>
                <p>State of Incorporation: <strong>{data.stateOfIncorporation || "[State]"}</strong></p>
                <p>Filing Date: <strong>{formatDate(data.filingDate)}</strong></p>
              </div>
            </div>
          </div>
        );

      case "corporate-bylaws":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">CORPORATE BYLAWS</h2>
              <p className="text-lg mt-2">{data.corporationName || "[Corporation Name]"}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE I: CORPORATION</h3>
                <p>State of Incorporation: <strong>{data.stateOfIncorporation || "[State]"}</strong></p>
                <p>Registered Office: {data.registeredOffice || "[Registered Office]"}</p>
                <p>Fiscal Year End: <strong>{data.fiscalYearEnd || "[Fiscal Year End]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE II: BOARD OF DIRECTORS</h3>
                <p>Number of Directors: <strong>{data.numberOfDirectors || "[Number]"}</strong></p>
                <p>Director Term Length: <strong>{data.directorTermLength || "[Term Length]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE III: OFFICERS</h3>
                <p className="whitespace-pre-line">{data.officerTitles || "[Officer Titles]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE IV: VOTING RIGHTS</h3>
                <p className="whitespace-pre-line">{data.votingRights || "[Voting Rights]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE V: MEETINGS</h3>
                <p>Meeting Frequency: <strong>{data.meetingFrequency || "[Meeting Frequency]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE VI: DIVIDENDS</h3>
                <p className="whitespace-pre-line">{data.dividendPolicy || "[Dividend Policy]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">ARTICLE VII: AMENDMENTS</h3>
                <p className="whitespace-pre-line">{data.amendmentProcess || "[Amendment Process]"}</p>
              </div>
            </div>
          </div>
        );

      case "founders-agreement":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">FOUNDERS' AGREEMENT</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">1. PARTIES</h3>
                <p>This Agreement is entered into on <strong>{formatDate(data.effectiveDate)}</strong> between:</p>
                <p className="ml-4 mt-2">Founder 1: <strong>{data.founder1Name || "[Founder 1]"}</strong></p>
                <p className="ml-4">Founder 2: <strong>{data.founder2Name || "[Founder 2]"}</strong></p>
                <p className="ml-4 mt-2">Company: <strong>{data.companyName || "[Company Name]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">2. BUSINESS DESCRIPTION</h3>
                <p className="whitespace-pre-line">{data.businessDescription || "[Business Description]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">3. EQUITY DISTRIBUTION</h3>
                <p>Founder 1: <strong>{data.founder1Equity || "[%]"}%</strong></p>
                <p>Founder 2: <strong>{data.founder2Equity || "[%]"}%</strong></p>
                <p className="mt-2"><strong>Vesting Schedule:</strong></p>
                <p className="whitespace-pre-line ml-4">{data.vestingSchedule || "[Vesting Schedule]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">4. ROLES & RESPONSIBILITIES</h3>
                <p className="whitespace-pre-line">{data.rolesAndResponsibilities || "[Roles & Responsibilities]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">5. INTELLECTUAL PROPERTY</h3>
                <p className="whitespace-pre-line">{data.intellectualProperty || "[IP Clause]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">6. CONFIDENTIALITY</h3>
                <p className="whitespace-pre-line">{data.confidentialityClause || "[Confidentiality Clause]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">7. NON-COMPETE</h3>
                <p className="whitespace-pre-line">{data.nonCompeteClause || "[Non-Compete Clause]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">8. DISPUTE RESOLUTION</h3>
                <p className="whitespace-pre-line">{data.disputeResolution || "[Dispute Resolution]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">9. GOVERNING LAW</h3>
                <p>This Agreement shall be governed by the laws of <strong>{data.governingLaw || "[Governing Law]"}</strong>.</p>
              </div>
            </div>
          </div>
        );

      case "stock-purchase-agreement":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">STOCK PURCHASE AGREEMENT</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">1. PARTIES</h3>
                <p className="ml-4">Seller: <strong>{data.sellerName || "[Seller Name]"}</strong></p>
                <p className="ml-4">Buyer: <strong>{data.buyerName || "[Buyer Name]"}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">2. PURCHASE TERMS</h3>
                <p>Number of Shares: <strong>{data.numberOfShares || "[Number]"}</strong></p>
                <p>Price per Share: <strong>₹{data.sharePrice || "[Price]"}</strong></p>
                <p>Total Purchase Price: <strong>₹{data.totalPrice || "[Total Price]"}</strong></p>
                <p>Closing Date: <strong>{formatDate(data.closingDate)}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">3. REPRESENTATIONS & WARRANTIES</h3>
                <p className="whitespace-pre-line">{data.representations || "[Representations]"}</p>
                <p className="mt-2 whitespace-pre-line">{data.warranties || "[Warranties]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">4. COVENANTS</h3>
                <p className="whitespace-pre-line">{data.covenants || "[Covenants]"}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">5. GOVERNING LAW</h3>
                <p>This Agreement shall be governed by the laws of <strong>{data.governingLaw || "[Governing Law]"}</strong>.</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-center text-lg font-semibold">
              Agreement content will appear here
            </p>
          </div>
        );
    }
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed">
      <Letterhead />

      {renderContent()}

      <div className="mt-16 pt-8 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold mb-4">SIGNATURE</p>
            {data.includeDigitalSignature && signatureUrl ? (
              <div className="h-16 mb-4 relative">
                <img
                  src={signatureUrl}
                  alt="Digital Signature"
                  className={`h-12 object-contain ${shouldBlur ? "blur-sm" : ""}`}
                  onError={(e) => handleImageError(e, "signature")}
                />
                {shouldBlur && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400">
                    <span className="text-xs text-gray-500">
                      Signature pending approval
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-16 border-b-2 border-gray-300 mb-4"></div>
            )}
            <p className="font-bold">{data.signatoryName || "[Signatory Name]"}</p>
            <p>{data.signatoryDesignation || "[Designation]"}</p>
            <p>Date: {formatDate(data.date)}</p>
            <p>Place: {data.place || "[Place]"}</p>
          </div>

          {qrCodeUrl && (
            <div className="flex justify-end items-start">
              <QRCode value={qrCodeUrl} size={80} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
