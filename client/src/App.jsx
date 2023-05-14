import styled from 'styled-components';

function App() {
    return (
        <Wrapper>
            <div className='container'>
                <h1>Default Starter</h1>
                <p>
                    Default Starter provides a basic structure for building modern web applications. This is perfect for developers who want to get started with building web applications quickly,
                    without having to worry about setting up the basic structure every time. Default Starter includes all the necessary components to get you up and running, including a robust file
                    structure, pre-configured tools, and a suite of best practices for building web applications. It's highly customizable and can be easily adapted to meet your specific needs.
                </p>
                <button className='btn'>Get Started</button>
            </div>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    min-width: 100vw;
    min-height: 100vh;
    background-color: #333;
    color: var(--colorWhite);
    display: grid;
    .container {
        width: 90vw;
        margin: 0 auto;
        max-width: var(--width-lg);
    }
    h1 {
        margin: 5rem 0 2rem 0;
    }
    p {
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }
    button {
        font-size: 1.25rem;
    }
`;

export default App;
