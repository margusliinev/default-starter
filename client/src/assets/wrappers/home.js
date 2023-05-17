import styled from 'styled-components';

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

export default Wrapper;
