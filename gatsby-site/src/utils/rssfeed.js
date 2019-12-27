let blogpostsQuery = `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
`;

const blogpostsSerialize = ({ query: { site, allMarkdownRemark } }) => {
  return allMarkdownRemark.edges.map(edge => {
    return Object.assign({}, edge.node.frontmatter, {
      description: edge.node.excerpt,
      date: edge.node.frontmatter.date,
      url: site.siteMetadata.siteUrl + edge.node.fields.slug,
      guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
      custom_elements: [{ "content:encoded": edge.node.html }],
    });
  });
};

exports.options = {
  query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
    `,
  feeds: [{ query: blogpostsQuery, serialize: blogpostsSerialize, output: "/rss.xml" }],
};
