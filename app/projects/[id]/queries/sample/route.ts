import { NextResponse } from "next/server";

const SAMPLE_CSV = `query,intent,priority
ai overview visibility,informational,1
seo tooling pricing,commercial,2
`;

export function GET() {
  return new NextResponse(SAMPLE_CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"queries-sample.csv\""
    }
  });
}
