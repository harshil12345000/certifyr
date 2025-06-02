import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Zap, Users, CheckCircle, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
const Homepage = () => {
  const features = [{
    icon: FileText,
    title: "Smart Templates",
    description: "Pre-built templates for certificates, applications, and official documents"
  }, {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate documents instantly with our advanced technology"
  }, {
    icon: Shield,
    title: "Legally Compliant",
    description: "All documents meet legal standards and institutional requirements"
  }, {
    icon: Users,
    title: "Multi-Institution",
    description: "Perfect for schools, colleges, and corporate organizations"
  }];
  const testimonials = [{
    name: "Dr. Priya Sharma",
    role: "Principal, Delhi Public School",
    content: "Certifyr has transformed how we handle document generation. What used to take hours now takes minutes.",
    rating: 5
  }, {
    name: "Rajesh Kumar",
    role: "HR Director, Tech Mahindra",
    content: "The efficiency gains are incredible. Our HR team can now focus on strategic work instead of paperwork.",
    rating: 5
  }, {
    name: "Prof. Anita Desai",
    role: "Registrar, Mumbai University",
    content: "Finally, a solution that understands Indian institutional needs. Highly recommended!",
    rating: 5
  }];
  const pricingPlans = [{
    name: "Monthly",
    price: "₹999",
    period: "per user/month",
    description: "Perfect for getting started",
    features: ["Unlimited document generation", "All template types", "Digital signatures", "Email support", "Export to PDF"]
  }, {
    name: "Annual",
    price: "₹9,999",
    period: "per user/year",
    description: "Save 17% with annual billing",
    features: ["Everything in Monthly", "Priority support", "Custom templates", "Bulk operations", "Advanced analytics"],
    popular: true
  }];
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img src="/lovable-uploads/7a143eed-6a95-4de8-927e-7c3572ae8a12.png" alt="Certifyr Logo" className="w-full h-full object-contain" />
            </div>
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

      {/* Animated Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-certifyr-blue-light/10 via-transparent to-certifyr-blue/10"></div>
        <div className="container mx-auto text-center max-w-4xl relative">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-certifyr-blue-dark via-certifyr-blue to-certifyr-blue-light bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-foreground">Your Document</span>
              <br />
              <span className="bg-gradient-to-r from-certifyr-blue to-certifyr-blue-dark bg-clip-text text-transparent">
                Workflow
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in delay-300">
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Generate <span className="font-semibold text-certifyr-blue">legally compliant</span> certificates, 
              applications, and official documents instantly. Built specifically for 
              <span className="font-semibold text-certifyr-blue-dark"> Indian institutions</span>.
            </p>
          </div>
          
          <div className="animate-fade-in delay-500 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="gradient-blue text-lg px-8 py-6 hover:scale-105 transition-transform" asChild>
              <Link to="/dashboard">
                Go to App <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
              Watch Demo
            </Button>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-certifyr-blue-light/20 rounded-full animate-pulse-soft"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-certifyr-blue/20 rounded-full animate-pulse-soft delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-8 h-8 bg-certifyr-blue-dark/20 rounded-full animate-pulse-soft delay-500"></div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in delay-700">
            <div className="text-center glass-card p-6 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-certifyr-blue-dark mb-2">1000+</div>
              <div className="text-muted-foreground">Documents Generated</div>
            </div>
            <div className="text-center glass-card p-6 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-certifyr-blue-dark mb-2">25+</div>
              <div className="text-muted-foreground">Institutions Trust Us</div>
            </div>
            <div className="text-center glass-card p-6 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-certifyr-blue-dark mb-2">79.98%</div>
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
            {features.map((feature, index) => <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-certifyr-blue/10 flex items-center justify-center text-certifyr-blue">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-certifyr-blue-dark">
              Trusted by Leading Institutions
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <div key={index} className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-certifyr-blue-dark">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for your institution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => <div key={index} className={`glass-card p-8 hover:scale-105 transition-transform relative ${plan.popular ? 'ring-2 ring-certifyr-blue' : ''}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-certifyr-blue to-certifyr-blue-dark text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-certifyr-blue-dark mb-2">{plan.price}</div>
                  <div className="text-muted-foreground">{plan.period}</div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>)}
                </ul>
                
                <Button className={`w-full ${plan.popular ? 'gradient-blue' : 'border border-certifyr-blue text-certifyr-blue hover:bg-certifyr-blue hover:text-white'}`} variant={plan.popular ? 'default' : 'outline'} asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-certifyr-blue-dark to-certifyr-blue">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of institutions already using Certifyr to streamline their document generation process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 hover:scale-105 transition-transform" asChild>
              <Link to="/dashboard">
                Go to App <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white hover:bg-white hover:scale-105 transition-all text-zinc-900">
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
                <div className="w-8 h-8 rounded flex items-center justify-center">
                  <img src="/lovable-uploads/7a143eed-6a95-4de8-927e-7c3572ae8a12.png" alt="Certifyr Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-certifyr-blue-dark">Certifyr</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Transform your document workflow with intelligent automation designed for Indian institutions.
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
    </div>;
};
export default Homepage;