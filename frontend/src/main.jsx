import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {UserContextProvider} from './contexts/UserContext.jsx'
import {FileContextProvider} from './contexts/FileContext.jsx'
import { SearchProvider } from './contexts/SearchContext.jsx'
import './index.css'


import App from './App.jsx'

import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
    <FileContextProvider>
      <SearchProvider>
    <App />
    </SearchProvider>
    </FileContextProvider>
    </UserContextProvider>

  </StrictMode>,
)
