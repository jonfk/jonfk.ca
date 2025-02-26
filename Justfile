# Define the Zola Docker image
ZOLA_IMAGE := "ghcr.io/getzola/zola:v0.20.0"

# Detect operating system and set docker command
UNAME := `uname -s`
DOCKER_CMD := if UNAME == "Darwin" { "docker" } else { "sudo docker" }

# Default recipe to run when just is called without arguments
default:
    @just --list

# Pull the Zola Docker image
pull:
    {{DOCKER_CMD}} pull {{ZOLA_IMAGE}}

# Build the static site
build:
    {{DOCKER_CMD}} run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app {{ZOLA_IMAGE}} build

# Clean the public directory
clean:
    rm -rf public

# Rebuild the site (clean and then build)
rebuild: clean build

# Serve the site locally
serve:
    {{DOCKER_CMD}} run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app -p 8080:8080 {{ZOLA_IMAGE}} serve --interface 0.0.0.0 --port 8080 --base-url localhost

# Check the site for broken links
check:
    {{DOCKER_CMD}} run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app {{ZOLA_IMAGE}} check

# Create a new blog post with date prefix
new-blog TITLE:
    #!/usr/bin/env sh
    DATE=$(date +%Y-%m-%d)
    {{ DOCKER_CMD }} run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app {{ZOLA_IMAGE}} new content/blog/$DATE-{{TITLE}}.md

# Check for newer versions of Zola on GitHub
check-updates:
    #!/usr/bin/env sh
    CURRENT_VERSION=$(echo {{ZOLA_IMAGE}} | sed 's/.*://')
    echo "Current version: $CURRENT_VERSION"
    echo "Checking for newer versions..."
    LATEST_VERSION=$(curl -s https://api.github.com/repos/getzola/zola/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    echo "Latest version: $LATEST_VERSION"
    if [ "$CURRENT_VERSION" = "$LATEST_VERSION" ]; then
        echo "✓ You're using the latest version of Zola"
    else
        echo "⚠ A newer version of Zola is available"
        echo "To update, change the ZOLA_IMAGE variable in your Justfile to:"
        echo "ZOLA_IMAGE := \"ghcr.io/getzola/zola:$LATEST_VERSION\""
    fi
