'use client';

interface BookingDetails {
  name?: string;
  dates?: string;
  roomType?: string;
  guests?: number;
  location?: string;
  [key: string]: unknown;
}

export function BookingSummaryCard({ summaryJson }: { summaryJson: string }) {
  // Defensive: if an object slips through instead of a string, stringify it
  const raw = typeof summaryJson === 'string' ? summaryJson : JSON.stringify(summaryJson);
  let details: BookingDetails;
  try {
    details = JSON.parse(raw);
  } catch {
    // If not JSON, display as plain text
    return (
      <div className="rounded-xl border border-border/50 bg-[#1a1a24] p-4">
        <p className="text-sm text-foreground/90">{raw}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-[#1a1a24] p-4">
      {details.name && (
        <h3 className="text-base font-semibold text-foreground">{details.name}</h3>
      )}
      <div className="mt-2 space-y-1.5">
        {details.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {details.location}
          </div>
        )}
        {details.dates && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {details.dates}
          </div>
        )}
        {details.roomType && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
            {details.roomType}
          </div>
        )}
        {details.guests && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {details.guests} guest{details.guests > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
