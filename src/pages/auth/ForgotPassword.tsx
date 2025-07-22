import { useState } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MailIcon, ArrowLeftIcon, Loader2, ShieldIcon } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ForgotPasswordContent = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("email"); // email, questions, success
  const [securityQuestions, setSecurityQuestions] = useState(null);
  const [answers, setAnswers] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
  });

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error(t("pleaseEnterEmail") || "Please enter your email");
      setIsLoading(false);
      return;
    }

    // Validate email format
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      toast.error(t("invalidEmailFormat") || "Invalid email format");
      setIsLoading(false);
      return;
    }

    try {
      // Check for security questions first
      const { data: securityQuestionsData, error: securityQuestionsError } =
        await supabase
          .from("security_questions")
          .select("*")
          .ilike("email", normalizedEmail)
          .maybeSingle();

      if (
        securityQuestionsError &&
        securityQuestionsError.code !== "PGRST116"
      ) {
        console.error(
          "Error checking security questions:",
          securityQuestionsError
        );
        toast.error(t("errorProcessingRequest") || "Error processing request");
        setIsLoading(false);
        return;
      }

      // If security questions exist, use them for verification
      if (securityQuestionsData) {
        // Get the specific questions for this user
        const { data: questions, error: questionsError } = await supabase.rpc(
          "get_security_questions",
          { user_email: normalizedEmail }
        );

        if (questionsError) {
          console.error("Error fetching security questions:", questionsError);
          // Fall back to email reset
          sendPasswordResetEmail(normalizedEmail);
          return;
        }

        if (questions && questions.length > 0) {
          // Show security questions form
          setSecurityQuestions(questions[0]);
          setCurrentStep("questions");
          setIsLoading(false);
          return;
        }
      }

      // No security questions, send email reset
      sendPasswordResetEmail(normalizedEmail);
    } catch (error) {
      console.error("Error in forgot password flow:", error);
      toast.error(t("errorProcessingRequest") || "Error processing request");
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);

        // For security, still show success even if user not found
        if (error.message.includes("User not found")) {
          setCurrentStep("success");
          toast.success(
            t("passwordResetEmailSent") || "Password reset email sent"
          );
        } else {
          toast.error(
            error.message ||
              t("passwordResetError") ||
              "Error sending reset email"
          );
        }
      } else {
        setCurrentStep("success");
        toast.success(
          t("passwordResetEmailSent") || "Password reset email sent"
        );
      }
    } catch (error) {
      console.error("Exception sending reset email:", error);
      toast.error(t("passwordResetError") || "Error sending reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate answers
    if (!answers.answer1 || !answers.answer2 || !answers.answer3) {
      toast.error(t("allAnswersRequired") || "All answers are required");
      setIsLoading(false);
      return;
    }

    try {
      // Verify security question answers
      const { data: isCorrect, error } = await supabase.rpc(
        "check_security_questions",
        {
          user_email: email.trim().toLowerCase(),
          q1_answer: answers.answer1.trim(),
          q2_answer: answers.answer2.trim(),
          q3_answer: answers.answer3.trim(),
        }
      );

      if (error) {
        console.error("Error checking security answers:", error);
        toast.error(t("errorCheckingAnswers") || "Error verifying answers");
        setIsLoading(false);
        return;
      }

      // If answers are incorrect
      if (!isCorrect) {
        toast.error(t("incorrectAnswers") || "Incorrect answers");
        setIsLoading(false);
        return;
      }

      // Answers are correct, send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        console.error("Error sending reset email:", resetError);
        toast.error(
          resetError.message ||
            t("passwordResetError") ||
            "Error sending reset email"
        );
        setIsLoading(false);
        return;
      }

      // Success
      setCurrentStep("success");
      toast.success(t("passwordResetEmailSent") || "Password reset email sent");
    } catch (error) {
      console.error("Error in security questions verification:", error);
      toast.error(t("errorProcessingRequest") || "Error processing request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                {t("forgotPasswordTitle") || "Forgot Password"}
              </CardTitle>
              <CardDescription>
                {t("forgotPasswordDescription") ||
                  "Enter your email to reset your password"}
              </CardDescription>
            </CardHeader>

            {currentStep === "email" && (
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email") || "Email"}</Label>
                    <div className="relative">
                      <MailIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10 rtl:pl-4 rtl:pr-10"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("checking") || "Checking..."}
                      </>
                    ) : (
                      t("continue") || "Continue"
                    )}
                  </Button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center text-safedrop-gold hover:underline"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("backToLogin") || "Back to Login"}
                  </Link>
                </CardFooter>
              </form>
            )}

            {currentStep === "questions" && securityQuestions && (
              <form onSubmit={handleAnswersSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="mb-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        {t("securityQuestionsVerification") ||
                          "Please answer your security questions"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="answer1">
                        {securityQuestions.question_1}
                      </Label>
                      <Input
                        id="answer1"
                        name="answer1"
                        type="text"
                        value={answers.answer1}
                        onChange={handleAnswerChange}
                        placeholder={
                          t("securityAnswerPlaceholder") || "Your answer"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="answer2">
                        {securityQuestions.question_2}
                      </Label>
                      <Input
                        id="answer2"
                        name="answer2"
                        type="text"
                        value={answers.answer2}
                        onChange={handleAnswerChange}
                        placeholder={
                          t("securityAnswerPlaceholder") || "Your answer"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="answer3">
                        {securityQuestions.question_3}
                      </Label>
                      <Input
                        id="answer3"
                        name="answer3"
                        type="text"
                        value={answers.answer3}
                        onChange={handleAnswerChange}
                        placeholder={
                          t("securityAnswerPlaceholder") || "Your answer"
                        }
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("verifying") || "Verifying..."}
                      </>
                    ) : (
                      t("verifyAnswers") || "Verify Answers"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setCurrentStep("email")}
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t("back") || "Back"}
                  </Button>
                </CardFooter>
              </form>
            )}

            {currentStep === "success" && (
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-green-600">
                    {t("passwordResetEmailSentDescription") ||
                      "A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password."}
                  </p>

                  <Button
                    className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90"
                    onClick={() => navigate("/login")}
                  >
                    {t("backToLogin") || "Back to Login"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ForgotPassword = () => {
  return (
    <LanguageProvider>
      <ForgotPasswordContent />
    </LanguageProvider>
  );
};

export default ForgotPassword;
