import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

import SignInForm from "@/modules/auth/ui/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background w-full px-4">
      <Card className="w-[90%] md:w-[40%]">
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
