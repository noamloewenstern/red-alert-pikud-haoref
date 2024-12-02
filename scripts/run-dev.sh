#!/usr/bin/env bash

docker compose -f deploy/cloud/docker-compose.dev.yaml --env-file deploy/cloud/.env.dev.local up
