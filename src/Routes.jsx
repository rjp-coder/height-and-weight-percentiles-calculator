import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { NoPage } from "./NoPage";
import { Blog } from "./Blog";

export function AllRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Layout />}> */}
        <Route path="/" index element={<App />} />
        <Route path="blog" element={<Blog />} />
        <Route path="*" element={<NoPage />} />
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
