import ReportDetailClient from "./ReportDetailClient";

export function generateStaticParams() {
  // Static export requires at least one pre-rendered route for dynamic segments
  return [{ id: "fallback" }];
}

export default function Page() {
  return <ReportDetailClient />;
}
