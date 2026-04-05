// app/student/add-course/_components/TermFilter.js
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TermFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grab the current term from the URL so the dropdown remembers what was selected
  const currentTerm = searchParams.get("term") || "";

  const handleTermChange = (e) => {
    const term = e.target.value;
    if (term) {
      router.push(`/student/add-course?term=${term}`);
    } else {
      // If they select "All Terms", clear the URL
      router.push(`/student/add-course`);
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '20px', maxWidth: '300px' }}>
      <label className="form-label">Filter by Term</label>
      <select className="form-control" value={currentTerm} onChange={handleTermChange}>
        <option value="">All Terms</option>
        <option value="F">Fall (F)</option>
        <option value="W">Winter (W)</option>
        <option value="FW">Fall/Winter (FW)</option>
        <option value="S">Summer Full (S)</option>
        <option value="S1">Summer 1 (S1)</option>
        <option value="S2">Summer 2 (S2)</option>
      </select>
    </div>
  );
}