import { createInertiaApp } from '@inertiajs/react'
import createServer from '@inertiajs/react/server'
import ReactDOMServer from 'react-dom/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { route } from 'ziggy-js';

const global = globalThis || window;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

export default function render(page: any) {
    return createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
        setup: ({ App, props }) => {
            const ziggyProps: any = page.props.ziggy
            const ssrZiggy = ((name: any, params: any, absolute: any) =>
                route(name, params, absolute, {
                    ...ziggyProps,
                    location: new URL(ziggyProps.location),
                }));

            global.route = ssrZiggy as typeof route;

            return <App {...props} />;
        },
    });
}

if (!(global as any).SKIP_SSR_SERVER) {
    createServer(page =>
        render(page),
    )
}
