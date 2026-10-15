FROM prairielearn/workspace-jupyterlab-base:latest
ARG CACHEBUST=2026-10-15-14-18-57

USER root
COPY install.sh requirements.txt /
RUN /bin/bash /install.sh

USER jovyan
