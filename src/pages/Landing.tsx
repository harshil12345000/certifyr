import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Lock
} from "lucide-react";

const Landing = () => {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Don't render anything until we know auth state
  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: "Easy & Fast",
      description: "Create official documents within minutes, simple & quick."
    },
    {
      icon: Globe,
      title: "Multi-Format", 
      description: "Generate documents in your preferred format."
    },
    {
      icon: Lock,
      title: "Safe & Secure",
      description: "Documents are safe and secure, stored locally by you."
    },
    {
      icon: Shield,
      title: "Legally Reliable",
      description: "Documents already legally reliable, no-stress."
    }
  ];

  const problemsToSolve = [
    "rejected documents",
    "invalid certificates", 
    "unnecessary complexity",
    "messy letters",
    "wasted time",
    "unverified docs",
    "going to the admin office"
  ];

  const stats = [
    { value: "100+", label: "Tasks Completed" },
    { value: "<1 Min", label: "Average Generation Time" },
    { value: "48%", label: "Faster Document Generation" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Certifyr</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 bg-white/80 backdrop-blur-sm">
            Join the Waitlist Now!
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Legally reliable document creation with instant QR verification.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Generate legally reliable certificates, letters, applications, and official documents instantly, built for organizations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg min-w-[300px]">
              <span className="text-muted-foreground">Enter your email</span>
            </div>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 border">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-200 shadow-2xl p-8">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Certifyr</span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-left text-muted-foreground">
                  Search documents...
                </div>
                <div className="text-sm text-muted-foreground">acmecorp@email.com</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Bonafide Certificate</h3>
                  <p className="text-sm text-blue-700">Standard bonafide certificate for students or employees.</p>
                  <Button size="sm" variant="outline" className="mt-3">Use →</Button>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Experience Letter</h3>
                  <p className="text-sm text-green-700">Formal letter confirming an individual's work experience.</p>
                  <Button size="sm" variant="outline" className="mt-3">Use →</Button>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Character Certificate</h3>
                  <p className="text-sm text-purple-700">Certificate attesting to an individual's moral character.</p>
                  <Button size="sm" variant="outline" className="mt-3">Use →</Button>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">NOC for Visa</h3>
                  <p className="text-sm text-orange-700">No Objection Certificate for employees/students applying for a visa.</p>
                  <Button size="sm" variant="outline" className="mt-3">Use →</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Wave goodbye section */}
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Wave goodbye to
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {problemsToSolve.map((problem, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full text-muted-foreground">
                  {problem}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 text-center">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Users Are Saying About Us
            </h2>
            <p className="text-lg text-muted-foreground">
              48% Faster official document generations.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg text-muted-foreground mb-6">
              "Certifyr has completely transformed how our team manages official documents. 
              The QR verification feature gives us confidence in document authenticity."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="text-left">
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-sm text-muted-foreground">HR Director, TechCorp</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to transform your document workflow?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of organizations already using Certifyr for their document needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Certifyr</span>
          </div>
          <p className="text-muted-foreground">
            Legally reliable document creation with instant QR verification.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;