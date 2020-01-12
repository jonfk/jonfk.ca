---
title: Integrating Ory Hydra OAuth 2.0 with a rust web service
date: 2020-01-12
tags: rust oauth2 hydra http
---

I have been using Rust quite a bit more over the last year in a variety of use cases and I have been quite satisfied with
the language, libraries and the community. So I think it might be time to write a little bit about how well suited Rust works
in one area that I have worked a lot in, and that is HTTP APIs.

For this post I will be covering using Rust to write a web service that integrates with the [Ory Hydra](https://github.com/ory/hydra)
OAuth 2.0 Server and OpenID Connect Provider. I think that might give a decent idea of the features offered by Rust and Rust libraries for
web development.

What will we be doing in this post:

- What is OAuth 2.0 and when to use it
- How to integrate with Hydra at a high level
- Start a rust web server with Warp
- Implement the hydra call in the Warp server
- Write some tests

## What is OAuth 2.0?

> The OAuth 2.0 authorization framework enables a third-party
> application to obtain limited access to an HTTP service, either on
> behalf of a resource owner by orchestrating an approval interaction
> between the resource owner and the HTTP service, or by allowing the
> third-party application to obtain access on its own behalf.
> From [RFC 6749: The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)

Essentially OAuth 2.0 enables applications (servers, mobile apps, SPAs, etc) to obtain access tokens to access
an HTTP service scoped only to authorized actions/resources without needing the username and passwork of the
account it would like to obtain access on behalf of.

An example of this is if you would like to give access to your youtube account to an application to manage your comments.
You wouldn't want that application to also be able to post videos for you or change your profile page. You can do this with OAuth 2.0
by authorizing that application if it has an OAuth 2.0 client with Youtube. That application can go through an OAuth 2.0 flow that
will give it an access token that it can use possibly in conjunction with it's own client credentials to get access to manage
your comments.

If you noticed, there are a few caveats in my description such as an OAuth 2.0 client may or may not have it's own credentials, it may
also be able to get information on your account by including the right scopes or it may use different grant types to obtain access.
This is because OAuth 2.0 isn't a protocol as much as a framework for a protocol. It allows implementors of the OAuth 2.0 spec a lot of
flexibility so that it can be used in multiple use cases, but this ends up adding a lot of complexity to OAuth 2.0. This is why
it is strongly recommended to either use a library or off the shelf solution instead of implementing an OAuth 2.0 server yourself.

### When should you used it?

The rule of thumb for when you need an OAuth 2.0 implementation, is if you need the ability to authorize third party applications
to access your services, then you need OAuth 2.0. Otherwise, if you only need the ability to authorize users on your services through
first party clients or applications, an encrypted cookie may better serve you.

For more information, check out the following [post describing different types of access control and authorization patterns](#ory-access-authz-patterns).

### Implementing authorization through OAuth2

After having implemented and maintained OAuth2 servers with the Spring library in Java, I have a strong preference not to do that
anymore. The reasons for that would be a post in and of itself, but most of the issues stem from maintainance of such such servers
when they also contain much of the business logic for the access and authorization rules. My preference nowadays would be to have
a pure spec compliant OAuth2 server that communicates with an authorization server that would implement the custom business rules
needed by my particular implementation.

This is where [Hydra](https://github.com/ory/hydra) comes in, a hardened, OpenID Certified OAuth 2.0 Server and OpenID Connect Provider
optimized for low-latency, high throughput, and low resource consumption. Instead of implementing an OAuth2 server yourself, having
to verify your implementation complies with the spec and doesn't have any security holes, we can use Hydra to provide the OAuth2
server functionality and implement the authentication and authorization logic as seperate services.

### Implementing a Hydra integration

To integrate with the Hydra OAuth2 server, we need to implement a login and consent application. You can review the documentation for
doing so [here](https://www.ory.sh/docs/hydra/login-consent-flow).

## A Rust web service

If you have never programmed in rust, I would suggest [The Rust Book](https://doc.rust-lang.org/book/)
as the introduction to the language.

First lets start with a rust web service. Let's create a rust project.

```bash
cargo new hydra-auth-example-rs
```

Now inside of the newly created project directory called `hydra-auth-example-rs`, you should find 2 things, a src directory with a `main.rs` file and a
`Cargo.toml` file.

```bash
$ tree
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```

To do anything we will need some dependencies to get our server working. Add the following below in `[dependencies]`.

```toml:title=Cargo.toml
...
[dependencies]
warp = { git = "https://github.com/seanmonstar/warp.git", rev = "e94309e274872efed34e2a80f1e4553a45963510" }
tokio = "0.2.6"

log = "0.4.8"
env_logger = "0.7"
```

---

**Note**

I am using the unrelease version of warp from master, tagget at the latest revision as of this writing. This is
because I would like to use async/await that was just shipped to Rust 1.39 a few months ago. Once a release
of Warp supporting async await is published, I will be changing this to that released version.

---

### Hello World

We can now use these dependencies to provide a basic web service. Let's write a basic hello world endpoint as in the
example.

```rust:title=src/main.rs
use warp::{self, path, Filter};

fn main() {
    // GET /hello/warp => 200 OK with body "Hello, warp!"
    let hello = path!("hello" / String).map(|name| format!("Hello, {}!", name));

    warp::serve(hello).run(([127, 0, 0, 1], 3000));
}
```

We can run this hello world service with the following command in the project directory.

```
cargo run
```

Or to create a release build.

```
cargo build --release
# and to run this we will find the built binary at
./target/release/hydra-auth-example-rs
```

To test this endpoint, you can call it with curl.

```
$ curl http://localhost:3000/hello/jon
Hello, jon!%
```

Since we will also need login and consent pages for the Hydra integration, let's test html templating. For that
we will be using the [Tera templating library](https://crates.io/crates/tera). There are many other templating
libraries in rust and you can find a non-exhaustive list [here](https://www.arewewebyet.org/topics/templating/).
So let's add that dependency and use it.

```toml:title=Cargo.toml
...
[dependencies]
...

tera = "1.0.1"
```

```rust:title=src/main.rs
use tera::{Context, Tera};
use warp::{self, path, Filter};

#[tokio::main]
async fn main() {
    let mut tera = Tera::default();
    tera.add_raw_template(
        "hello.html",
        r#"
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <title>Hello</title>
</head>
<body>
<p>Hello, {{ name }}!</p>
</body>
</html>
"#,
    )
    .unwrap();

    let with_tera = warp::any().map(move || tera.clone());

    let hello = path!("hello" / String)
        .and(with_tera)
        .map(|name: String, tera: Tera| {
            let mut context = Context::new();
            context.insert("name", &name);

            let body = tera.render("hello.html", &context).unwrap();
            warp::reply::html(body)
        });

    warp::serve(hello).run(([127, 0, 0, 1], 3000)).await;
}
```

Now if we test our hello endpoint again, we should see it returning html instead.

```
curl -i http://localhost:3000/hello/jon
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
content-length: 126
date: Sat, 04 Jan 2020 19:59:03 GMT


<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <title>Hello</title>
</head>
<body>
<p>Hello, jon!</p>
</body>
</html>
```

Or you could point your browser to http://localhost:3000/hello/name, to see the html rendered.

---

**Note**

You will notice that I am using `.unwrap()` is several places where the function is returning
a [Result](https://doc.rust-lang.org/std/result/). I am doing that so that I don't have do to error
handling yet. I will be adding error handling in a later section but for now, if you want more
information about error handling in rust, [this section of the book](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)
should help.

---

### Login and consent

We showed the basic building blocks for creating a web service in the previous section. Let's put that to use
and build our integration to our OAuth 2.0 server. We will implement the login and consent pages and their
corresponding form post endpoints.

We will first need to update dependencies to add [Serde](https://serde.rs/) which is the library in
Rust to serialize/deserialize to various data formats.

```toml:title=Cargo.toml
...
[dependencies]
...
serde = { version = "1.0", features = ["derive"] }
```

With this let's implement the login page and form handler first.

```rust:title=src/main.rs
pub mod view;
```

Will create a view module where we can put our template rendering functions.

```rust:title=src/view.rs
use tera::Tera;
use warp::{self, Filter};

pub fn with_tera() -> warp::filters::BoxedFilter<(Tera,)> {
    warp::any().map(move || tera_templates()).boxed()
}

pub fn tera_templates() -> Tera {
    let login_tpl = r#"
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>
<h1>Login page</h1>
<form action="/login" method="post">
{% if login_challenge %}
    <input type="hidden" name="login_challenge" value="{{login_challenge}}"/>
{% else %}
{% endif %}

    <label for="username">Username</label>:
    <input type="text" id="username" name="username" autofocus="autofocus"/> <br/>

    <label for="password">Password</label>:
    <input type="password" id="password" name="password"/> <br/>

    <input type="submit" value="Log in"/>
</form>
</body>
</html>
"#;

    let mut tera = Tera::default();
    tera.add_raw_templates(vec![("login.html", login_tpl)])
        .unwrap();
    tera
}
```

And now for the actual login page using the rendering template we just created in the
`view` module.

```rust:title=src/main.rs
use serde::{Deserialize, Serialize};
use tera::{Context, Tera};
use warp::{self, Filter};

pub mod view;

#[tokio::main]
async fn main() {
    let routes = auth_routes();
    warp::serve(routes).run(([127, 0, 0, 1], 3000)).await;
}
pub fn auth_routes() -> warp::filters::BoxedFilter<(impl warp::reply::Reply,)> {
    warp::path("login")
        .and(login_page())
        .boxed()
}


pub fn login_page() -> warp::filters::BoxedFilter<(impl warp::Reply,)> {
    #[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
    struct LoginQueryParams {
        login_challenge: Option<String>,
    }

    warp::get()
        .and(warp::query::query())
        .and(view::with_tera())
        .map(move |query_params: LoginQueryParams, tera: Tera| {
            let mut context = Context::new();
            context.insert("login_challenge", &query_params.login_challenge);

            let body = tera.render("login.html", &context).unwrap();
            warp::reply::html(body)
        })
        .boxed()
}
```

If we submit the login form from the login page, we should receive a 404. To fix that
we need to implement the form post handling endpoint.

```rust:title=src/main.rs
use serde::{Deserialize, Serialize};
use tera::{Context, Tera};
use warp::{self, Filter};

pub mod view;

...

pub fn auth_routes() -> warp::filters::BoxedFilter<(impl warp::reply::Reply,)> {
    warp::path("login")
        .and(login_page().or(accept_login()))
        .boxed()
}

...

pub fn accept_login() -> warp::filters::BoxedFilter<(impl warp::Reply,)> {
    #[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
    struct FormBody {
        login_challenge: Option<String>,
        username: String,
        password: String,
    }

    warp::post()
        .and(
            warp::body::content_length_limit(1024 * 32)
                .and(warp::body::form())
                .map(|form_body: FormBody| warp::reply::json(&form_body)),
        )
        .boxed()
}
```

We now have a working login page and login handler which returns the form body back
as json. So if you try to login with the username, `"username"`, and password,
`"password"`, we should receive the following.

```json:title=http://localhost:3000/login
{
  "username": "username",
  "password": "password",
  "login_challenge": null
}
```

Following the same pattern, you can add the consent page and post endpoint. Once done
you should have something similar to [this]().

TODO Add link to github branch with current status of code.
TODO Add some explanation of what is happening in the rust code.

### Setting up the Hydra services

To be able to test our integration to hydra we will need to run it locally and to do that, the easiest way
I found is to run hydra with their [docker-compose](https://github.com/ory/hydra/blob/v1.2.0/quickstart-postgres.yml) file.
We will then make a few modifications to it. We could run hydra with an in-memory database, but with a local postgres database
we will be able to see how the api calls we will be doing to the hydra instance affect it's data store.

```yaml:title=docker-compose.yml
version: "3.3"
services:
  postgres:
    image: postgres:latest
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - ${PWD}/initdb.sh:/docker-entrypoint-initdb.d/init-user-db.sh

  hydra:
    depends_on:
      - hydra-migrate
    image: oryd/hydra:latest
    ports:
      - "4444:4444" # Public port
      - "4445:4445" # Admin port
      - "5555:5555" # Port for hydra token user
    command: serve all --dangerous-force-http
    environment:
      # https://www.ory.sh/docs/hydra/configuration
      # - LOG_LEVEL=debug
      - URLS_SELF_ISSUER=http://localhost:4444
      - URLS_CONSENT=http://localhost:3000/consent
      - URLS_LOGIN=http://localhost:3000/login
      - DSN=postgres://hydra:hello@postgres:5432/hydra?sslmode=disable
      - SECRETS_SYSTEM=youReallyNeedToChangeThis
      - SECRETS_COOKIE=youReallyNeedToChangeThisToo
      - OAUTH2_EXPOSE_INTERNAL_ERRORS=1
      - OIDC_SUBJECT_TYPES_SUPPORTED=public,pairwise
      - OIDC_SUBJECT_TYPE_PAIRWISE_SALT=youReallyNeedToChangeThisToo2
    restart: unless-stopped

  hydra-migrate:
    depends_on:
      - postgres
    image: oryd/hydra:latest
    environment:
      - DSN=postgres://hydra:hello@postgres:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    command: migrate sql -e --yes
    restart: on-failure
```

```bash:title=initdb.sh
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER hydra WITH PASSWORD 'hello';
    CREATE USER auth WITH PASSWORD 'authpassword';
    CREATE DATABASE hydra;
    CREATE DATABASE auth;
    GRANT ALL PRIVILEGES ON DATABASE hydra TO hydra;
    GRANT ALL PRIVILEGES ON DATABASE auth TO auth;
EOSQL
```

The main difference between this `docker-compose.yml` file and the one provided by in the Hydra repository, is the
`initdb.sh` script that creates 2 databases and the corresponding user and assigns that user to it's database only.

### Generating the Hydra OpenApi Client

The Hydra server provides [public and admin REST APIs](#ory-rest-api-docs) to interface with it and allows us to implement the integration.
They also provide sdks, for Go and Javascript, but since we are using Rust we will need to implement our own. Luckily
they also provide [OpenAPI specs](https://github.com/ory/hydra/blob/v1.2.0/docs/api.swagger.json) and the OpenAPI
generator implements a Rust client generator. The code quality isn't great but that should be enough to get us started
with our integration and we can always improve it later by implementing our own client using the generated models.

Here is the command to generate our rust OpenAPI client.

```
openapi-generator-cli generate -i https://raw.githubusercontent.com/ory/hydra/v1.1.1/docs/api.swagger.json --package-name hydra --library reqwest -g rust -o /local/hydra
```

Or even better, instead of installing the `openapi-generator-cli`, we can use the docker image to do the same thing and
let's put it inside a bash script to be able to reuse it if necessary and remember next time we need to regenerate.

```bash:title=generate-hydra-api.sh
#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset
set -x

docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli:latest generate -i https://raw.githubusercontent.com/ory/hydra/v1.1.1/docs/api.swagger.json --package-name hydra --library reqwest -g rust -o /local/hydra
```

Now we have 2 crates of code, one that we wrote and the other that we generated. We will need to make some space
where this new crate can live and compile the together. Cargo provides the workspace functionality for handling
multiple crates in the same repository. To do that, we will move the code we have written so far into a sub
directory. Let's call that the `auth` directory.

```bash
mkdir auth
mv Cargo.toml auth
mv src auth
```

Change the package name in the `Cargo.toml` to auth to match the directory name.

```toml:title=auth/Cargo.toml
[package]
name = "auth" # <--- name to change
version = "0.1.0"
authors = ["Jonathan Fok Kan <jfokkan@gmail.com>"]
edition = "2018"

[dependencies]
...
```

Then create a `Cargo.toml` file with the 2 sub crates we now have.

```toml:title=Cargo.toml
[workspace]

members = [
        "auth",
        "hydra",
]
```

Lets compile everything and see if the new generated crate works.

```
cargo clean
cargo build
```

Oh Ho, something's not working. We are getting a compile error.

```
error[E0308]: mismatched types
   --> hydra/src/apis/admin_api.rs:542:16
    |
542 |         if let Some(ref s) = client {
    |                ^^^^^^^^^^^   ------ this match expression has type `reqwest::Client`
    |                |
    |                expected struct `reqwest::Client`, found enum `std::option::Option`
    |
    = note: expected type `reqwest::Client`
               found type `std::option::Option<_>`

error: aborting due to previous error

For more information about this error, try `rustc --explain E0308`.
error: could not compile `hydra`.
warning: build failed, waiting for other jobs to finish...
error: build failed
```

Let's check out the file and see what's wrong. The rust compiler is helpful enough
to give us the exact location of the error. Well the error looks pretty simple, the
`client` created within the function body at `let client = &configuration.client;` is
shadowing the `client` from the function parameters. The solution is just as simple,
let's just rename the function parameter to `client_id` since that's actually what is
being sent here. The changed lines will be as follows.

```rust:title=hydra/src/apis/admin_api.rs
...
    fn revoke_consent_sessions(&self, subject: &str, client_id: Option<&str>) -> Result<(), Error> {
        let configuration: &configuration::Configuration = self.configuration.borrow();
        let client = &configuration.client;

        ...

        req_builder = req_builder.query(&[("subject", &subject.to_string())]);
        if let Some(ref s) = client_id {
            req_builder = req_builder.query(&[("client", &s.to_string())]);
        }

        ...
```

### Updating our login and consent implementation

Now that we have our generated hydra client library, we want to integrate this into our `auth` project. Let's
take a look at the code. For reading and getting a quick overview of the code. My preferred way of doing this
is by reading the documentation. Even when there is no documentation, Rust generates pretty nice documentation
from the public types and provides a fairly intuitive way of navigating and searching the interface. To do generate
the documentation, Cargo provides the `doc` command.

```
cargo doc --open
```

If your browser didn't open with documentation page, you should be able to find it at `./target/doc/hydra/index.html`
in the root directory of the project.

Once the documentation is opened, you should find the hydra crate which will be in the crates list. Inside, you will find
2 modules, the apis and models modules. Inside the apis module, we will find the structs and traits that will help us
communicate with hydra. The `AdminApiClient` will be the one we care about to implement the login and consent features.

```
impl AdminApiClient
pub fn new(configuration: Rc<Configuration>) -> AdminApiClient
```

We can see that `AdminApiClient` has a new function to create a new instance of the struct and it takes a `Rc<Configuration>`.
`Rc<Configuration>` is a reference counted pointer to a Configuration struct and the Configuration struct has some fields
that helps the ApiClient figure out how to make calls to the hydra instance.

Similar to the Tera template renderer, we will create a Warp Filter that will contain the AdminApiClient and pass it to the
function handling the endpoints. But first we need to add the dependency to the hydra crate to our main auth crate.

```toml:title=auth/Cargo.toml
[dependencies]
...
hydra = { path = "../hydra" }
...
```

```rust:title=auth/src/main.rs
...
use hydra::apis::{configuration::Configuration, AdminApiClient};
use std::rc::Rc;

...

pub fn with_hydra_api() -> warp::filters::BoxedFilter<(AdminApiClient,)> {
    warp::any()
        .map(move || {
            let mut configuration = Configuration::new();
            configuration.base_path = HYDRA_ADMIN_ADDRESS.to_owned();
            AdminApiClient::new(Rc::new(configuration))
        })
        .boxed()
}

```

But something's not right, we are getting a compilation error, with rust stating that our `Rc<Configuration>` isn't `Send`.

```
error[E0277]: `std::rc::Rc<hydra::apis::configuration::Configuration>` cannot be sent between threads safely
  --> auth/src/main.rs:44:10
   |
44 |         .boxed()
   |          ^^^^^ `std::rc::Rc<hydra::apis::configuration::Configuration>` cannot be sent between threads safely
   |
   = help: within `(hydra::apis::admin_api::AdminApiClient,)`, the trait `std::marker::Send` is not implemented for `std::rc::Rc<hydra::apis::configuration::Configuration>`
   = note: required because it appears within the type `hydra::apis::admin_api::AdminApiClient`
   = note: required because it appears within the type `(hydra::apis::admin_api::AdminApiClient,)`
```

What is Send? [Send](#rust-send-sync) is a marker trait that states whether something can be sent between threads (i.e. thread-safe).
What can we do? Well not much, it seems that Warp requires state passed into it's filters to be thread safe since it aims to concurrently
handle requests with multiple threads but the openapi code generator produced code that can't. We are going to have to modify the generated code
just enough to make it thread safe. One way to do that is simply to switch the Rc with [Arc](https://doc.rust-lang.org/std/sync/struct.Arc.html)
which is the thread safe version of Rc.

These 2 commands ought to do it.

```
find ./hydra -type f -exec sed -i '' 's/std::rc::Rc/std::sync::Arc/g' {} \;
find ./hydra -type f -exec sed -i '' 's/Rc/Arc/g' {} \;
```

Now instead of `AdminApiClient::new(Rc::new(configuration))` we can pass it `AdminApiClient::new(Arc::new(configuration))`.

Let's implement the accept login request logic for the hydra integration in the login page.

```rust:title=auth/src/main.rs
use log::info;
use serde::{Deserialize, Serialize};
use tera::{Context, Tera};
use warp::{self, http::Uri, Filter};

use hydra::apis::{configuration::Configuration, AdminApi, AdminApiClient};
use std::{str::FromStr, sync::Arc};
...

pub fn login_page() -> warp::filters::BoxedFilter<(impl warp::Reply,)> {
    #[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
    struct LoginQueryParams {
        login_challenge: Option<String>,
    }

    warp::get()
        .and(warp::query::query())
        .and(view::with_tera())
        .and(with_hydra_api())
                .map(
                    move |query_params: LoginQueryParams, tera: Tera, hydra_api: AdminApiClient| {

                        // The challenge is used to fetch information about the login request from ORY Hydra.
                        query_params
                            .login_challenge
                            .map(|login_challenge| {
                                let login_request =
                                    hydra_api.get_login_request(&login_challenge).unwrap();

                                // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
                                if login_request.skip.unwrap_or(false) {
                                    info!("Hydra was already able to authenticate the user, skipping login as we do not need to re-authenticate");
                                    info!("Accepting login request with Hydra");

                                    // You can apply logic here, for example update the number of times the user logged in.
                                    // ...

                                    // Now it's time to grant the login request. You could also deny the request if something went terribly wrong
                                    // (e.g. your arch-enemy logging in...)
                                    let completed_request = hydra_api
                                        .accept_login_request(
                                            &login_challenge,
                                            Some(hydra::models::AcceptLoginRequest::new(
                                                // All we need to do is to confirm that we indeed want to log in the user.
                                                // We are using a hardcoded subject here, the subject should be an immutable id of the user that is loggin in
                                                // to let Hydra know which user to associate with this login.
                                                "hardcoded_subject".to_owned(),
                                            )),
                                        )
                                        .unwrap();

                                    // All we need to do now is to redirect the user back to hydra!
                                    Box::new(warp::redirect(
                                        Uri::from_str(
                                            &completed_request
                                                .redirect_to
                                                .unwrap_or("/".to_owned()),
                                        )
                                        .unwrap(),
                                    )) as Box<dyn warp::Reply>
                                } else {
                                    // If authentication can't be skipped we MUST show the login UI.
                                    info!("Sending user to login");

                                    // The challenge will be a hidden input field
                                    let mut context = Context::new();
                                    context.insert("login_challenge", &login_challenge);

                                    let body = tera.render("login.html", &context).unwrap();
                                    Box::new(warp::reply::html(body)) as Box<dyn warp::Reply>
                                }
                            })
                            .unwrap_or_else(|| {
                                let body = tera.render("login.html", &Context::new()).unwrap();
                                Box::new(warp::reply::html(body)) as Box<dyn warp::Reply>
                            })
                    },
                )
        .boxed()
}
```

There is quite a bit happening here, so let's explain. First, I added info logging in a few places, which is why
I added the `log::info` dependency. We will need to turn on the logs later on, but let's not worry about that for now.
The logic goes as follows:

1. We map the `login_challenge` from the query parameters, if it doesn't exist, we render a login page without
   login challenge. I did this because I expected the login page to also be usable outside of an oauth2 flow, in which case
   we could simply return a session cookie once the user is authenticated. We could also have simply returned an
   error if the login challenge wasn't there.
2. If the login challenge exists, we call hydra's get login request api and with the login request we check if
   we could skip the login page if the user had successfully authenticated with this browser in the past.
3. If we can skip the user authentication, we go straight into accepting the login request with the hydra api. This is
   also where we could have added some logic before calling the accept login api to do various checks.
4. Once the login request is accepted, we redirect to the url provided by hydra or to the homepage if it's not provided. In
   this case since we are expecting to be redirected by hydra, we could also have returned an error page if the redirect url was
   empty.
5. If we can't skip authentication, we send the user to the login page with the login challenge set.

Something else you may have noticed is that instead of returning a `warp::Reply` directly, I wrapped it inside of a Box so that
our function is returning a trait object. This is because we are returning 2 different types both implementing the Reply trait
in the 2 branches of our if else expression. This wouldn't work unless we make them both the same type by turning them into trait
objects. To learn more about Trait Objects check out these [links](#rust-trait-objects).

I also imported the `std::str::FromStr` trait so that it can be used to convert an `&str` to a `Uri`.

As for handling the login form, we will be following similar logic as above.

```rust:title=auth/src/main.rs
...

pub fn accept_login() -> warp::filters::BoxedFilter<(impl warp::Reply,)> {
    #[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
    struct FormBody {
        login_challenge: Option<String>,
        username: String,
        password: String,
    }

    warp::post()
        .and(
            warp::body::content_length_limit(1024 * 32)
                .and(warp::body::form())
                .and(with_hydra_api())
                .map(|form_body: FormBody, hydra_api: AdminApiClient| {
                    // Add logic here to verify the username and password from the submitted login form

                    // Accepting login request, although you could still deny the login request if something else went wrong
                    form_body
                        .login_challenge
                        .map(|login_challenge| {
                            info!("Accepting login request with Hydra");
                            let completed_request = hydra_api
                                .accept_login_request(
                                    &login_challenge,
                                    Some(hydra::models::AcceptLoginRequest::new(
                                        // We are using a hardcoded subject here, the subject should be an immutable id of the user that is loggin in
                                        // to let Hydra know which user to associate with this login
                                        "hardcoded_subject".to_owned(),
                                    )),
                                )
                                .unwrap();

                            // Redirecting to hydra
                            warp::redirect(
                                Uri::from_str(
                                    &completed_request.redirect_to.unwrap_or("/".to_owned()),
                                )
                                .unwrap(),
                            )
                        })
                        .unwrap_or_else(|| warp::redirect(Uri::from_str("/").unwrap()))
                }),
        )
        .boxed()
}
```

And following the same principles as the login logic, we can do the same for the consent.

#### Enabling logging

Before we finish, let's print the logs that we inserted. To do that we will be using the env_logger library.
It's a fairly simple library that allows you to control the log level and which crates should have it's logs
enabled through an environment variable, by default that env var is `RUST_LOG`.

I will also add the log Filter from warp to give us access logs on our endpoints.

```rust:title=auth/src/main.rs
#[tokio::main]
async fn main() {
    if ::std::env::var_os("RUST_LOG").is_none() {
        ::std::env::set_var("RUST_LOG", "warp=info,auth_svc=trace,api_access=trace");
    }
    env_logger::init();

    let routes = auth_routes().or(homepage()).with(warp::log("api_access"));
    warp::serve(routes).run(([127, 0, 0, 1], 3000)).await;
}
```

TODO Add link to github branch

### Testing our login and consent integration

We now have working login and consent application and a way to deploy hydra locally. How do we know what
we wrote is work? Let's try it out manually and then write some tests for it.

```
docker-compose up -d
cargo run
```

Create a client in Hydra.

```
curl -X POST \
  http://localhost:4445/clients \
  -H 'Content-Type: application/json' \
  -d '{
	"client_id": "my-implicit-client",
	"grant_types": ["implicit"],
	"response_types": ["token"],
	"redirect_uris": ["http://localhost:3000/"],
	"token_endpoint_auth_method": "client_secret_post"
}'
```

To start the flow, navigate to [Authorization Initialization link](localhost:4444/oauth2/auth?client_id=my-implicit-client&response_type=token&scope=offline&state=blahblahblah)
which is usually generated by an OAuth2 client or library.

After going through the login and consent pages, we should end up back on the welcome page with the access token.

```
http://localhost:3000/#access_token=IQc9NKSJyHS9Vy9iS05kyXVoUTkXexCQPxq-6_Ly5C8.m5m7P-RYhty0o47x35D1uF-k_JJdttzjxqqw11Kr22M&expires_in=3600&scope=offline&state=blahblahblah&token_type=bearer
```

Since we know that our integration is working, let's write a test that we can run to verify that it keeps working in the
future. To do that, we will create a `tests` directory in our `auth` project. That's where integration tests usually go,
whereas unit tests can be written inline (For more information on tests check out these [links](#rust-testing)). But we
might want to refer to some structs from our crate such as the form model structs, currently we can't do that because we
wrote all our code in a `main.rs` file which is used for creating a binary. We would need to move the code that we would
like to be able to share as a library into a `lib.rs` file.

We will add a function that returns our routes which can then be used from the `main.rs` file.

```rust:title=auth/src/lib.rs
...
pub fn routes() -> warp::filters::BoxedFilter<(impl warp::reply::Reply,)> {
    auth_routes()
        .or(homepage())
        .with(warp::log("api_access"))
        .boxed()
}
...
```

```rust:title=auth/src/main.rs
use auth;
use warp;

#[tokio::main]
async fn main() {
    if ::std::env::var_os("RUST_LOG").is_none() {
        ::std::env::set_var("RUST_LOG", "warp=info,auth_svc=trace,api_access=trace");
    }
    env_logger::init();

    warp::serve(auth::routes())
        .run(([127, 0, 0, 1], 3000))
        .await;
}
```

Then we will have to expose the structs we created to model the form bodies of our login and consent apis.

```rust:title=auth/src/lib.rs
...
#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct LoginFormBody {
    pub login_challenge: Option<String>,
    pub username: String,
    pub password: String,
}

...

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ConsentStatus {
    Authorize,
    Deny,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ConsentFormBody {
    pub consent_challenge: String,
    pub submit: ConsentStatus,
}
...
```

Now that we have a library crate we can get to the actual work of writing the test.

```toml:title=auth/Cargo.toml
...
[dev-dependencies]
uuid = { version = "0.8", features = ["v4"] }
oauth2 = " 3.0.0-alpha.7"
reqwest = { version = "0.10.0", features = ["json", "blocking", "cookies"] }
```

The body of a basic test is as follows.

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs
#[test]
fn basic_test() {
    assert!(true);
}
```

Since this is an integration test we may want to check that our external dependencies are up.

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs
use reqwest::{self, Url};

#[test]
fn login_and_consent_flow() {
    check_auth_svc(AUTHN_BASE_URL);
    check_hydra(HYDRA_ADMIN_BASE_URL);
}

fn check_auth_svc(authn_url: &str) {
    let res = reqwest::blocking::get(authn_url).unwrap();
    assert_eq!(res.status(), reqwest::StatusCode::OK);
}

fn check_hydra(hydra_url: &str) {
    let hydra_url = Url::parse(hydra_url).unwrap();
    let res = reqwest::blocking::get(hydra_url.join("/health/ready").unwrap()).unwrap();
    assert_eq!(res.status(), reqwest::StatusCode::OK);
}
```

As we saw in our manual test, we will first need to create an oauth2 client to do our test. To know
which type of oauth2 client we want to create, we should decide what we will be testing. So let's say
we will be testing the authorization code grant type.

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs
use hydra::apis::{configuration::Configuration, AdminApi, AdminApiClient};
use reqwest::{self, Url};
use std::sync::Arc;
use uuid::Uuid;

#[test]
fn login_and_consent_flow() {
    ...

    let mut config = Configuration::new();
    config.base_path = HYDRA_ADMIN_BASE_URL.to_owned();
    let hydra_admin_client = AdminApiClient::new(Arc::new(config));

    let oauth2_client = create_oauth2_client(&hydra_admin_client);
}

fn create_oauth2_client(hydra_admin_client: &AdminApiClient) -> hydra::models::OAuth2Client {
    let mut new_oauth2_client = hydra::models::OAuth2Client::new();
    new_oauth2_client.client_id = Some(format!(
        "{}-{}",
        Uuid::new_v4().to_string(),
        "my-test-client"
    ));
    new_oauth2_client.client_name = Some("login-flow-test-client".to_owned());
    new_oauth2_client.client_secret = Some("client-secret".to_owned());
    new_oauth2_client.grant_types = Some(vec!["authorization_code".to_owned()]);
    new_oauth2_client.redirect_uris = Some(vec![AUTHN_BASE_URL.to_owned()]);
    new_oauth2_client.token_endpoint_auth_method = Some("client_secret_basic".to_owned());
    new_oauth2_client.scope = Some("openid".to_owned());

    hydra_admin_client
        .create_o_auth2_client(new_oauth2_client)
        .unwrap()
}
```

With the created OAuth 2 client, we can initiate an oauth2 flow. For that, we will use an [OAuth2 library](https://crates.io/crates/oauth2).

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs

#[test]
fn login_and_consent_flow() {
    ...

    let access_token = initiate_oauth2_code_flow(
        &oauth2_client.client_id.unwrap(),
        &oauth2_client.client_secret.unwrap(),
    );
}

...

fn initiate_oauth2_code_flow(client_id: &str, client_secret: &str) -> String {
    // Create an HTTP client to act as the browser
    let reqwest_client = reqwest::blocking::Client::builder()
        // Enable the cookie store for hydra csrf cookies
        .cookie_store(true)
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();

    // Create an OAuth2 client by specifying the client ID, client secret, authorization URL and
    // token URL.
    let client = OAuth2BasicClient::new(
        ClientId::new(client_id.to_owned()),
        Some(ClientSecret::new(client_secret.to_owned())),
        AuthUrl::new("http://localhost:4444/oauth2/auth".to_owned()).unwrap(),
        Some(TokenUrl::new("http://localhost:4444/oauth2/token".to_owned()).unwrap()),
    )
    // Set the URL the user will be redirected to after the authorization process.
    .set_redirect_url(RedirectUrl::new("http://localhost:3000/".to_string()).unwrap());

    // Generate a PKCE challenge.
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

    // Generate the full authorization URL.
    let (auth_url, csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        // Set the desired scopes.
        .add_scope(Scope::new("openid".to_string()))
        // Set the PKCE code challenge.
        .set_pkce_challenge(pkce_challenge)
        .url();

    // This is the URL you should usually redirect the user to,
    // in order to trigger the authorization process.
    println!("URL to trigger authorization process: \n{}", auth_url);
}
```

Usually the authorize url would then be used to redirect the user (resource owner) to initiate the
authorization process. But since we are writing an automated test, we will be emulating the browser
with an http client and call our login and consent apis directly.

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs

fn initiate_oauth2_code_flow(client_id: &str, client_secret: &str) -> String {
    ...

    let hydra_login_completed_url = perform_login_flow(&reqwest_client, &auth_url);
}

fn perform_login_flow(reqwest_client: &reqwest::blocking::Client, auth_url: &Url) -> String {
    let hydra_authz_res = reqwest_client.get(auth_url.as_ref()).send().unwrap();
    println!("\nThis is the response from Hydra when visiting the url to trigger the authorization process");
    dbg!(&hydra_authz_res);

    assert!(hydra_authz_res.status().is_redirection());

    let login_url = hydra_authz_res
        .headers()
        .get(reqwest::header::LOCATION)
        .unwrap()
        .to_str()
        .unwrap();
    let login_challenge = Url::parse(login_url)
        .unwrap()
        .query_pairs()
        .find(|c| c.0.as_ref().eq_ignore_ascii_case("login_challenge"))
        .unwrap()
        .1
        .to_owned()
        .to_string();

    let login_res = reqwest_client
        .post("http://localhost:3000/login")
        .form(&LoginFormBody {
            login_challenge: Some(login_challenge),
            username: "username".to_owned(),
            password: "pass".to_owned(),
        })
        .send()
        .unwrap();

    println!("\nThis is the response from our auth service when visiting the login page");
    dbg!(&login_res);

    assert!(login_res.status().is_redirection());

    let hydra_redirected_url = login_res
        .headers()
        .get(reqwest::header::LOCATION)
        .unwrap()
        .to_str()
        .unwrap();

    hydra_redirected_url.to_owned()
}
```

You can note that I disabled redirection in our http client so that we can see all the redirects
that are occurring. That is not strictly necessary and we could simply have followed the redirects
which would also have made our code much shorter.

Same thing for the consent.

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs

fn initiate_oauth2_code_flow(client_id: &str, client_secret: &str) -> String {
    ...

    let redirected_url = perform_consent_flow(&reqwest_client, &hydra_login_completed_url);
}

...

fn perform_consent_flow(
    reqwest_client: &reqwest::blocking::Client,
    hydra_login_completed_url: &str,
) -> String {
    let hydra_consent_res = reqwest_client
        .get(hydra_login_completed_url)
        .send()
        .unwrap();

    println!("\nThis is the response from hydra when visiting the url received at the end of the login process");
    dbg!(&hydra_consent_res);
    println!("\nAs we can see, hydra will now redirect us to our consent page since the login request was accepted");

    assert!(hydra_consent_res.status().is_redirection());

    let consent_url = hydra_consent_res
        .headers()
        .get(reqwest::header::LOCATION)
        .unwrap()
        .to_str()
        .unwrap();
    let consent_challenge = Url::parse(consent_url)
        .unwrap()
        .query_pairs()
        .find(|c| c.0.as_ref().eq_ignore_ascii_case("consent_challenge"))
        .unwrap()
        .1
        .to_owned()
        .to_string();

    let consent_res = reqwest_client
        .post("http://localhost:3000/consent")
        .form(&ConsentFormBody {
            consent_challenge: consent_challenge,
            submit: ConsentStatus::Authorize,
        })
        .send()
        .unwrap();

    println!("\nThis is the response from our auth service when visiting the consent page");
    dbg!(&consent_res);

    assert!(consent_res.status().is_redirection());

    let hydra_consent_approved_url = consent_res
        .headers()
        .get(reqwest::header::LOCATION)
        .unwrap()
        .to_str()
        .unwrap();

    let hydra_consent_approved_res = reqwest_client
        .get(hydra_consent_approved_url)
        .send()
        .unwrap();
    println!("\nThis is the response from hydra once the consent request was accepted. You can note that it contains the authorization code appended to the redirect url configured at the start of the OAuth2 process");
    dbg!(&hydra_consent_approved_res);

    let redirected_url = hydra_consent_approved_res
        .headers()
        .get(reqwest::header::LOCATION)
        .unwrap()
        .to_str()
        .unwrap();

    redirected_url.to_owned()
}
```

With the final redirected url, we will receive an auth code that is used in the authorization code grant type
to get our access token.

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs

fn initiate_oauth2_code_flow(client_id: &str, client_secret: &str) -> String {
    let auth_code = Url::parse(&redirected_url)
        .unwrap()
        .query_pairs()
        .find(|c| c.0.as_ref().eq_ignore_ascii_case("code"))
        .unwrap()
        .1
        .to_owned()
        .to_string();

    // Once the user has been redirected to the redirect URL, you'll have access to the
    // authorization code. For security reasons, your code should verify that the `state`
    // parameter returned by the server matches `csrf_state`.
    // Here we are skipping this check for the purposes of brevity of this test.

    // Now you can trade it for an access token.
    let token_result = client
        .exchange_code(AuthorizationCode::new(auth_code.to_string()))
        // Set the PKCE code verifier.
        .set_pkce_verifier(pkce_verifier)
        .request(http_client)
        .unwrap();
    println!("\nOnce the authorization code is exchanged, we finally received an access token");
    dbg!(&token_result);
    println!("{:?}", token_result.access_token().secret());
    token_result.access_token().secret().to_owned()
}
```

Now that we have an access token, we should probably see if we can verify it with the [introspection endpoint](#oauth2-introspection).

```rust:title=auth/tests/oauth2_auth_code_end_to_end_test.rs
#[test]
fn login_and_consent_flow() {
    ...

    let access_token = initiate_oauth2_code_flow(
        &oauth2_client.client_id.unwrap(),
        &oauth2_client.client_secret.unwrap(),
    );

    introspect_access_token(&hydra_admin_client, &access_token);
}

...

fn introspect_access_token(hydra_admin_client: &AdminApiClient, access_token: &str) {
    let introspection_res = hydra_admin_client
        .introspect_o_auth2_token(access_token, None)
        .unwrap();
    dbg!(&introspection_res);
    assert!(introspection_res.active);
}
```

We can now run our test to see everything running. Since I added some print statements, to be
able to see those we will also need to run the test command with the `--nocapture` flag.

```
cargo test -- --nocapture
```

### Async Rust

If you have kept up to date with Async Rust, you may have noticed that the hydra generated client
uses the blocking version of the Reqwest library to make it's api calls. This means that by making
these API calls we are blocking the tokio executor. What this means is that in cases of load on our
auth server, the server may have all it's executor threads blocked on the blocking call we are currently
making and prevent the server from serving as many requests as it could.

There are 2 ways to fix, the easiest would be to move the blocking call into a thread where blocking isn't
an issue. To do that we could spawn the blocking call on a seperate thread where we wouldn't block the tokio
executor. See these [links for more info](#rust-async-tokio-blocking).

The second would be to rewrite the blocking api client with a non-blocking http client. The latest version
of reqwest is such a client.

## Where to go from here?

We now have a working OAuth 2.0 authorization server integrated with a barebones auth server, but
this isn't the end, there are lots of things we could improve or do with our system. In no particular
order

- Add CSRF protection to our login and consent pages and endpoints. This is necessary to prevent a class
  of attacks called [Login CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Forging_login_requests)
- Add User management features to our auth service so that it can implement authentication logic
- Add actual authentication logic to the login endpoints
- Deploy our service to kubernetes. Hydra already provides [Helm Charts for that](https://github.com/ory/k8s)
- Making sure to follow Hydra's production guide before deploying our services. [Link](https://www.ory.sh/docs/hydra/production)
- Put our services behind an API Gateway or reverse proxy so that all our services are available at one address
- Protect a web service's resources(resource server) with our authorization server
- Integrate with Ory's other projects such as [Keto](https://github.com/ory/keto) to provide Access Control rules processing

## References

1. <span id="rfc-6749">[RFC 6749: The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)</span>
2. <span id="ietf-rfcs-list">[List of IETF OAuth 2.0 RFCs](https://tools.ietf.org/wg/oauth/)</span>
3. <span id="oauth-net-links">[Links to various documents about OAuth 2.0](https://oauth.net/2/) from oauth.net</span>
4. <span id="oauth-security-best-practices">[The latest security best practices for OAuth 2.0](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-12)</span>
5. <span id="oauth-2-simplified">[OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/) by Aaron Parecki</span>
6. <span id="hydra-spring-authn">A previous Hydra integration I wrote with Spring and Java [Git Repo](https://github.com/jonfk/hydra-spring-authn-authz-example)</span>
7. <span id="ory-access-authz-patterns">[Information about when you may want to use different types of access control (Access Tokens vs session cookies)](https://www.ory.sh/web-api-cloud-access-control-authentication/)</span>
8. <span id="ory-rest-api-docs">Ory Hydra REST API docs</span>
   1. [Ory Hydra REST API docs](https://www.ory.sh/docs/hydra/sdk/api)
   2. [OryOS.14 Versioned Github link](https://github.com/ory/docs/blob/v0.0.30%2BoryOS.14/docs/hydra/sdk/api.md)
9. <span id="openapi-generator">OpenAPI</span>
   1. [OpenAPI Generator](https://openapi-generator.tech/)
   2. [Github Link](https://github.com/OpenAPITools/openapi-generator)
10. <span id="rust-send-sync">Rust Send and Sync Traits</span>
    1. [Send std docs](https://doc.rust-lang.org/std/marker/trait.Send.html)
    2. [Send and Sync from the Rustonomicon](https://doc.rust-lang.org/nomicon/send-and-sync.html)
11. <span id="rust-trait-objects">Rust Trait Objects</span>
    1. [Generic Data Types](https://doc.rust-lang.org/book/ch10-01-syntax.html)
    2. [Trait Objects](https://doc.rust-lang.org/1.30.0/book/2018-edition/ch17-02-trait-objects.html)
12. <span id="rust-testing">Rust Testing</span>
    1. [Writing Automated Tests from the Rust Book](https://doc.rust-lang.org/book/ch11-00-testing.html)
    2. [Testing from Rust By Example](https://doc.rust-lang.org/rust-by-example/testing.html)
13. <span id="oauth2-introspection">OAuth 2.0 Token Introspection Extension</span>
    1. [OAuth2 Token Introspection Endpoint from oauth.com](https://www.oauth.com/oauth2-servers/token-introspection-endpoint/)
    2. [RFC 7662: OAuth 2.0 Token Introspection](https://tools.ietf.org/html/rfc7662)
    3. [Ory Hydra Introspection docs](https://www.ory.sh/docs/hydra/sdk/api#introspect-oauth2-tokens)
14. <span id="rust-async-tokio-blocking">Async Rust: Tokio Blocking</span>
    1. [tokio::task](https://docs.rs/tokio/0.2.9/tokio/task/index.html)
    2. [tokio::task::block_in_place](https://docs.rs/tokio/0.2.9/tokio/task/fn.block_in_place.html)
    3. [tokio::task::spawn_blocking](https://docs.rs/tokio/0.2.9/tokio/task/fn.spawn_blocking.html)
