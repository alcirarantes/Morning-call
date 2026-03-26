{
  "crons": [
    {
      "path": "/api/generate",
      "schedule": "0 10 * * 1-5"
    },
    {
      "path": "/api/generate",
      "schedule": "0 17 * * 1-5"
    }
  ],
  "functions": {
    "api/generate.js": {
      "maxDuration": 60
    }
  }
}
