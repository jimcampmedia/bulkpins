import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Video, Calendar, Check, ArrowRight, 
  Image, Clock, TrendingUp, Shield 
} from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    videos: 5,
    features: ["5 videos per month", "AI content generation", "Pinterest scheduling", "Basic analytics"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    price: "$25",
    period: "/month",
    videos: 100,
    features: ["100 videos per month", "AI content generation", "Pinterest scheduling", "Priority support", "Advanced analytics"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$59",
    period: "/month",
    videos: 250,
    features: ["250 videos per month", "AI content generation", "Pinterest scheduling", "Priority support", "Advanced analytics", "Bulk scheduling"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    price: "$199",
    period: "/month",
    videos: 1000,
    features: ["1,000 videos per month", "AI content generation", "Pinterest scheduling", "Dedicated support", "Custom analytics", "API access", "Team features"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                BulkPins
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">Features</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">How it Works</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Powered by AI
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
            Turn Images into
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"> Viral Video Pins</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Upload an image, let AI animate it into a stunning video, generate optimized titles & descriptions, 
            and auto-schedule to Pinterest. All in one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="gradient" size="xl" className="w-full sm:w-auto">
                Start Creating for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                See How it Works
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-500">No credit card required. 5 free videos per month.</p>
        </div>

        {/* Hero visual */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="bg-gradient-to-br from-pink-50 via-violet-50 to-blue-50 rounded-2xl p-8 border border-slate-200 shadow-2xl shadow-violet-500/10">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="w-full aspect-square bg-gradient-to-br from-pink-200 to-violet-200 rounded-lg flex items-center justify-center mb-3">
                    <Image className="w-8 h-8 text-violet-500" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Upload Image</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Generating video...</p>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-slate-900">AI-Generated Content</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Title</p>
                    <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded w-4/5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Description</p>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-5/6" />
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Tags</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {["trending", "viral", "creative", "inspiration"].map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">Auto-scheduled for optimal engagement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Go Viral on Pinterest</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From image to published video pin in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Image, title: "Image to Video", desc: "AI-powered animation transforms static images into eye-catching videos" },
              { icon: Sparkles, title: "AI Content", desc: "Auto-generate Pinterest-optimized titles, descriptions, and tags" },
              { icon: Clock, title: "Smart Scheduling", desc: "Auto-schedule posts at optimal times for maximum engagement" },
              { icon: TrendingUp, title: "Pinterest SEO", desc: "Content follows Pinterest best practices for search and discovery" },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Three simple steps to Pinterest success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Your Image", desc: "Drop any image and add a brief description of what you're promoting." },
              { step: "2", title: "AI Does the Magic", desc: "We animate your image, generate SEO-optimized titles, descriptions, and tags." },
              { step: "3", title: "Auto-Publish", desc: "Select a board and we auto-schedule at the perfect time for engagement." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-2 border-violet-500 shadow-lg shadow-violet-500/10" : "border-slate-200"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 border-0">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-1">{plan.videos} videos/month</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button
                      variant={plan.popular ? "gradient" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-pink-500 to-violet-600 rounded-3xl p-12 text-white">
            <Shield className="w-12 h-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Pinterest Presence?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of creators using AI to create stunning video pins.
            </p>
            <Link to="/register">
              <Button size="xl" className="bg-white text-violet-600 hover:bg-slate-100">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                BulkPins
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-slate-700 underline">Privacy Policy</Link>
              <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} BulkPins. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
