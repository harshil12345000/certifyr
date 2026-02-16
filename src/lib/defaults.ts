import { ElementStyle } from "@/types/template-builder";

export const defaultElementStyle: ElementStyle = {
  x: 50,
  y: 50,
  width: 150,
  height: 50,
  fontSize: 12,
  fontFamily: "Arial",
  color: "#000000",
  backgroundColor: "transparent",
  borderWidth: 0,
  borderStyle: "none",
  borderColor: "#000000",
  padding: 0,
  alignment: "left",
  opacity: 1,
};

export const organizationTypes = [
  "Corporate",
  "Startup",
  "Law Agency",
  "Educational Institute",
  "Other",
];

export const organizationSizes = [
  "1-10",
  "10-50",
  "50-100",
  "100-1000",
  "1000-10000",
  "10000+",
];
