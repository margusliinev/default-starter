import { useEffect, useState } from 'react';
import { ThemeToggle } from './components/theme-toggle';

function App() {
    const [data, setData] = useState('');

    useEffect(() => {
        void fetch('/api/v1/healthcheck')
            .then((res) => {
                if (res.status === 200) {
                    return 'Healthcheck successful!';
                } else {
                    return 'Healthcheck failed!';
                }
            })
            .then((data) => setData(data));
    }, []);

    return (
        <main className='w-screen h-screen grid place-items-center'>
            <span className='absolute top-8 right-8'>
                <ThemeToggle />
            </span>
            <h1 className='text-xl font-medium'>{data}</h1>
        </main>
    );
}

export default App;
