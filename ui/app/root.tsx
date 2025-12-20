import type { Route } from './+types/root';
import { isRouteErrorResponse, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />

                <meta name='application-name' content='Default Starter' />
                <meta name='keywords' content='Default Starter, Project Template' />

                <meta name='author' content='Default Starter' />
                <meta name='creator' content='Default Starter' />

                <meta name='theme-color' content='#ffffff' />
                <meta name='color-scheme' content='light' />

                <meta name='robots' content='index, follow' />
                <meta name='googlebot' content='index, follow' />

                <meta name='twitter:card' content='summary' />
                <meta name='twitter:site' content='@defaultstarter' />
                <meta name='twitter:creator' content='@defaultstarter' />

                <meta property='og:type' content='website' />
                <meta property='og:locale' content='en_US' />
                <meta property='og:site_name' content='Default Starter' />

                <link rel='icon' href='/favicon.ico' />
                <link rel='icon' href='/favicon-16x16.png' type='image/png' sizes='16x16' />
                <link rel='icon' href='/favicon-32x32.png' type='image/png' sizes='32x32' />

                <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
                <link rel='manifest' href='/site.webmanifest' />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className='pt-16 p-4 container mx-auto'>
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className='w-full p-4 overflow-x-auto'>
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
