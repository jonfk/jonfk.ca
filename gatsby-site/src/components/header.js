import { Link } from "gatsby";
import PropTypes from "prop-types";
import React from "react";

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
      <h1 style={{ margin: 0 }}>
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
