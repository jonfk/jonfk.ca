import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

import Layout from "../components/layout";
import SEO from "../components/seo";

const AboutPage = () => {
  return (
    <Layout>
      <SEO title="About" />
      <h2>About Me</h2>
      <p>Hi there, my name is Jonathan Fok kan and I am a Software Developer from Montréal.</p>
      <p>Here are some links of me on various services</p>
      <ul
        style={{
          listStyleType: `none`,
        }}
      >
        <li>
          <a href="https://github.com/jonfk">
            <FontAwesomeIcon icon={faGithub} /> Github
          </a>
        </li>
        <li>
          <a href="/resume.pdf">
            <FontAwesomeIcon icon={faFilePdf} /> Resume
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/jonfk">
            <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
          </a>
        </li>
      </ul>
    </Layout>
  );
};

export default AboutPage;
