import { Loading } from "@/components/common/loading";

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
