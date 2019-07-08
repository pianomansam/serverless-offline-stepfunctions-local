# serverless-offline-stepfunctions-local


## Overview

This [Serverless Offline](https://www.npmjs.com/package/serverless-offline) plugin starts a local AWS Step Functions emulator with [stepfunctions-local](https://www.npmjs.com/package/stepfunctions-local). It is meant to be used with [serverless-offline-stepfunctions](https://github.com/pianomansam/serverless-offline-stepfunctions), which creates creates state machines from [serverless-step-functions](https://www.npmjs.com/package/serverless-step-functions) definitions in `serverless.yml`. 



## Installation
```
npm install serverless-offline-stepfunctions-local
```
OR
```
yarn add serverless-offline-stepfunctions-local
```

## Usage

Enable this plugin by editing your `serverless.yml` file and placing an `serverless-offline-stepfunctions-local` entry in the plugins section, **placed above the `serverless-offline-stepfunctions` and `serverless-offline` plugins.**


## Example

serverless.yml:
```yaml
plugins:
  - serverless-step-functions
  - serverless-offline-stepfunctions-local
  - serverless-offline-stepfunctions
  - serverless-offline
```