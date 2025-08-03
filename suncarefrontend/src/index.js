import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "react-loading-skeleton/dist/skeleton.css";
import 'react-toastify/dist/ReactToastify.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import { Home,Services,Test,Patient, Doctors, Login, Register, Appointment, Doctor, NotFound } from './pages';
import { ScrollToTop, ProtectedRoute} from './component';
import { AuthProvider } from './context';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <BrowserRouter>
      <ToastContainer />
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/services' element={<Services />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:id' element={<Doctor />} />
          <Route path='/appointment' element={<ProtectedRoute element={<Appointment />} toastMsg={"Login To book appointment!"} />} />
          <Route path='/patient' element={<ProtectedRoute element={<Patient />} toastMsg={"Login To Patient Portal!"} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  </AuthProvider>
);

