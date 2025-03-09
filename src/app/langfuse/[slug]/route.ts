// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    const { slug } = await params // 'a', 'b', or 'c'
  }