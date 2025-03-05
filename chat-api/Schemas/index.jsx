import * as Yup from 'yup';
export const changePasswordSchema = Yup.object({
    password: Yup.string().min(9, 'Password must be 9 characters')
    .matches(/[0-9]/, 'Password requires atleast one  a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol').required('please enter the password').oneOf([Yup.ref('password'), null], "password a password not match"),
confirmPassword: Yup.string().required('please enter the  confirm password').oneOf([Yup.ref('password'), null], "password and cofirm password not match")
})

export const loginSchema = Yup.object({
    email: Yup.string().email().required('please enter the email'),
    password: Yup.string().min(9, 'Password must be 10 characters')
        .matches(/[0-9]/, 'Password requires atleast one  a number')
        .matches(/[a-z]/, 'Password requires a lowercase letter')
        .matches(/[A-Z]/, 'Password requires an uppercase letter')
        .matches(/[^\w]/, 'Password requires a symbol').required('please enter the password').oneOf([Yup.ref('password'), null], "password and cofirm password not match")
})

export const registerationSchema = Yup.object({
    name: Yup.string().min(4).max(25).required('please enter your name'),
    email: Yup.string().email().required('please enter the email'),
    username: Yup.string().max(20).required('please enter the user name'),
    password: Yup.string().min(9, 'Password must be 10 characters long')
        .matches(/[0-9]/, 'Password requires atleast one  a number')
        .matches(/[a-z]/, 'Password requires a lowercase letter')
        .matches(/[A-Z]/, 'Password requires an uppercase letter')
        .matches(/[^\w]/, 'Password requires a symbol').required('please enter the password').oneOf([Yup.ref('password'), null], "password a password not match"),
    confirm_password: Yup.string().required('please enter the  confirm password').oneOf([Yup.ref('password'), null], "password and cofirm password not match")
})