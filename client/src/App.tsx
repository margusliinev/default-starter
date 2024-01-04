import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

function App() {
    return (
        <main className='w-screen h-screen grid place-items-center'>
            <span className='absolute top-8 right-8'>
                <ThemeToggle />
            </span>
            <form className='grid gap-4 w-screen-90 max-w-sm p-6 bg-background shadow-md border rounded-md ' autoComplete='off'>
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
