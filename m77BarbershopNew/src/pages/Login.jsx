import React, { useRef, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Login() {
    
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth()

    const [errorMessage,setErrorMessage] = useState('')

    const redirect = useNavigate();
  
    async function handleLogin(e){
        e.preventDefault()

        try {
            const result = await login(emailRef.current.value, passwordRef.current.value)
            console.log(result);
            
            redirect('/user/dashboard')
            
        } catch (error) {
            console.log(error.message);
            
            setErrorMessage(error.message)
        }
        
        
    }
  
    return (
    <div>
        <Header/>
        <div className='pt-[155px] grid bg-[var(--brand-black)] px-2 py-3 rounded-tr-xl font-custom_1 min-h-screen'>

            <div className='grid justify-center py-10 mb-auto'>
                
                <form onSubmit={handleLogin} className='flex flex-col justify-center gap-3 max-w-[400px] p-5 border-[0.15rem] border-[var(--brand-white)]'>

                    <h1 className='my-auto text-center text-design-h2 text-[var(--brand-white)] py-0'> Connection </h1>
                    <h4 className='my-auto text-center text-design-h4 text-[var(--brand-white)]'> Utilisateurs </h4>

                    <input required ref={emailRef} type='email' placeholder='example@text.com' className='min-w-[300px] px-1 py-2 placeholder:px-1 border-[0.15rem] border-[var(--brand-white)]' />
                    <input required ref={passwordRef} type='password' placeholder='mot de pass' className='min-w-[300px] px-1 py-2 placeholder:px-1 border-[0.15rem] border-[var(--brand-white)]' />
                    
                    <p className='text-red-500'>
                        {errorMessage}
                    </p>

                    <button type='submit' className='button-2 mx-auto mt-2 py-2 px-10'>Connection</button>
                </form>
            </div>

        </div>
        <Footer/>
    </div>
  )
}
