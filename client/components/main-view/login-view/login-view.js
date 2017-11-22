import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

const LoginView = ({userName, password, handleLogin, handleChange}) => (

    <form className="main__loginForm" name="loginForm" onSubmit={handleLogin}>
        <FormGroup>
            <InputGroup>
                <FormControl type="text" name="userName" value={userName} onChange={handleChange}/>
                <FormControl type="text" name="password" value={password} onChange={handleChange}/>
                <Button bsStyle="primary" type="submit">Login</Button>
            </InputGroup>
        </FormGroup>
    </form>
);

LoginView.propTypes = {
    userName: PropTypes.string,
    password: PropTypes.string,
    handleLogin: PropTypes.func,
    handleChange: PropTypes.func
};

export default LoginView;