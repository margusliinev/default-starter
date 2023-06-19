import styled from 'styled-components';

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    min-height: 100vh;
    min-width: 100vw;
    .content {
        height: 600px;
    }
    .toggle-data {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin: 1rem auto;
    }
    .users {
        margin: 2rem auto;
        display: grid;
        grid-template-columns: 1fr;
        row-gap: 2rem;
        article {
            p:nth-of-type(1) {
                font-size: 18px;
                color: var(--colorRed2);
            }
            p:nth-of-type(2) {
                color: var(--colorYellow1);
            }
            p:nth-of-type(3) {
                color: var(--colorGreen1);
            }
        }
    }
    .visible {
        visibility: visible;
    }
    .hidden {
        visibility: hidden;
    }
`;

export default Wrapper;
