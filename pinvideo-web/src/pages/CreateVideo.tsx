import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Sparkles, ArrowRight, Loader2, Check, AlertCircle
} from "lucide-react";

export default function CreateVideo() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    id: string;
    title: string;
    description: string;
    tags: string;
    video_url: string;
    thumbnail_url: string;
  } | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
      setStep(2);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(dropped);
      setStep(2);
    }
  }

  async function handleGenerate() {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.generateVideo(file, description, sourceUrl);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Generation failed");
      }
      const data = await res.json();
      setResult(data);
      setStep(3);
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Video Pin</h1>
          <p className="text-slate-500 mt-1">Upload an image and let AI do the rest.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { num: 1, label: "Upload Image" },
            { num: 2, label: "Add Details" },
            { num: 3, label: "Review & Schedule" },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                  step >= num
                    ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              <span className={`text-sm hidden sm:block ${step >= num ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                {label}
              </span>
              {num < 3 && <div className={`flex-1 h-px ${step > num ? "bg-violet-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <Card>
            <CardContent className="p-8">
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-violet-300 hover:bg-violet-50/30 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Drop your image here
                </h3>
                <p className="text-slate-500 mb-4">or click to browse</p>
                <p className="text-xs text-slate-400">Supports JPG, PNG, WebP up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {preview && (
                    <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Description <span className="text-slate-400 font-normal">(helps AI generate better content)</span>
                      </label>
                      <Textarea
                        placeholder="e.g., Beautiful sunset over the ocean, perfect for travel inspiration boards..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Link URL <span className="text-slate-400 font-normal">(optional - where the pin links to)</span>
                      </label>
                      <Input
                        type="url"
                        placeholder="https://yourwebsite.com/page"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="gradient"
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Video Pin
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-slate-100 relative">
                {result.thumbnail_url && (
                  <img
                    src={result.thumbnail_url}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-500 border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Generated
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Title</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{result.title}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</label>
                    <p className="text-sm text-slate-600 mt-1">{result.description}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Tags</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.tags?.split(",").map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-sm">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => navigate(`/dashboard/schedule?video=${result.id}`)}
              >
                Schedule to Pinterest
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
