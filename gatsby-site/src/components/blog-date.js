import React from "react";
import PropTypes from "prop-types";

const BlogPostDate = ({ postDate, postPrettyDate }) => (
  <time
    style={{
      color: `#aaa`,
      fontFamily: [`Ubuntu Mono`, `monospace`],
    }}
    dateTime={postDate}
  >
    {postPrettyDate}
  </time>
);

BlogPostDate.protoTypes = {
  postDate: PropTypes.string.isRequired,
  postPrettyDate: PropTypes.string.isRequired,
};

export default BlogPostDate;
