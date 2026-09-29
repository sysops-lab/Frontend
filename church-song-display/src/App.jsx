import { Routes, Route } from "react-router-dom";

import SongEditor from "./pages/SongEditor";

import Dashboard from "./pages/Dashboard";

import Songs from "./pages/Songs";

import Service from "./pages/Service";

import Display from "./pages/Display";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/songs" element={<Songs />} />

      <Route path="/songs/new" element={<SongEditor />} />

      <Route path="/songs/edit/:id" element={<SongEditor />} />

      <Route path="/service" element={<Service />} />

      <Route path="/service" element={<Service />} />

      <Route path="/display" element={<Display />} />
    </Routes>
  );
}
