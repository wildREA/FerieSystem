#!/bin/bash

# Test script to check the notification API endpoint
echo "Testing notification API endpoint..."

echo "Testing with curl:"
curl -v -H "Accept: application/json" -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt \
  "http://localhost/api/notifications" 2>&1

echo -e "\n\nResponse headers:"
curl -I -H "Accept: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt \
  "http://localhost/api/notifications" 2>&1

echo -e "\n\nDone."
