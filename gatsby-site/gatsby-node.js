/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const blog = require(`./src/blog.js`);
const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPost = path.resolve(`./src/templates/blog-post.js`);
  const result = await graphql(
    `
      {
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
                date
              }
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    createPage({
      path: post.node.fields.pagePath,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        date: post.node.frontmatter.date,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark` && getNode(node.parent).sourceInstanceName === `blog`) {
    let fileNode = getNode(node.parent);

    let { slug, date } = blog.createPageSlug(fileNode.relativePath);
    createNodeField({
      node,
      name: `pageType`,
      value: `blog`,
    });
    createNodeField({
      node,
      name: `pagePath`,
      value: `/blog${slug}`,
    });
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};
