import React, { useRef } from 'react'

import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';

export default function Login() {
    
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth()

    const redirect = useNavigate();
  
    async function handleLogin(e){
        e.preventDefault()
        
        const result = await login(emailRef.current.value, passwordRef.current.value)
        redirect('/admin/inventory')
    }
  
    return (
    <div className='grid bg-blue-500 px-2 py-3 rounded-tr-xl'>

        <div className='grid justify-center'>
            <h1 className='my-auto text-center pb-5 text-4xl font-bold text-white'> Connection </h1>

            <form onSubmit={handleLogin} className='flex flex-col justify-center gap-1 max-w-[400px] bg-white p-5 border-blue-500 border-[0.15rem] rounded-xl'>

                <input required ref={emailRef} type='email' placeholder='example@text.com' className='min-w-[300px] px-1 py-2 placeholder:px-1 rounded-xl border-blue-500 border-[0.15rem]' />
                <input required ref={passwordRef} type='password' placeholder='mot de pass' className='min-w-[300px] px-1 py-2 placeholder:px-1 rounded-xl border-blue-500 border-[0.15rem]' />

                <button type='submit' className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mx-auto mt-2'>Connection</button>
            </form>
        </div>

    </div>
  )
}
