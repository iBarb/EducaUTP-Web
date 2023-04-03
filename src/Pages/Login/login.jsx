import React from 'react';
import './login.css'
import bg1 from "../../assets/bg1.svg";
import bg2 from "../../assets/bg2.svg";
import logo from "../../assets/logo-Color.svg";
import logo2 from "../../assets/logo.svg";
import { useAuth } from '../../Auth/AuthContext';
import { Formik } from 'formik';

const Login = () => {
    const { login } = useAuth()


    return (
        <div className='centrar w-100 h-100'>
            <div className='bg'>
                <img src={bg1} alt="" />
                <img src={bg2} alt="" />
            </div>
            <div className='formulario'>
                <div className="w-100">
                    <img src={logo} alt="Logo EducaUTP" className='d-none d-md-block' />
                    <img src={logo2} alt="Logo EducaUTP" className='d-md-none' />
                </div>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    validate={values => {
                        const errors = {};
                        if (!values.email) {
                            errors.email = 'is-invalid';
                        } else if (
                            !/^[A-Za-z0-9._%+-]+@utp\.edu\.pe$/i.test(values.email)
                        ) {
                            errors.email = 'is-invalid';
                        }
                        if (!values.password) {
                            errors.password = 'is-invalid';
                        }

                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        login()
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting
                    }) => (
                        <form onSubmit={handleSubmit} className='w-100'>
                            <h1 className='text-center py-2 fs-4 Poetsen'>Inicio Sesión</h1>
                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    className={`form-control ${errors.email && touched.email && errors.email}`}
                                    name="email"
                                    id="input_email"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                />
                                <label htmlFor="input_email">Correo</label>
                            </div>
                            <div className="form-floating">
                                <input
                                    type="password"
                                    className={`form-control ${errors.password && touched.password && errors.password}`}
                                    name="password"
                                    id="input_password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                />
                                <label htmlFor="input_password">Contraseña</label>
                            </div>
                            <div className='w-100 centrar mt-4'>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Iniciar Sesion</button>
                            </div>
                            <div className='w-100 text-center mt-4 d-md-none'>
                                <div className='text-muted'>¿Olvidaste tu contraseña?</div>
                            </div>
                        </form>
                    )}
                </Formik>
                <div className='footer text-center w-100'>
                    <div className='text-muted d-none d-md-block'>¿Olvidaste tu contraseña?</div>
                </div>
            </div>
        </div>
    );
}

export default Login;
