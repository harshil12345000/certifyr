
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Zap, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Homepage = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart Templates",
      description: "Pre-built templates for certificates, applications, and official documents"
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Generate documents instantly with our advanced AI technology"
    },
    {
      icon: Shield,
      title: "Legally Compliant",
      description: "All documents meet legal standards and institutional requirements"
    },
    {
      icon: Users,
      title: "Multi-Institution",
      description: "Perfect for schools, colleges, and corporate organizations"
    }
  ];

  const benefits = [
    "Generate certificates in seconds",
    "Reduce manual paperwork by 90%",
    "Ensure consistent formatting",
    "Digital signature integration",
    "Bulk document generation",
    "Secure document storage"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-certifyr-blue-light to-certifyr-blue-dark"></div>
            <span className="text-xl font-bold text-certifyr-blue-dark">Certifyr</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Log In</Link>
            </Button>
            <Button className="gradient-blue" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-certifyr-blue-dark via-certifyr-blue to-certifyr-blue-light bg-clip-text text-transparent">
            AI Document Generation for Institutions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate legally compliant certificates, applications, and official documents instantly. 
            Perfect for educational institutions and corporate organizations across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gradient-blue text-lg px-8 py-6" asChild>
              <Link to="/">
                Go to App <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-certifyr-blue-dark mb-2">10,000+</div>
              <div className="text-muted-foreground">Documents Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-certifyr-blue-dark mb-2">500+</div>
              <div className="text-muted-foreground">Institutions Trust Us</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-certifyr-blue-dark mb-2">99.9%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-certifyr-blue-dark">
              Powerful Features for Modern Institutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline your document generation process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-certifyr-blue-dark">
                Transform Your Document Workflow
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Say goodbye to manual document creation and embrace the future of institutional paperwork.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="glass-card p-8 bg-gradient-to-br from-certifyr-blue-light/20 to-certifyr-blue/20">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-certifyr-blue-light to-certifyr-blue-dark flex items-center justify-center">
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-certifyr-blue-dark to-certifyr-blue">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of institutions already using Certifyr to streamline their document generation process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/">
                Go to App <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-certifyr-blue-dark">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-certifyr-blue-light to-certifyr-blue-dark"></div>
                <span className="text-xl font-bold text-certifyr-blue-dark">Certifyr</span>
              </div>
              <p className="text-muted-foreground mb-4">
                AI-powered document generation for educational and corporate institutions in India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <div><a href="#" className="text-muted-foreground hover:text-primary">Features</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary">Templates</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary">Pricing</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <div><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary">Contact Us</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></div>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Certifyr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
