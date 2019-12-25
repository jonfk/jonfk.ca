import React from "react";
import { Link, useStaticQuery } from "gatsby";

import Layout from "../../components/layout";
import SEO from "../../components/seo";
import BlogPostDate from "../../components/blog-date";

const FavoritesPage = () => {
  const data = useStaticQuery(graphql`
    query MyQuery {
      allDataYaml {
        nodes {
          favorites {
            archiveDate: archiveDate(formatString: "YYYY-MM-DD")
            archivePrettyDate: archiveDate(formatString: "DD MMM YYYY")
            description
            technology {
              date: date(formatString: "YYYY-MM-DD")
              prettyDate: date(formatString: "DD MMM YYYY")
              name
              url
            }
            strengthAndConditioning {
              date: date(formatString: "YYYY-MM-DD")
              prettyDate: date(formatString: "DD MMM YYYY")
              name
              url
            }
            life {
              date: date(formatString: "YYYY-MM-DD")
              prettyDate: date(formatString: "DD MMM YYYY")
              name
              url
              urls
            }
            humor {
              date: date(formatString: "YYYY-MM-DD")
              prettyDate: date(formatString: "DD MMM YYYY")
              name
              url
            }
          }
        }
      }
    }
  `);
  let favorites = data.allDataYaml.nodes[0].favorites;
  return (
    <Layout>
      <SEO title="Favorites" />
      <h2>Old Favorites</h2>
      <p>Archived on {favorites.archivePrettyDate}</p>
      <p>{favorites.description}</p>

      <h3>Technology</h3>
      <ul
        style={{
          listStyleType: `none`,
          marginLeft: 0,
        }}
      >
        {favorites.technology.map(({ date, prettyDate, name, url }) => (
          <li>
            <BlogPostDate postDate={date} postPrettyDate={prettyDate} />
            {` » `}
            <a href={url}>{name}</a>
          </li>
        ))}
      </ul>

      <h3>Strength & Conditioning</h3>
      <ul
        style={{
          listStyleType: `none`,
          marginLeft: 0,
        }}
      >
        {favorites.strengthAndConditioning.map(({ date, prettyDate, name, url }) => (
          <li>
            <BlogPostDate postDate={date} postPrettyDate={prettyDate} />
            {` » `}
            <a href={url}>{name}</a>
          </li>
        ))}
      </ul>

      <h3>Humor</h3>
      <ul
        style={{
          listStyleType: `none`,
          marginLeft: 0,
        }}
      >
        {favorites.humor.map(({ date, prettyDate, name, url }) => (
          <li>
            <BlogPostDate postDate={date} postPrettyDate={prettyDate} />
            {` » `}
            <a href={url}>{name}</a>
          </li>
        ))}
      </ul>

      <h3>Life</h3>
      <ul
        style={{
          listStyleType: `none`,
          marginLeft: 0,
        }}
      >
        {favorites.life.map(({ date, prettyDate, name, url, urls }) => {
          if (url) {
            return (
              <li>
                <BlogPostDate postDate={date} postPrettyDate={prettyDate} />
                {` » `}
                <a href={url}>{name}</a>
              </li>
            );
          } else {
            return (
              <li>
                <BlogPostDate postDate={date} postPrettyDate={prettyDate} />
                {` » `}
                <a href={url}>{name}</a>
                {` `}
                {urls.map((url, i) => (
                  <>
                    <a href={url}>{i + 1}</a>
                    {` `}
                  </>
                ))}
              </li>
            );
          }
        })}
      </ul>
    </Layout>
  );
};

export default FavoritesPage;
