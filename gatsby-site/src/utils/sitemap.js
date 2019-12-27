let query = `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }

          allSitePage {
            edges {
              node {
                path
              }
            }
          }
      }`;
const serialize = ({ site, allSitePage }) => {
    let pages = allSitePage.edges.map(edge => {
        let page = {
            url: site.siteMetadata.siteUrl + edge.node.path,
        };
        return page;
    });
    pages.push({
        url: site.siteMetadata.siteUrl + '/resume.pdf',
        priority: 0.9,
    })
    return pages;
};

exports.options = {
  output: `/sitemap.xml`,
  // Exclude specific pages or groups of pages using glob parameters
  // See: https://github.com/isaacs/minimatch
  exclude: [],
  query: query,
  serialize: serialize,
};
