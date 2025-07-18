# syntax=docker/dockerfile-upstream:master-labs
FROM amazonlinux:2023
ARG CACHEBUST=2025-07-15-14-16-18

WORKDIR /PrairieLearn

COPY --parents scripts/pl-install.sh /PrairieLearn/

RUN /bin/bash /PrairieLearn/scripts/pl-install.sh

# Ensures that running Python in the container will use the correct Python version.
ENV PATH="/PrairieLearn/.venv/bin:/PrairieLearn/node_modules/.bin:$PATH"

# We copy `requirements.txt` and the `Makefile` since we need to install Python dependencies.
COPY --parents requirements.txt Makefile /PrairieLearn/

RUN PIP_NO_CACHE_DIR=1 make python-deps

# This copies in all the `package.json` files in `apps` and `packages`, which
# Yarn needs to correctly install all dependencies in our workspaces.
# The `--parents` flag is used to preserve parent directories for the sources.
#
# We also need to copy both the `.yarn` directory and the `.yarnrc.yml` file,
# both of which are necessary for Yarn to correctly install dependencies.
#
# Finally, we copy `packages/bind-mount/` since this package contains native
# code that will be built during the install process.
COPY --parents .yarn/ yarn.lock .yarnrc.yml **/package.json packages/bind-mount/ /PrairieLearn/

# Install Node dependencies.
#
# The `node-gyp` stuff is a workaround to a bug where multiple instances of `node-gyp`
# end up running at the same time and corrupt the Node headers that are being written
# to disk. This is somewhat of a known issue with Yarn and `node-gyp` specifically:
#
# https://github.com/nodejs/node-gyp/issues/1054
# https://github.com/yarnpkg/yarn/issues/1874
#
# By running `node-gyp install` at the beginning, we ensure that the later invocations
# of `node-gyp` will find the headers already installed and not try to install them
# again, thus avoiding the corruption issue.
#
# If the following issue is ever addressed, we can use that instead:
# https://github.com/yarnpkg/berry/issues/6339
RUN yarn dlx node-gyp install && yarn install --immutable --inline-builds && yarn cache clean

# NOTE: Modify .dockerignore to allowlist files/directories to copy.
COPY . .

# set up PrairieLearn and run migrations to initialize the DB
# hadolint ignore=SC3009
RUN chmod +x /PrairieLearn/scripts/init.sh \
    && mkdir /course{,{2..9}} \
    && mkdir -p /workspace_{main,host}_zips \
    && mkdir -p /jobs \
    && /PrairieLearn/scripts/start_postgres.sh \
    && make build \
    && node apps/prairielearn/dist/server.js --migrate-and-exit \
    && su postgres -c "createuser -s root" \
    && /PrairieLearn/scripts/start_postgres.sh stop \
    && /PrairieLearn/scripts/gen_ssl.sh \
    && git config --global user.email "dev@example.com" \
    && git config --global user.name "Dev User" \
    && git config --global safe.directory '*'

HEALTHCHECK CMD curl --fail http://localhost:3000/pl/webhooks/ping || exit 1
CMD [ "/PrairieLearn/scripts/init.sh" ]
