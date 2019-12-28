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
    if (edge.node.path.startsWith("/blog/")) {
      page.priority = 0.7;
    } else {
      page.priority = 0.9;
    }
    return page;
  });
  pages.push({
    url: site.siteMetadata.siteUrl + "/resume.pdf",
    priority: 1.0,
  });
  pages.push({
    url: site.siteMetadata.siteUrl + "/archived/2015-07-03/training",
    priority: 0.2,
  });
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
