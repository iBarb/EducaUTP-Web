import React from 'react';
import bg1 from "../../assets/bg1.svg";
import bg2 from "../../assets/bg2.svg";
import logo from "../../assets/logo-Color.svg";
import logo2 from "../../assets/logo.svg";
import { Formik } from 'formik';
import { Link } from 'react-router-dom';
import UseInput from '../../Components/InputPassword/UseInput';
import { useAuth } from '../../Auth/AuthContext';

const ForgotPassword = () => {
    const { resetPassword } = useAuth()
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
                    initialValues={{ email: '' }}
                    validate={values => {
                        const errors = {};
                        if (!values.email) {
                            errors.email = 'is-invalid';
                        } 
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        resetPassword(values.email)
                        setSubmitting(false);
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
                            <h1 className='text-center py-2 fs-4 Poetsen mb-2'>Recuperar Contraseña</h1>
                            <div className="form-floating mb-3">
                                <UseInput
                                    type="email"
                                    className={`form-control ${errors.email && touched.email && errors.email}`}
                                    name="email"
                                    id="input_email"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    text="Correo Institucional"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                />
                            </div>
                            <div className='w-100 centrar mt-4'>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Enviar</button>
                            </div>
                            <div className='w-100 text-center mt-4 d-md-none'>
                                <div className='text-muted '>
                                    <Link to="/login" className='mx-1 text-decoration-none d-flex justify-content-center align-items-center'>
                                        {"<"} Volver
                                    </Link>
                                </div>
                            </div>
                        </form>
                    )}
                </Formik>
                <div className='footer text-center w-100'>
                    <div className='text-muted d-none d-md-block'>
                        <Link to="/login" className='mx-1 text-decoration-none d-flex justify-content-center align-items-center'>
                            {"<"} Volver
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
