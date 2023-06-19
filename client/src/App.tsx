import { useGetUsersQuery } from './features/api/apiSlice';
import { User } from './features/api/apiSlice';
import { toggleData } from './features/data/dataSlice';
import { useAppDispatch, useAppSelector } from './hooks';
import Wrapper from './styles/styled_components/App';

interface CustomAPIError {
    data: {
        msg: string;
    };
    status: number;
}

function App() {
    const { data, isLoading, isError, error } = useGetUsersQuery(undefined);
    const { showData } = useAppSelector((store) => store.data);
    const dispatch = useAppDispatch();

    if (isLoading) {
        return <Wrapper>Loading...</Wrapper>;
    }

    if (isError) {
        console.log(error);
        return <Wrapper>There was an Error: {(error as CustomAPIError).status}</Wrapper>;
    }

    return (
        <Wrapper>
            <div className='content'>
                <div className='toggle-data'>
                    <button className='btn' onClick={() => dispatch(toggleData())}>
                        Toggle Data
                    </button>
                    {showData ? <div>Data is visible</div> : <div>Data is hidden</div>}
                </div>
                {showData ? (
                    <div className='users visible'>
                        {data &&
                            data.slice(0, 5).map((user: User, index: number) => {
                                return (
                                    <article key={index}>
                                        <p>{user.name}</p>
                                        <p>{user.email}</p>
                                        <p>{user.phone}</p>
                                    </article>
                                );
                            })}
                    </div>
                ) : (
                    <div className='users hidden'>
                        {data &&
                            data.slice(0, 5).map((user: User, index: number) => {
                                return (
                                    <article key={index}>
                                        <p>{user.name}</p>
                                        <p>{user.email}</p>
                                        <p>{user.phone}</p>
                                    </article>
                                );
                            })}
                    </div>
                )}
            </div>
        </Wrapper>
    );
}

export default App;
