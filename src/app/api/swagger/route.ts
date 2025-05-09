import { NextResponse } from 'next/server';

export async function GET() {
    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Superfluid Accounting API swagger documentation" />
            <title>Superfluid Accounting API</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.4/swagger-ui.css" />
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@5.17.4/swagger-ui-bundle.js" crossorigin></script>
            <script>
                window.onload = () => {
                    window.ui = SwaggerUIBundle({
                        url: '/api-docs.yaml',
                        dom_id: '#swagger-ui',
                    });
                };
            </script>
        </body>
    </html>`;

    return new NextResponse(htmlBody, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
        },
    });
}