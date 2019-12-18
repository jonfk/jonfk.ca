module.exports = {
  siteMetadata: {
    title: `jonfk`,
    description: ``,
    author: `Jonathan Fok kan`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `jonfk.ca`,
        short_name: `jonfk`,
        start_url: `/`,
        background_color: `#a00`,
        theme_color: `#a00`,
        display: `minimal-ui`,
        // TODO update with favicons check https://www.gatsbyjs.org/packages/gatsby-plugin-manifest/
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: "gatsby-plugin-web-font-loader",
      options: {
        google: {
          families: ["Alegreya SC", "PT Sans"],
        },
      },
    },
  ],
};
