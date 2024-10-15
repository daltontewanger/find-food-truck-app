import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import FindFoodTruck from './pages/FindFoodTruck';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/find-food-truck" element={<FindFoodTruck />} />
        </Routes>
    );
};

export default App;
