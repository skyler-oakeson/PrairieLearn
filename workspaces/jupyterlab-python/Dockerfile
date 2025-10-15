FROM prairielearn/workspace-jupyterlab-base:latest
ARG CACHEBUST=2025-10-15-14-27-10

USER root
COPY install.sh requirements.txt /
RUN /bin/bash /install.sh

USER jovyan
