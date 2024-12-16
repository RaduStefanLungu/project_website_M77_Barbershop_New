import React from 'react'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <>
        <Header/>
        <div className="pt-[155px] md:pt-[110px]">
          <Outlet/>
        </div>
        <Footer/>
    </>
  )
}
