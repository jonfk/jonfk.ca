import { Link } from "gatsby";
import PropTypes from "prop-types";
import React from "react";

import "./header.css";

const Header = ({ siteTitle }) => (
  <header
    style={{
      background: `white`,
      marginBottom: `1.45rem`,
    }}
  >
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.45rem 1.0875rem`,
      }}
    >
      <h1 style={{ margin: 0, marginBottom: `0.5em` }}>
        <Link
          to="/"
          style={{
            color: `#a00`,
            textDecoration: `none`,
            fontFamily: `'Alegreya SC', serif`,
            fontWeight: 700,
            fontSize: `1.5em`,
          }}
        >
          {siteTitle.toUpperCase()}
        </Link>
      </h1>
      <nav
        style={{
          fontFamily: `'PT Sans', Helvetica, arial, sans-serif`,
        }}
      >
        <ul>
          <li>
            <Link style={{ marginLeft: 0 }} to="/home">
              home
            </Link>
          </li>
          <li>
            <Link to="/favorites">favorites</Link>
          </li>
          <li>
            <Link to="/about">about</Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
