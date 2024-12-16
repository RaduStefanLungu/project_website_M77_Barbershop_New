import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Dev from './pages/Dev'

import './index.css'
import Inventory from './components/Inventory/Inventory'
import Home from './pages/Home'
import RendezVous from './pages/RendezVous'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Header from './components/Header'
import Admin from './pages/private/Admin'
import MainLayout from './layouts/MainLayout'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './context/PrivateRoute.jsx'
import Login from './pages/Login.jsx'

function App() {

  return (
    <div>
      
      <BrowserRouter>

        <AuthProvider>

          <Routes>

            <Route element={<MainLayout/>} >
              <Route path='/' exact element={<Home/>} />
              <Route path='/a-propos' exact element={<About/>} />
              <Route path='/gallerie' exact element={<Gallery/>} />
              <Route path='/rendez-vous' exact element={<RendezVous/>} />
            </Route>

            <Route path='/admin/login' exact element={<Login/>} />

            <Route path='/dev' exact element={<Dev/>} />
            <Route path='/admin/inventory' exact element={<PrivateRoute><Inventory/></PrivateRoute>} />

            <Route path='/admin' exact element={<PrivateRoute><Admin/></PrivateRoute>} />
            

          </Routes>

        </AuthProvider>
        
      </BrowserRouter>

    </div>
  )
}

export default App
