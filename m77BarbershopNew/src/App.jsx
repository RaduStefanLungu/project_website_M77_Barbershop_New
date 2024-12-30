import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Dev from './pages/Dev'

import './index.css'
import Inventory from './components/Inventory/Inventory'
import Home from './pages/Home'
import RendezVous from './pages/RendezVous'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Header from './components/Header'
import Admin from './pages/private/admin/Admin.jsx'
import MainLayout from './layouts/MainLayout'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './context/PrivateRoute.jsx'
import Login from './pages/Login.jsx'
import UserDashboard from './pages/private/user/UserDashboard.jsx'
import Profile from './pages/private/user/Profile.jsx'
import Appointments from './pages/private/user/Appointments.jsx'
import Statistics from './components/Inventory/components/Statistics.jsx'
import Rapport from './pages/private/admin/Rapport.jsx'

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


            <Route path='/dev' exact element={<Dev/>} />

            <Route path='/admin/login' exact element={<Login/>} />

            <Route path='/user/dashboard' exact element={<PrivateRoute><UserDashboard/></PrivateRoute>} />
            <Route path='/user/profile' exact element={<PrivateRoute><Profile/></PrivateRoute>} />
            <Route path='/user/rdvs' exact element={<PrivateRoute><Appointments/></PrivateRoute>} />

            <Route path='/admin/inventory' exact element={<PrivateRoute><Inventory/></PrivateRoute>} />
            <Route path='/admin/rapport' exact element={<PrivateRoute><Rapport/></PrivateRoute>} />

            <Route path='/admin' exact element={<PrivateRoute><Admin/></PrivateRoute>} />
            

          </Routes>

        </AuthProvider>
        
      </BrowserRouter>

    </div>
  )
}

export default App
