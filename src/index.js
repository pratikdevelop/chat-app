import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import  {BrowserRouter}  from 'react-router-dom';
import {UserProvider} from './consumer/UserContext'
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
    <React.StrictMode>
        <UserProvider>
        <BrowserRouter>
            <App />          
        </BrowserRouter>
        </UserProvider>
    </React.StrictMode>,
);
reportWebVitals();
