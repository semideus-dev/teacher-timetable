import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

import SignUpForm from "@/modules/auth/ui/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background w-full px-4">
      <Card className="w-[90%] md:w-[40%]">
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
