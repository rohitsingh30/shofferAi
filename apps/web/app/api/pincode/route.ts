import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('code');

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      next: { revalidate: 86400 }, // cache 24h
    });
    const data = await res.json();

    if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length) {
      const po = data[0].PostOffice[0];
      return NextResponse.json({
        city: po.District || po.Division || '',
        state: po.State || '',
      });
    }
    return NextResponse.json({ city: '', state: '' });
  } catch {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 502 });
  }
}
