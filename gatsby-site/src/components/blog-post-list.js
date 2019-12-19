import React from "react";
import { Link, useStaticQuery } from "gatsby";

import BlogPostDate from "../components/blog-date";

const BlogPostList = () => {
  const data = useStaticQuery(graphql`
    query BlogPostListQuery {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { fields: { pageType: { eq: "blog" } } }
      ) {
        edges {
          node {
            fields {
              slug
              pagePath
            }
            frontmatter {
              title
              date: date(formatString: "YYYY-MM-DD")
              prettyDate: date(formatString: "DD MMM YYYY")
            }
          }
        }
      }
    }
  `);
  let posts = data.allMarkdownRemark.edges;
  return (
    <section>
      <h2>Posts</h2>
      <ul
        style={{
          listStyleType: `none`,
          marginLeft: 0,
        }}
      >
        {posts.map(({ node }) => (
          <li>
            <BlogPostDate postDate={node.frontmatter.date} postPrettyDate={node.frontmatter.prettyDate} />
            {` » `}
            <Link to={node.fields.pagePath}>{node.frontmatter.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BlogPostList;
