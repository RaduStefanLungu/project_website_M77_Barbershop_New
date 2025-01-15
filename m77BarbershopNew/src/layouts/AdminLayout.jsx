import React from 'react'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

import LOGO from '../assets/logo/logo.jpg'

export default function AdminLayout() {
  return (
    <>
        {/* <Header/> */}
        <div className='bg-[var(--brand-black)] grid justify-center'>
            <a href="/user/dashboard"><img src={LOGO} className='w-[150px] '></img></a>
        </div>
        <div className="">
          <Outlet/>
        </div>
        <Footer/>
    </>
  )
}
