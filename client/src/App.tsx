import { useEffect } from 'react';
import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { toast } from 'sonner';

type HealthcheckAPIResponse = {
    success: boolean;
    data: null;
};

function App() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success('Your account has been created!');
    };

    useEffect(() => {
        void fetch('/api/v1/healthcheck')
            .then((res) => res.json())
            .then((data: HealthcheckAPIResponse) => {
                if (data.success) {
                    toast.success('Connencted to the server!');
                }
            });
    }, []);

    return (
        <main className='w-screen h-screen grid place-items-center'>
            <nav className='fixed top-0 h-16 w-full grid place-items-center'>
                <div className='flex items-center justify-between w-screen-90'>
                    <h1 className='text-2xl font-semibold'>Default Starter</h1>
                    <div className='w-48 grid justify-items-end'>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
            <form className='grid gap-4 w-screen-90 max-w-sm p-6 bg-background shadow-md border rounded-md' noValidate autoComplete='off' onSubmit={handleSubmit}>
                <h1 className='text-lg font-semibold text-center'>Create an account</h1>
                <fieldset className='space-y-1'>
                    <Label htmlFor='username'>Username</Label>
                    <Input id='username' name='username' type='text'></Input>
                </fieldset>
                <fieldset className='space-y-1'>
                    <Label htmlFor='email'>Email</Label>
                    <Input id='email' name='email' type='email'></Input>
                </fieldset>
                <fieldset className='space-y-1'>
                    <Label htmlFor='password'>Password</Label>
                    <Input id='password' name='password' type='password'></Input>
                </fieldset>
                <Button type='submit' size={'sm'} className='mt-2'>
                    Register
                </Button>
            </form>
        </main>
    );
}

export default App;
