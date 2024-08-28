import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Dev from './pages/Dev'

import './index.css'

function App() {

  return (
    <div>

      <BrowserRouter>
      
        <Routes>

          <Route path='/dev' exact element={<Dev></Dev>} />

        </Routes>
      
      </BrowserRouter>

    </div>
  )
}

export default App
