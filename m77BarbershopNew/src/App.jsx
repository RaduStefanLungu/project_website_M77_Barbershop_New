
import {Route, BrowserRouter, Routes} from 'react-router-dom'

function App() {

  return (
    <div>
      M77 Barbershop New

      <BrowserRouter>
      
        <Routes>

          <Route path='/test' exact element={<div>Hello</div>} ></Route>

        </Routes>
      
      </BrowserRouter>

    </div>
  )
}

export default App
