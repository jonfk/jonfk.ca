import React from "react";
import { Link } from "gatsby";

const Projects = () => {
  return (
    <section>
      <h2>Projects</h2>
      <ul
        style={{
          listStyleType: `none`,
          marginLeft: 0,
        }}
      >
        <li>
          <Link to={"/wilks"}>Wilks Calculator</Link> A web app to calculate our wilks score
        </li>
      </ul>
    </section>
  );
};

export default Projects;
