import { useEffect, useState } from 'react';

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

    return <h1>{data}</h1>;
}

export default App;
