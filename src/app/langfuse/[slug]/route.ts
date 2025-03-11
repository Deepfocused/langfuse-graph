// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    const { slug } = await params; // 'time', 'token', 'call', 'summary'
    return NextResponse.json({ success: 'ok!' }, { status: 200 });
}
