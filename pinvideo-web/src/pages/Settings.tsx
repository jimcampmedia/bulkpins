import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Settings as SettingsIcon, Link2, Unlink,
  Zap, Check, Crown, CreditCard, Loader2, AlertCircle
} from "lucide-react";

interface Subscription {
  plan: string;
  videos_per_month: number;
  videos_used: number;
  price: number;
  subscription_status?: string;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    videos: 5,
    features: ["5 videos/month", "AI content generation", "Pinterest scheduling"],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$25",
    period: "/month",
    videos: 100,
    features: ["100 videos/month", "Priority support", "Advanced analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$59",
    period: "/month",
    videos: 250,
    features: ["250 videos/month", "Priority support", "Bulk scheduling"],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$199",
    period: "/month",
    videos: 1000,
    features: ["1,000 videos/month", "Dedicated support", "API access"],
  },
];

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectingPinterest, setConnectingPinterest] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSubscription();
    const pinterestStatus = searchParams.get("pinterest");
    const billingStatus = searchParams.get("billing");
    if (pinterestStatus === "connected") {
      setMessage("Pinterest connected successfully!");
      refreshUser();
    }
    if (billingStatus === "success") {
      setMessage("Subscription activated successfully!");
      refreshUser();
      loadSubscription();
    }
  }, []);

  async function loadSubscription() {
    try {
      const res = await api.getSubscription();
      if (res.ok) setSubscription(await res.json());
    } catch (err) {
      console.error("Failed to load subscription:", err);
    }
  }

  async function handleConnectPinterest() {
    setConnectingPinterest(true);
    try {
      const res = await api.getPinterestAuth();
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.auth_url;
      }
    } catch (err) {
      console.error("Failed to start Pinterest auth:", err);
    } finally {
      setConnectingPinterest(false);
    }
  }

  async function handleDisconnectPinterest() {
    if (!confirm("Disconnect your Pinterest account?")) return;
    try {
      const res = await api.disconnectPinterest();
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  }

  async function handleUpgrade(plan: string) {
    setLoading(true);
    try {
      const res = await api.createCheckout(plan);
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.checkout_url;
      } else {
        const err = await res.json();
        setMessage(err.detail || "Billing not configured yet. Please add your Stripe keys.");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setMessage("Billing is not configured yet.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    try {
      const res = await api.getPortal();
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.portal_url;
      }
    } catch (err) {
      console.error("Portal failed:", err);
    }
  }

  const usagePercent = subscription
    ? Math.min((subscription.videos_used / subscription.videos_per_month) * 100, 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account, connections, and billing.</p>
        </div>

        {message && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm rounded-lg mb-6">
            <Check className="w-4 h-4 flex-shrink-0" />
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">Name</span>
                  <span className="text-sm font-medium">{user?.name || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Plan</span>
                  <Badge variant="secondary" className="capitalize">{user?.plan}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Member since</span>
                  <span className="text-sm font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pinterest Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                Pinterest
              </CardTitle>
              <CardDescription>
                Connect your Pinterest account to schedule video pins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.pinterest_connected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Connected</p>
                      <p className="text-xs text-green-600">@{user.pinterest_username}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDisconnectPinterest}>
                    <Unlink className="w-3.5 h-3.5 mr-1.5" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleConnectPinterest}
                  disabled={connectingPinterest}
                  className="w-full justify-center"
                >
                  {connectingPinterest ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  Connect Pinterest Account
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Usage */}
          {subscription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Videos this month</span>
                      <span className="text-sm font-semibold">
                        {subscription.videos_used} / {subscription.videos_per_month}
                      </span>
                    </div>
                    <Progress value={usagePercent} />
                  </div>
                  {usagePercent >= 80 && user?.plan === "free" && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        You're running low on free videos. Upgrade to continue creating.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Plans & Billing
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrent = user?.plan === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? "border-violet-300 shadow-md" : ""} ${isCurrent ? "ring-2 ring-violet-500" : ""}`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <Badge className="bg-violet-500 border-0">Current</Badge>
                      </div>
                    )}
                    <CardContent className="p-4 pt-6">
                      <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                      <div className="mt-1 mb-3">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        <span className="text-slate-500 text-sm">{plan.period}</span>
                      </div>
                      <ul className="space-y-1.5 mb-4">
                        {plan.features.map((f) => (
                          <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        user?.plan !== "free" ? (
                          <Button variant="outline" size="sm" className="w-full" onClick={handleManageBilling}>
                            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                            Manage
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" className="w-full" disabled>
                            Current Plan
                          </Button>
                        )
                      ) : plan.id !== "free" ? (
                        <Button
                          variant={plan.popular ? "gradient" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={loading}
                        >
                          Upgrade
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
