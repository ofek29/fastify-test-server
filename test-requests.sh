#!/bin/bash

SERVER="http://localhost:3000"
echo "Testing Fastify Valkey integration..."

# Health check
echo "\n--- Health Check ---"
curl -s $SERVER/health | jq

# Basic operations
echo "\n--- Basic SET ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"key":"hello","value":"world"}' $SERVER/basic/set | jq

echo "\n--- Basic GET ---"
curl -s "$SERVER/basic/get?key=hello" | jq

# Namespaced operations
echo "\n--- Namespaced SET (test1) ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"key":"hello","value":"from test1"}' $SERVER/namespaced/test1/set | jq

echo "\n--- Namespaced SET (test2) ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"key":"hello","value":"from test2"}' $SERVER/namespaced/test2/set | jq

echo "\n--- Namespaced GET (test1) ---"
curl -s "$SERVER/namespaced/test1/get?key=hello" | jq

echo "\n--- Namespaced GET (test2) ---"
curl -s "$SERVER/namespaced/test2/get?key=hello" | jq

# Streams
echo "\n--- Stream ADD ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"streamName":"events","field":"event","value":"im a good stream"}' $SERVER/streams/add | jq

echo "\n--- Stream READ ---"
curl -s "$SERVER/streams/read?streamName=events" | jq

# Test all at once
echo "\n--- Testing All Functionality ---"
curl -s $SERVER/test-all | jq

echo "\nAll tests completed!"