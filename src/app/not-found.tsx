import { ErrorDisplay } from "@/components/common/error";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorDisplay
        type="404"
        showRetry={false}
        showHome={true}
        showBack={true}
      />
    </div>
  );
}
