FROM node:24-bookworm
ARG CACHEBUST=2025-07-15-14-16-18

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends emacs-nox vim tmux \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY src /xterm

WORKDIR /xterm
RUN yarn install --frozen-lockfile && yarn cache clean

RUN useradd -m student
ENTRYPOINT ["node", "server.js", "-w", "/home/student"]
