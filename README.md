# newman-data-iteration
helper app that runs newman as a library and stores the data along with the response code

# Motivation

Newman has support for iterating a collection using a csv or json file. It geenrates a nice report and tells you how many of these requests passed the post-request validations etc. As such, it's an ideal tool for running a batch job of API calls, perhaps a data migration or whatever. unfortunately however, it doesn't have out-of-the-box support for storing the results of the requests, making it difficult to troubleshoot the failing requests. This app helps with that.

# How it works

By running newman ["as a library"](https://github.com/postmanlabs/newman#using-newman-as-a-library) we have full access to the full npm echo-system and can listen to the events generated by newman to write to file etc. which we are not allowed in the Postman runtime environment due to security concerns.

The library iterates a collection using a csv data file and genrates a result file, consisting of the original data, along with an additional (response) code field.

# Config

This app is confirued using the dotenv package. You can modify the configuration in [`dev.env`](./dev.env) file  or overwrite them in terminal

# Initial setup

```bash
npm install
```

# Run

```bash
node index.js
``` 
