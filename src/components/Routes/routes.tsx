import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../home/home';
import About from '../Documentation/about';
import Dashboard from '../dashboard/dashboard';
import SubVaultsContainer from '../dashboard/subvaults';
import VaultDetails from '../dashboard/vaultdetails';
import TweetSharePage from './TweetSharePage';
import { useState } from 'react';

export default function MyRoutes() {
const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <Router>
        <Routes>
            <Route
                path="/"
                element={ <Home /> }
            /> 
            <Route
                path="/documentation"
                element={ <About /> }
            />  
            <Route
                path="/dashboard"
                element={ <Dashboard /> }
            />     
            <Route
                path="/myvaults"
                element={ <SubVaultsContainer isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} /> }
            /> 
            <Route
                path="/vault"
                element={ <VaultDetails /> }
            /> 
            <Route
                path="/tweet-share"
                element={ <TweetSharePage /> }
            /> 
        </Routes>
    </Router>
  )
}
