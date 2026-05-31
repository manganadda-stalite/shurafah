import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

// NOTE: No Tailwind / no CSS framework. The Shurafah UI styling lives inside the
// existing static HTML (served via Blade). Vite is used only to fingerprint and
// serve the shared vanilla JS/CSS assets. See architecture/06-frontend-asset-strategy.md.
export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
