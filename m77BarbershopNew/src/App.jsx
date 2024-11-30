import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Dev from './pages/Dev'

import './index.css'
import Inventory from './components/Inventory/Inventory'
import Home from './pages/Home'
import RendezVous from './pages/RendezVous'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Header from './components/Header'

function App() {

  return (
    <div>

      <Header/>
      
      
      <BrowserRouter>

        <Routes>

          <Route path='/' exact element={<Home/>} />
          <Route path='/a-propos' exact element={<About/>} />
          <Route path='/gallerie' exact element={<Gallery/>} />
          <Route path='/rendez-vous' exact element={<RendezVous/>} />
          
          <Route path='/dev' exact element={<Dev/>} />
          <Route path='/inventory' exact element={<Inventory/>} />

        </Routes>
      
      </BrowserRouter>

    </div>
  )
}

export default App
