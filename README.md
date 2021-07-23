# newman-data-iteration
helper app that runs newman as a library and stores the data along with the response code

# Table of contents

- [Motivation](#motivation)
- [How it works](#how-it-works)
- [Config](#config)
- [Initial Setup](#initial-setup)
- [Run](#run)
- [Example](#example)

# Motivation

Newman has support for iterating a collection using a csv or json file. It geenrates a nice report and tells you how many of these requests passed the post-request validations etc. As such, it's an ideal tool for running a batch job of API calls, perhaps a data migration or whatever. 

Unfortunately however, it doesn't have out-of-the-box support for storing the results of the requests, making it difficult to troubleshoot and keep track of the failing requests. This app helps with that.

# How it works

By running newman ["as a library"](https://github.com/postmanlabs/newman#using-newman-as-a-library):

  ```javascript
  newman.run(
    {
        collection: process.env.COLLECTION_PATH,
        reporters: 'cli',
        iterationData: process.env.DATA_PATH,
        delayRequest: process.env.DELAY_REQUEST,
        environment: process.env.ENV_PATH,
        envVar: [overrideEnvs]
    }
  )
  ```

we have full access to the full npm echosystem and can listen to the events generated by newman to write to file etc. This is not something we are not allowed to do in the Postman runtime environment due to security concerns.

The library iterates a collection using a csv data file and genrates a result file, consisting of the original data, along with an additional (response) code field.

# Config

This app is configured using the [dotenv package](https://www.npmjs.com/package/dotenv). You can modify the configuration in [`.env`](./.env) file  or overwrite them in terminal.

# Initial setup

```bash
npm install
```

# Run

```bash
node index.js
``` 

# Example

Taking the [sample data file](sample-data/data.csv) as an example:

## Input

| user_id |offer_id|start|expiry|redeemedat|  |
|--|--|--|--|--|--|
|48690a62-15da-4bc6-8989-f50764e6c6da|8208ae66-1bee-45f0-82ef-4eb60e2980cd|2021-05-08 14:44:33+00|2021-08-08 14:44:33+00|2021-05-07 16:29:07.390578+00| |
|3acd122f-993e-408d-b0bc-d06c91dd7aa3|8208ae66-1bee-45f0-82ef-4eb60e2980cd|2021-05-17 09:36:06+00|2021-08-17 09:36:06+00|2021-05-10 09:36:28.670383+00| |

## Output

| user_id |offer_id|start|expiry|redeemedat|code|
|--|--|--|--|--|--|
|48690a62-15da-4bc6-8989-f50764e6c6da|8208ae66-1bee-45f0-82ef-4eb60e2980cd|2021-05-08 14:44:33+00|2021-08-08 14:44:33+00|2021-05-07 16:29:07.390578+00|200|
|3acd122f-993e-408d-b0bc-d06c91dd7aa3|8208ae66-1bee-45f0-82ef-4eb60e2980cd|2021-05-17 09:36:06+00|2021-08-17 09:36:06+00|2021-05-10 09:36:28.670383+00|200|

## Report

![Screen Shot 2021-07-23 at 08 11 03](https://user-images.githubusercontent.com/13497500/126748545-d12fa028-8426-4370-9a1d-2c859ff0976c.png)
