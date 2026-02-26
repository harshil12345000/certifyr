import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  "India": "🇮🇳",
  "UK": "🇬🇧",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    let documents: any[] = [];
    let document: any = null;

    if (slug) {
      const { data: doc, error } = await supabase
        .from("library_documents")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (!error && doc) {
        document = doc;
        
        const { data: fields } = await supabase
          .from("library_fields")
          .select("*")
          .eq("document_id", doc.id);
        
        const { data: attachments } = await supabase
          .from("library_attachments")
          .select("*")
          .eq("document_id", doc.id);
        
        const { data: deps } = await supabase
          .from("library_dependencies")
          .select("*")
          .eq("document_id", doc.id);

        document.fields = fields || [];
        document.attachments = attachments || [];
        document.dependencies = deps || [];
      }
    } else {
      const { data: docs, error } = await supabase
        .from("library_documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (!error) {
        documents = docs || [];
      }
    }

    const htmlContent = generateHTML(documents, document, supabaseUrl);
    
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateHTML(documents: any[], document: any, supabaseUrl: string): string {
  const siteTitle = "Certifyr Legal Library";
  const siteDescription = "Browse and explore legal documents, forms, and compliance requirements from around the world. Find GST registration, business licenses, tax IDs, and more.";
  
  if (document) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "GovernmentPermit",
      "name": document.form_name || document.official_name,
      "alternateName": document.official_name,
      "description": document.full_description || document.short_description || document.purpose,
      "jurisdiction": {
        "@type": "Country",
        "name": document.country
      },
      "issuingAuthority": document.authority,
      "category": document.domain,
      "url": document.official_source_url || `${supabaseUrl}/library/${document.slug}`,
      "potentialAction": {
        "@type": "ApplyAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": document.official_source_url || `${supabaseUrl}/library/${document.slug}`,
          "actionPlatform": ["DesktopWeb", "MobileWeb"]
        }
      }
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.form_name || document.official_name} - Legal Library | Certifyr</title>
  <meta name="description" content="${document.full_description || document.short_description || document.purpose || `${document.form_name || document.official_name} - ${document.authority} - ${document.country}`}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${document.form_name || document.official_name} - Legal Library">
  <meta property="og:description" content="${document.full_description || document.short_description || document.purpose || `${document.form_name || document.official_name} - ${document.authority}`}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${supabaseUrl}/library/${document.slug}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <header>
    <h1>${document.form_name || document.official_name}</h1>
    ${document.form_name && document.official_name !== document.form_name ? `<p>Official Name: ${document.official_name}</p>` : ''}
  </header>
  <main>
    <section>
      <h2>Overview</h2>
      <p><strong>Country:</strong> ${COUNTRY_FLAGS[document.country] || '🌐'} ${document.country}</p>
      ${document.state ? `<p><strong>State:</strong> ${document.state}</p>` : ''}
      <p><strong>Authority:</strong> ${document.authority}</p>
      <p><strong>Domain:</strong> ${document.domain}</p>
      ${document.version ? `<p><strong>Version:</strong> ${document.version}</p>` : ''}
    </section>
    
    ${document.purpose ? `
    <section>
      <h2>Purpose</h2>
      <p>${document.purpose}</p>
    </section>
    ` : ''}
    
    ${document.full_description ? `
    <section>
      <h2>Description</h2>
      <p>${document.full_description}</p>
    </section>
    ` : ''}
    
    ${document.who_must_file ? `
    <section>
      <h2>Who Must File</h2>
      <p>${document.who_must_file}</p>
    </section>
    ` : ''}
    
    ${document.filing_method ? `
    <section>
      <h2>Filing Method</h2>
      <p>${document.filing_method}</p>
    </section>
    ` : ''}
    
    ${document.fields && document.fields.length > 0 ? `
    <section>
      <h2>Required Fields</h2>
      <ul>
        ${document.fields.map((f: any) => `<li><strong>${f.field_label}</strong> (${f.field_type})${f.required ? ' - Required' : ''}</li>`).join('')}
      </ul>
    </section>
    ` : ''}
    
    ${document.attachments && document.attachments.length > 0 ? `
    <section>
      <h2>Required Attachments</h2>
      <ul>
        ${document.attachments.map((a: any) => `<li>${a.attachment_name}${a.is_required ? ' (Required)' : ''}${a.description ? `: ${a.description}` : ''}</li>`).join('')}
      </ul>
    </section>
    ` : ''}
    
    ${document.dependencies && document.dependencies.length > 0 ? `
    <section>
      <h2>Dependencies</h2>
      <ul>
        ${document.dependencies.map((d: any) => `<li>${d.dependency_name}${d.description ? `: ${d.description}` : ''}</li>`).join('')}
      </ul>
    </section>
    ` : ''}
    
    <section>
      <h2>Links</h2>
      ${document.official_source_url ? `<p><a href="${document.official_source_url}" target="_blank" rel="noopener">Official Source Website</a></p>` : ''}
      ${document.official_pdf_url ? `<p><a href="${document.official_pdf_url}" target="_blank" rel="noopener">Download Official PDF Form</a></p>` : ''}
    </section>
  </main>
  <footer>
    <p><a href="${supabaseUrl}/library">Browse More Documents</a></p>
    <p>Powered by <a href="${supabaseUrl}">Certifyr</a> - Legal Document Management</p>
  </footer>
</body>
</html>`;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteTitle,
    "description": siteDescription,
    "url": `${supabaseUrl}/library`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${supabaseUrl}/library?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const docsHtml = documents.map(doc => `
    <article>
      <h2>${COUNTRY_FLAGS[doc.country] || '🌐'} ${doc.form_name || doc.official_name}</h2>
      <p><strong>Country:</strong> ${doc.country}${doc.state ? `, ${doc.state}` : ''}</p>
      <p><strong>Authority:</strong> ${doc.authority}</p>
      <p><strong>Domain:</strong> ${doc.domain}</p>
      ${doc.short_description ? `<p>${doc.short_description}</p>` : ''}
      <p><a href="${supabaseUrl}/library/${doc.slug}">View Details</a></p>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteTitle}</title>
  <meta name="description" content="${siteDescription}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${siteTitle}">
  <meta property="og:description" content="${siteDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${supabaseUrl}/library">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <header>
    <h1>${siteTitle}</h1>
    <p>${siteDescription}</p>
  </header>
  <main>
    <section>
      <h2>Available Documents (${documents.length})</h2>
      ${documents.length > 0 ? docsHtml : '<p>No documents available yet.</p>'}
    </section>
    <section>
      <h2>Browse by Country</h2>
      <ul>
        ${[...new Set(documents.map((d: any) => d.country))].map((country: any) => 
          `<li>${COUNTRY_FLAGS[country] || '🌐'} ${country}</li>`
        ).join('')}
      </ul>
    </section>
    <section>
      <h2>Browse by Domain</h2>
      <ul>
        ${[...new Set(documents.map((d: any) => d.domain))].map((domain: any) => 
          `<li>${domain}</li>`
        ).join('')}
      </ul>
    </section>
  </main>
  <footer>
    <p>Powered by <a href="${supabaseUrl}">Certifyr</a> - Legal Document Management</p>
  </footer>
</body>
</html>`;
}
