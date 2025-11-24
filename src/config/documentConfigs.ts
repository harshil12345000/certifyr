export const bonafideConfig = {
  id: "bonafide",
  name: "Bonafide Certificate",
  category: "academic",
  layoutType: "certificate",
  
  sections: [
    {
      id: "person-details",
      title: "Person Details",
      columns: 1,
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Name must be at least 2 characters" }
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
          ]
        },
        {
          name: "parentName",
          label: "Parent's Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Parent name must be at least 2 characters" }
        },
        {
          name: "type",
          label: "Person Type",
          type: "select",
          required: true,
          options: [
            { value: "student", label: "Student" },
            { value: "employee", label: "Employee" }
          ]
        }
      ]
    },
    {
      id: "institution-role",
      title: "Institution & Role",
      columns: 1,
      fields: [
        {
          name: "institutionName",
          label: "Institution Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Institution name is required" }
        },
        {
          name: "startDate",
          label: "Start Date",
          type: "date",
          required: true
        },
        {
          name: "courseOrDesignation",
          label: "Course/Designation",
          type: "text",
          required: true,
          dynamicLabel: (data: any) => data.type === "student" ? "Course Name" : "Designation",
          validation: { minLength: 2, message: "Course/Designation is required" }
        },
        {
          name: "department",
          label: "Department",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Department is required" }
        }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 1,
      fields: [
        {
          name: "purpose",
          label: "Purpose",
          type: "textarea",
          required: true,
          placeholder: "e.g., passport application, bank account, visa processing",
          validation: { minLength: 2, message: "Purpose is required" }
        },
        {
          name: "date",
          label: "Issue Date",
          type: "date",
          required: true
        },
        {
          name: "place",
          label: "Place",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Place is required" }
        }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        {
          name: "signatoryName",
          label: "Signatory Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Signatory name is required" }
        },
        {
          name: "signatoryDesignation",
          label: "Designation",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Designation is required" }
        },
        {
          name: "includeDigitalSignature",
          label: "Digital Signature",
          type: "switch",
          description: "Include digital signature in the certificate",
          defaultValue: false
        }
      ]
    }
  ]
};
