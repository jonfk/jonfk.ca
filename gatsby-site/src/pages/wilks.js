import React, { useEffect } from "react";
import Helmet from "react-helmet";

import Layout from "../components/layout";
import SEO from "../components/seo";

const WilksPage = () => {
  useEffect(() => {
    var script = document.createElement("script");
    script.type = "application/javascript";
    script.src = "/wilks-app-init.js";
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  });

  return (
    <Layout>
      <SEO title="Wilks App" />
      <h2>Wilks Score Calculator</h2>
      <div id="wilks-app"></div>

      <Helmet>
        <script id="wilks-elm-app" src="/wilks-elm-app.js"></script>
      </Helmet>
    </Layout>
  );
};

export default WilksPage;
