import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { flowId } = await req.json();

    console.log("set-flowid.tsx: flowId=" + flowId);

    if (!flowId) {
        return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
    }

    // Set the flowId into a cookie with HttpOnly flag
    const response = NextResponse.json({ message: 'FlowId cookie set' });
    response.cookies.set('flowId', flowId, { httpOnly: true, path: '/' });
    return response;
}