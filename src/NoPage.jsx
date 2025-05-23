import { Link } from "react-router-dom";

export const NoPage = () => {
  //do stuff

  return (
    <>
      <h1>Page Not Found</h1>
      <h2>You can try these pages instead</h2>
      <Link to="/">Home</Link>
      <br></br>
      <Link to="/data/allData.json">AllData</Link>
      <br></br>
      <Link to="/blog">Blog</Link>
    </>
  );
};
