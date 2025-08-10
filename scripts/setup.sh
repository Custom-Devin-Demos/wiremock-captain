#!/bin/bash

set -e

echo "Setting up WireMock integration testing infrastructure..."

mkdir -p "$PWD"/extensions

if [ ! -f "$PWD"/extensions/wiremock-webhooks-extension-2.31.0.jar ]; then
    echo "Downloading WireMock webhook extension..."
    curl -H "Accept: application/zip" https://repo1.maven.org/maven2/org/wiremock/wiremock-webhooks-extension/2.31.0/wiremock-webhooks-extension-2.31.0.jar -o "$PWD"/extensions/wiremock-webhooks-extension-2.31.0.jar
fi

docker stop wiremock-container 2>/dev/null || true
docker rm wiremock-container 2>/dev/null || true

echo "Starting WireMock container..."
docker run -itd --rm --name wiremock-container -p 8080:8080 --add-host host.docker.internal:host-gateway -v "$PWD"/extensions:/var/wiremock/extensions wiremock/wiremock:3.9.1 --record-mappings --verbose --extensions org.wiremock.webhooks.Webhooks

echo "Waiting for WireMock to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/__admin/health > /dev/null 2>&1; then
        echo "WireMock is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: WireMock failed to start within 30 seconds"
        docker logs wiremock-container
        exit 1
    fi
    sleep 1
done

docker ps --filter "name=wiremock-container"
echo "WireMock setup complete!"
