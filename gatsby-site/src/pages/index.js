import React from "react";
import { Link, useStaticQuery } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import BlogPostList from "../components/blog-post-list";

const IndexPage = () => {
  return (
    <Layout>
      <SEO title="Home" />
      <BlogPostList />
    </Layout>
  );
};

export default IndexPage;
