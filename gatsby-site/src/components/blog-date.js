import React from "react";
import PropTypes from "prop-types";

const BlogPostDate = ({ postDate, postPrettyDate }) => (
  <time
    style={{
      color: `#aaa`,
      fontFamily: `monospace`,
    }}
    datetime={postDate}
  >
    {postPrettyDate}
  </time>
);

export default BlogPostDate;
