function App() {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '400px 1fr',
                columnGap: '2rem',
                maxWidth: '1024px',
                margin: '1rem auto',
                width: '90vw',
            }}
        >
            <form className='form'>
                <div className='form-row'>
                    <label htmlFor='name' className='form-label'>
                        name
                    </label>
                    <input type='name' name='name' id='name' className='form-input form-input-success' />
                    <p className='form-alert form-alert-success'>Username is available</p>
                </div>
                <div className='form-row'>
                    <label htmlFor='email' className='form-label'>
                        email
                    </label>
                    <input type='email' name='email' id='email' className='form-input form-input-error' />
                    <p className='form-alert form-alert-error'>Account with this email already exists</p>
                </div>
                <div className='form-row'>
                    <div className='form-label-flex'>
                        <label htmlFor='password'>password</label>
                        <a href='#' className='form-forgot-password'>
                            Forgot password?
                        </a>
                    </div>
                    <input type='password' name='password' id='password' className='form-input' />
                </div>
                <div className='form-row'>
                    <label htmlFor='message' className='form-label'>
                        message
                    </label>
                    <textarea name='message' id='message' className='form-textarea'></textarea>
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
                <p className='form-row-title'>When do you want to be notified?</p>
                <div className='form-row'>
                    <div className='form-input-flex'>
                        <input type='checkbox' name='comment' id='comment' />
                        <label htmlFor='comment'>When someone commented on my post</label>
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-input-flex'>
                        <input type='checkbox' name='friend-request' id='friend-request' />
                        <label htmlFor='friend-request'>When I received a friend request</label>
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-input-flex'>
                        <input type='checkbox' name='tagged' id='tagged' />
                        <label htmlFor='tagged'>When I get tagged on a post</label>
                    </div>
                </div>
                <p className='form-row-title'>Which operating system you prefer?</p>
                <div className='form-row'>
                    <div className='form-input-flex'>
                        <input type='radio' name='os' id='os1' value='windows' />
                        <label htmlFor='os1'>Windows</label>
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-input-flex'>
                        <input type='radio' name='os' id='os2' value='mac' />
                        <label htmlFor='os2'>MacOS</label>
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-input-flex'>
                        <input type='radio' name='os' id='os3' value='linux' />
                        <label htmlFor='os3'>Linux</label>
                    </div>
                </div>
                <button type='submit' className='btn form-btn'>
                    Submit
                </button>
            </form>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', rowGap: '2rem' }}>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                    </tr>
                    <tr>
                        <td>Maria Anders</td>
                        <td>mariaangers@gmail.com</td>
                        <td>ilikeducks17</td>
                    </tr>
                    <tr>
                        <td>Christina Berglund</td>
                        <td>christinaberglund@gmail.com</td>
                        <td>asjddskasi2312</td>
                    </tr>
                    <tr>
                        <td>Francisco Chang</td>
                        <td>franciscochang@gmail.com</td>
                        <td>francoman928</td>
                    </tr>
                    <tr>
                        <td>Roland Mendel</td>
                        <td>rolandmendel@gmail.com</td>
                        <td>verysercretcode88</td>
                    </tr>
                    <tr>
                        <td>Helen Bennett</td>
                        <td>helenbennett@gmail.com</td>
                        <td>iamherewithcode</td>
                    </tr>
                    <tr>
                        <td>Philip Cramer</td>
                        <td>philipcramer@gmail.com</td>
                        <td>kadajkdsljasd8</td>
                    </tr>
                    <tr>
                        <td>Yoshi Tannamuri</td>
                        <td>yoshitannamuri@gmail.com</td>
                        <td>mountainandstar9</td>
                    </tr>
                    <tr>
                        <td>Giovanni Rovelli</td>
                        <td>giovannirovelli@gmail.com</td>
                        <td>waterfall32</td>
                    </tr>
                    <tr>
                        <td>Simon Crowther</td>
                        <td>simoncrowther@gmail.com</td>
                        <td>jdksqoqqqoskl101</td>
                    </tr>
                    <tr>
                        <td>Marie Bertrand</td>
                        <td>mariebertrand@gmail.com</td>
                        <td>lakesandrivers66</td>
                    </tr>
                </table>
                <div>
                    <div style={{ marginBottom: '1rem' }}>
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
            </div>
        </div>
    );
}

export default App;
