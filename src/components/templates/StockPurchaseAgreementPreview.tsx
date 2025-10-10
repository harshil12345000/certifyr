import React, { useState, useEffect } from "react";
import { StockPurchaseAgreementPreviewProps } from "@/types/templates";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Letterhead } from "./Letterhead";
import { QRCode } from "./QRCode";
import { generateDocumentQRCode } from "@/lib/qr-utils";

interface ExtendedStockPurchaseAgreementPreviewProps
  extends StockPurchaseAgreementPreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: "pending" | "approved" | "rejected";
}

export const StockPurchaseAgreementPreview: React.FC<
  ExtendedStockPurchaseAgreementPreviewProps
> = ({ data, isEmployeePreview = false, requestStatus = "pending" }) => {
  const {
    companyName,
    seller,
    buyer,
    shares,
    pricePerShare,
    totalConsideration,
    closingDate,
    representations,
    warranties,
    covenants,
    governingLaw,
    date: issueDate,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, organizationDetails, organizationId } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shouldBlur = isEmployeePreview && requestStatus !== "approved";

  useEffect(() => {
    const generateQR = async () => {
      if (companyName && seller && buyer) {
        const url = await generateDocumentQRCode(
          "stock-purchase-agreement-1",
          data,
          organizationId || undefined,
          user?.id,
        );
        setQrCodeUrl(url);
      }
    };
    generateQR();
  }, [data, organizationId, user?.id, companyName, seller, buyer]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    type: string,
  ) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = "none";
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Document Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            STOCK PURCHASE AGREEMENT
          </h2>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{companyName}</h1>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PARTIES</h3>
        <p>
          <strong>Purchaser:</strong> {buyer.name}
        </p>
        <p className="ml-4 whitespace-pre-line">{buyer.address}</p>
        <p className="mt-2">
          <strong>Seller:</strong> {seller.name}
        </p>
        <p className="ml-4 whitespace-pre-line">{seller.address}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">PURCHASE TERMS</h3>
        <p>
          <strong>Company:</strong> {companyName}
        </p>
        <p>
          <strong>Share Class:</strong> {shares.class}
        </p>
        <p>
          <strong>Number of Shares:</strong> {shares.quantity}
        </p>
        <p>
          <strong>Price per Share:</strong> {pricePerShare}
        </p>
        <p>
          <strong>Total Purchase Price:</strong> {totalConsideration}
        </p>
        <p>
          <strong>Closing Date:</strong>{" "}
          {closingDate ? new Date(closingDate).toLocaleDateString() : "[Date]"}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">TRANSFER RESTRICTIONS</h3>
        <p>{data.restrictionsOnTransfer}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">
          REPRESENTATIONS AND WARRANTIES
        </h3>
        <p>{representations}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">GOVERNING LAW</h3>
        <p>This Agreement shall be governed by the laws of {governingLaw}.</p>
      </div>

      <div className="mt-12">
        <p className="mb-6">
          IN WITNESS WHEREOF, the parties have executed this Agreement as of{" "}
          {issueDate ? new Date(issueDate).toLocaleDateString() : "[Date]"}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{buyer.name}</p>
            <p className="text-sm">Purchaser</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-semibold">{seller.name}</p>
            <p className="text-sm">Seller</p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-8">
          <div>
            <p className="text-sm">
              <strong>Date:</strong>{" "}
              {issueDate ? new Date(issueDate).toLocaleDateString() : "[Date]"}
            </p>
            <p className="text-sm">
              <strong>Place:</strong> {data.place || "[Place]"}
            </p>
          </div>

          <div className="text-right">
            {includeDigitalSignature && signatureUrl ? (
              <div className="h-16 mb-4 flex justify-end relative">
                <div className="border-b border-gray-800 px-6">
                  <img
                    src={signatureUrl}
                    alt="Digital Signature"
                    className={`h-12 object-contain ${shouldBlur ? "blur-sm" : ""}`}
                    onError={(e) => handleImageError(e, "signature")}
                  />
                </div>
                {shouldBlur && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400">
                    <span className="text-xs text-gray-500">
                      Signature pending approval
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-16 mb-4"></div>
            )}
            <p className="text-sm">
              <strong>{signatoryName || "[Signatory Name]"}</strong>
            </p>
            <p className="text-sm">{signatoryDesignation || "[Title]"}</p>
            <p className="text-sm mb-4">{data.place || "[Institution Name]"}</p>

            {/* QR Code positioned below institution name */}
            {qrCodeUrl && (
              <div className="flex justify-end">
                <QRCode value={qrCodeUrl} size={60} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
