import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Dev from './pages/Dev'

import './index.css'
import Inventory from './components/Inventory/Inventory'

function App() {

  return (
    <div>

      <BrowserRouter>
      
        <Routes>

          <Route path='/dev' exact element={<Dev/>} />
          <Route path='/inventory' exact element={<Inventory/>} />

        </Routes>
      
      </BrowserRouter>

    </div>
  )
}

export default App
