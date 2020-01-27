const sitemap = require("./src/utils/sitemap");
const rssfeed = require("./src/utils/rssfeed");

module.exports = {
  siteMetadata: {
    siteUrl: `https://www.jonfk.ca`,
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
        path: `${__dirname}/content/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/content/blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/content/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `favicon`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 650,
            },
          },
          {
            resolve: "gatsby-remark-code-titles",
            options: {
              className: "gatsby-remark-code-title",
            },
          }, // IMPORTANT: this must be ahead of other plugins that use code blocks
          {
            resolve: `gatsby-remark-table-of-contents`,
            options: {
              exclude: "Table of Contents",
              tight: false,
              fromHeading: 2,
              toHeading: 6,
            },
          },
          `gatsby-remark-autolink-headers`,
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              noInlineHighlight: true,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `jonfk.ca`,
        short_name: `jonfk`,
        start_url: `/`,
        background_color: `#a00`,
        theme_color: `#a00`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    /* {
     *   resolve: "gatsby-plugin-web-font-loader",
     *   options: {
     *     google: {
     *       families: ["Alegreya SC", "PT Sans", "Ubuntu Mono"],
     *     },
     *   },
     * }, */
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [{ family: `Alegreya SC`, text: `JONFK` }, { family: `Ubuntu Mono` }],
      },
    },
    `gatsby-transformer-yaml`,
    // Useful since netlify works better without cachebusting urls
    `gatsby-plugin-remove-fingerprints`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: sitemap.options,
    },
    { resolve: `gatsby-plugin-feed`, options: rssfeed.options },
    `gatsby-plugin-netlify`,
  ],
};
