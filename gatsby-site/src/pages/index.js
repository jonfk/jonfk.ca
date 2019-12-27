import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";
import BlogPostList from "../components/blog-post-list";
import Projects from "../components/projects";

const IndexPage = () => {
  return (
    <Layout>
      <SEO title="Home" />
      <BlogPostList />
      <Projects />
    </Layout>
  );
};

export default IndexPage;
