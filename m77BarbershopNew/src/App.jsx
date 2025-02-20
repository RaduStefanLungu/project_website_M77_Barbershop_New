import {Route, BrowserRouter, Routes} from 'react-router-dom'

import './index.css'
import Inventory from './components/Inventory/Inventory'
import Home from './pages/Home'
import RendezVous from './pages/RendezVous'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Admin from './pages/private/admin/Admin.jsx'
import MainLayout from './layouts/MainLayout'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './context/PrivateRoute.jsx'
import Login from './pages/Login.jsx'
import UserDashboard from './pages/private/user/UserDashboard.jsx'
import Profile from './pages/private/user/Profile.jsx'
import Appointments from './pages/private/user/Appointments.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import RapportRDVs from './pages/private/admin/RapportRDVs.jsx'
import TaC from './pages/TaC.jsx'


function App() {

  return (
    <div className='w-screen overflow-hidden'>
      
      <BrowserRouter>

        <AuthProvider>

          <Routes>

            <Route element={<MainLayout/>} >
              <Route path='/' exact element={<Home/>} />
              <Route path='/a-propos' exact element={<About/>} />
              {/* <Route path='/gallerie' exact element={<Gallery/>} /> */}
              <Route path='/rendez-vous' exact element={<RendezVous/>} />
              <Route path='/termes-et-conditions' exact element={<TaC/>} />
            </Route>


            <Route element={<AdminLayout/>}>
              <Route path='/admin/login' exact element={<Login/>} />

              <Route path='/user/dashboard' exact element={<PrivateRoute><UserDashboard/></PrivateRoute>} />
              <Route path='/user/profile' exact element={<PrivateRoute><Profile/></PrivateRoute>} />
              <Route path='/user/rdvs' exact element={<PrivateRoute><Appointments/></PrivateRoute>} />
              <Route path='/users/rdvs/rapport' exact element={<PrivateRoute><RapportRDVs/></PrivateRoute>} />
              
              <Route path='/admin/management' exact element={<PrivateRoute><Admin/></PrivateRoute>} />
              <Route path='/admin/inventory' exact element={<PrivateRoute><Inventory/></PrivateRoute>} />

            </Route>            

          </Routes>

        </AuthProvider>
        
      </BrowserRouter>

    </div>
  )
}

export default App
