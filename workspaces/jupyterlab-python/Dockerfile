FROM prairielearn/workspace-jupyterlab-base:latest
ARG CACHEBUST=2026-03-15-14-15-03

USER root
COPY install.sh requirements.txt /
RUN /bin/bash /install.sh

USER jovyan
