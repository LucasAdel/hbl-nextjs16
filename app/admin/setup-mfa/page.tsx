"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, CheckCircle, Copy, AlertCircle } from "lucide-react";

export default function SetupMfaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"loading" | "setup" | "verify" | "complete">("loading");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  async function checkMfaStatus() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check if MFA is already set up
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasTotp = factors?.totp?.some((f) => f.status === "verified");

    if (hasTotp) {
      setStep("complete");
    } else {
      await setupMfa();
    }
  }

  async function setupMfa() {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("setup");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up MFA");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyMfa() {
    if (verifyCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      setStep("complete");

      // Redirect to admin after short delay
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>MFA Enabled</CardTitle>
            <CardDescription>
              Your account is now protected with two-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin")}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Continue to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
            <Shield className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Admin accounts require MFA for additional security.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "setup" && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  1. Install an authenticator app like Google Authenticator or Authy
                </p>
                <p className="text-sm text-gray-600">
                  2. Scan this QR code with your authenticator app:
                </p>

                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copySecret}
                      title="Copy secret"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep("verify")}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                I&apos;ve scanned the QR code
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code from your authenticator app:
                </p>

                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("setup")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={verifyMfa}
                  disabled={isLoading || verifyCode.length !== 6}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
