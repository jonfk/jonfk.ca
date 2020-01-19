import React from "react";
import { graphql } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import BlogPostDate from "../components/blog-date";

const BlogPostTemplate = ({ data }) => {
  let post = data.markdownRemark;
  let title = post.frontmatter.title;

  return (
    <Layout>
      <SEO title={title} description={post.excerpt} />
      <article>
        <header
          style={{
            marginBottom: `1em`,
          }}
        >
          <h2
            style={{
              marginBottom: `0.5em`,
            }}
          >
            {title}
          </h2>
          <BlogPostDate postDate={post.frontmatter.date} postPrettyDate={post.frontmatter.prettyDate} />
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date: date(formatString: "YYYY-MM-DD")
        prettyDate: date(formatString: "D MMM YYYY")
      }
    }
  }
`;
