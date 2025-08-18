import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from '../screens/user/HomeScreen';
import ReportScreen from '../screens/user/ReportScreen';
import StatusScreen from '../screens/user/StatusScreen';
import DashboardScreen from '../screens/admin/DashboardScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

const AppNavigator: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomeScreen />} />
    <Route path="/report" element={<ReportScreen />} />
    <Route path="/status" element={<StatusScreen />} />
    <Route path="/admin/dashboard" element={<DashboardScreen />} />
    <Route path="/admin/analytics" element={<AnalyticsScreen />} />
  </Routes>
);

export default AppNavigator;