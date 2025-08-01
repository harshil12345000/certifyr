// Partial type definitions for template conversions
import type {
  EmploymentAgreementData,
  NDAData,
  FoundersAgreementData,
  StockPurchaseAgreementData,
  ArticlesOfIncorporationData,
  CorporateBylawsData
} from './corporate-templates';

// Create partial types that allow for incomplete data during conversions
export type PartialEmploymentAgreementData = Partial<EmploymentAgreementData> & {
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
};

export type PartialNDAData = Partial<NDAData> & {
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
};

export type PartialFoundersAgreementData = Partial<FoundersAgreementData> & {
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
};

export type PartialStockPurchaseAgreementData = Partial<StockPurchaseAgreementData> & {
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
};

export type PartialArticlesOfIncorporationData = Partial<ArticlesOfIncorporationData> & {
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
};

export type PartialCorporateBylawsData = Partial<CorporateBylawsData> & {
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
};