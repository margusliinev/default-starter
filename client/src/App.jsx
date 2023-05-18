function App() {
    return (
        <>
            <div style={{ display: 'grid', rowGap: '1rem', margin: '2rem auto', gridTemplateColumns: '1fr 1fr', maxWidth: '1024px', width: '90vw', alignItems: 'start', justifyItems: 'center' }}>
                <form className='form'>
                    <h4 className='form-title'>Form 1</h4>
                    <div className='form-row'>
                        <label htmlFor='name' className='form-label'>
                            name
                        </label>
                        <input type='name' name='name' className='form-input' />
                    </div>
                    <div className='form-row'>
                        <label htmlFor='email' className='form-label'>
                            email
                        </label>
                        <input type='email' name='email' className='form-input' />
                    </div>
                    <div className='form-row'>
                        <label htmlFor='password' className='form-label'>
                            password
                        </label>
                        <input type='password' name='password' className='form-input' />
                    </div>
                    <div className='form-row'>
                        <label htmlFor='message' className='form-label'>
                            message
                        </label>
                        <textarea name='message' id='message' className='form-textarea'></textarea>
                    </div>
                    <button type='submit' className='btn form-btn'>
                        Submit
                    </button>
                </form>
                <form className='form'>
                    <h4 className='form-title'>Form 2</h4>
                    <p className='form-subtitle'>When do you want to be notified?</p>
                    <div className='form-row-flex'>
                        <input type='checkbox' name='comment' id='comment' className='form-input-flex' value='comment' />
                        <label htmlFor='comment' className='form-label-flex'>
                            When someone commented on my post
                        </label>
                    </div>
                    <div className='form-row-flex'>
                        <input type='checkbox' name='friend-request' id='friend-request' className='form-input-flex' value='friend-request' />
                        <label htmlFor='friend-request' className='form-label-flex'>
                            When I received a friend request
                        </label>
                    </div>
                    <div className='form-row-flex'>
                        <input type='checkbox' name='tagged' id='tagged' className='form-input-flex' value='tagged' />
                        <label htmlFor='tagged' className='form-label-flex'>
                            When I get tagged on a post
                        </label>
                    </div>
                    <p className='form-subtitle'>Which operating system you prefer?</p>
                    <div className='form-row'>
                        <div className='form-row-flex'>
                            <input type='radio' name='os' id='os' className='form-input-flex' value='windows' />
                            <label htmlFor='os' className='form-label-flex'>
                                Windows
                            </label>
                        </div>
                        <div className='form-row-flex'>
                            <input type='radio' name='os' id='os' className='form-input-flex' value='mac' />
                            <label htmlFor='os' className='form-label-flex'>
                                MacOS
                            </label>
                        </div>
                        <div className='form-row-flex'>
                            <input type='radio' name='os' id='os' className='form-input-flex' value='linux' />
                            <label htmlFor='os' className='form-label-flex'>
                                Linux
                            </label>
                        </div>
                    </div>
                    <div className='form-row'>
                        <label htmlFor='language' className='form-label'>
                            language
                        </label>
                        <select name='language' id='language' className='form-select'>
                            <option value='javascript' className='form-option'>
                                javascript
                            </option>
                            <option value='python' className='form-option'>
                                python
                            </option>
                            <option value='golang' className='form-option'>
                                golang
                            </option>
                            <option value='rust' className='form-option'>
                                rust
                            </option>
                            <option value='java' className='form-option'>
                                java
                            </option>
                        </select>
                    </div>
                    <button type='submit' className='btn form-btn'>
                        Submit
                    </button>
                </form>
            </div>
            <div style={{ display: 'grid', rowGap: '1rem', margin: '2rem auto', gridTemplateColumns: '1fr 1fr', maxWidth: '1024px', width: '90vw', alignItems: 'start', justifyItems: 'center' }}>
                <div className='headings'>
                    <h1>Heading 1</h1>
                    <h2>Heading 2</h2>
                    <h3>Heading 3</h3>
                    <h4>Heading 4</h4>
                    <h5>Heading 5</h5>
                    <h6>Heading 6</h6>
                </div>
                <div class='loading'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </>
    );
}

export default App;
