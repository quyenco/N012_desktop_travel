import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Dashboard from './dashboard';
import Login from './login';
import Tour from '../components/tour';
import Content from '../components/content';
import Customer from '../components/customer';
import Employee from '../components/employee';
import Discount from '../components/discount';
import Report from '../components/report';

const App: React.FC = () =>  {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />}>
          {/* Route con của Dashboard */}
          {/* <Route index element={<HomePage />} /> */}
          <Route path="tours" element={<Tour />} />
          <Route path="home" element={<Content/>} />
          <Route path="customers" element={<Customer/>} />
          <Route path="employees" element={<Employee/>} />
          <Route path="discounts" element={<Discount/>} />
          <Route path="reports" element={<Report/>} />
        </Route>
        {/* <Route path="/" element={<Dashboard />} />
        {/* Nếu vào đường dẫn lạ sẽ tự động quay về login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
   </Router>
  );
};

export default App;
