import type { VercelRequest, VercelResponse, VercelApiHandler } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    globalThis.SKIP_SSR_SERVER = true;
    const render = await import('../bootstrap/ssr/ssr.js').then(module => module.default);

    const routes: Record<string, VercelApiHandler> = {
        '/health': async (_, response) => {
            response.end(JSON.stringify({ status: 'OK', timestamp: Date.now() }));
        },
        '/shutdown': () => process.exit(),
        '/render': async (request, response) => {
            const page = request.body;
            response.end(JSON.stringify(await render(page)));
        },
        '/404': async (_, response) => {
            response.end(JSON.stringify({ status: 'NOT_FOUND', timestamp: Date.now() }))
        },
    }
    response.writeHead(200, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' });
    const url = `${request.url}`.replace('/api/ssr', '')
    const dispatcher = routes[url] || routes['/404'];
    return dispatcher(request, response);
}
