---
path: paths./anotherone.get
summary: GET to /anotherone
operationId: getRequest
parameters: 
  - name: limit
    in: query
    description: How many items to return at one time (max 100)
    required: false
    schema:
      type: integer
      format: int32
responses: {}
x-codeSamples: []
---

Here's another method to demonstrate how it may be simpler to break out large schemas into smaller parts.