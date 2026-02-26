import { useParams, Link } from "react-router-dom";
import { Library as LibraryIcon } from "lucide-react";
import { useLibraryDocument, LibraryTag, LibraryField, LibraryDependency, LibraryAttachment } from "@/hooks/useLibrary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ExternalLink, 
  FileDown, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Globe, 
  MapPin, 
  FileText, 
  Link2,
  Paperclip,
  ListChecks,
  AlertCircle
} from "lucide-react";

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  "India": "🇮🇳",
  "UK": "🇬🇧",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
};

const TAG_COLORS: Record<string, string> = {
  country: "bg-blue-50 border-blue-300 text-blue-700",
  state: "bg-gray-50 border-gray-300 text-gray-700",
  domain: "bg-purple-50 border-purple-300 text-purple-700",
  authority: "bg-green-50 border-green-300 text-green-700",
  industry: "bg-orange-50 border-orange-300 text-orange-700",
};

function TagBadge({ tag }: { tag: LibraryTag }) {
  return (
    <Badge variant="outline" className={`${TAG_COLORS[tag.tag_type]} border text-sm`}>
      {tag.tag_type === "country" && <Globe className="w-3 h-3 mr-1" />}
      {tag.tag_type === "state" && <MapPin className="w-3 h-3 mr-1" />}
      {tag.tag_type === "domain" && <FileText className="w-3 h-3 mr-1" />}
      {tag.tag_type === "authority" && <Building2 className="w-3 h-3 mr-1" />}
      {tag.tag_name}
    </Badge>
  );
}

function FieldsTable({ fields }: { fields: LibraryField[] }) {
  if (!fields.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          Required Fields
        </CardTitle>
        <CardDescription>
          Fields that must be filled when completing this form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Field Name</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Required</th>
                <th className="text-left py-3 px-4 font-medium">Conditional</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="font-medium">{field.field_label}</div>
                    <div className="text-xs text-muted-foreground">{field.field_name}</div>
                  </td>
                  <td className="py-3 px-4 text-sm capitalize">{field.field_type}</td>
                  <td className="py-3 px-4">
                    {field.required ? (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {field.conditional_logic ? (
                      <span className="text-muted-foreground">
                        {JSON.stringify(field.conditional_logic)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DependenciesSection({ dependencies }: { dependencies: LibraryDependency[] }) {
  if (!dependencies.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Dependencies
        </CardTitle>
        <CardDescription>
          Other documents or forms that may be required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dependencies.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">{dep.dependency_name}</div>
                {dep.description && (
                  <div className="text-sm text-muted-foreground">{dep.description}</div>
                )}
              </div>
              {dep.dependency_slug && (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/library/${dep.dependency_slug}`}>
                    View
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AttachmentsSection({ attachments }: { attachments: LibraryAttachment[] }) {
  if (!attachments.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Required Attachments
        </CardTitle>
        <CardDescription>
          Documents that must be uploaded with this form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{att.attachment_name}</div>
                  {att.description && (
                    <div className="text-sm text-muted-foreground">{att.description}</div>
                  )}
                </div>
              </div>
              {att.is_required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LibraryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useLibraryDocument(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <LibraryIcon className="w-6 h-6" />
              <span className="font-semibold text-lg">Certifyr</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <LibraryIcon className="w-6 h-6" />
              <span className="font-semibold text-lg">Certifyr</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Document Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The requested document could not be found.
              </p>
              <Button asChild>
                <Link to="/library">Back to Library</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { document, tags, fields, dependencies, attachments } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LibraryIcon className="w-6 h-6" />
            <span className="font-semibold text-lg">Certifyr</span>
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="text-4xl">{COUNTRY_FLAGS[document.country] || "🌐"}</span>
              <div className="flex-1">
                <CardTitle className="text-2xl">{document.official_name}</CardTitle>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-sm">
                    <Globe className="w-3 h-3 mr-1" />
                    {document.country}
                  </Badge>
                  {document.state && (
                    <Badge variant="outline" className="text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {document.state}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm">
                    <Building2 className="w-3 h-3 mr-1" />
                    {document.authority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Version: {document.version}
              </span>
              {document.last_verified_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Verified: {new Date(document.last_verified_at).toLocaleDateString()}
                </span>
              )}
              {document.needs_review && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs Review
                </Badge>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> Certifyr does not provide legal advice. Always verify 
                  information with the official authority before proceeding.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {document.full_description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.full_description}</p>
            </CardContent>
          </Card>
        )}

        {document.purpose && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.purpose}</p>
            </CardContent>
          </Card>
        )}

        {document.who_must_file && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Who Must File</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.who_must_file}</p>
            </CardContent>
          </Card>
        )}

        {document.filing_method && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filing Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.filing_method}</p>
            </CardContent>
          </Card>
        )}

        <DependenciesSection dependencies={dependencies} />
        <AttachmentsSection attachments={attachments} />
        <FieldsTable fields={fields} />

        {(document.official_source_url || document.official_pdf_url) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.official_source_url && (
                <a
                  href={document.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Official Source</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {document.official_source_url}
                    </div>
                  </div>
                </a>
              )}
              {document.official_pdf_url && (
                <a
                  href={document.official_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <FileDown className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Official PDF Form</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {document.official_pdf_url}
                    </div>
                  </div>
                </a>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Links open in a new tab. Always verify you're on the official government website.
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
