const path = require('path');
const AWS = require('aws-sdk');
const stepFunctionsLocal = require('stepfunctions-local');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
    this.region = this.provider.getRegion();
    this.serverlessLog = serverless.cli.log.bind(serverless.cli);
    this.stepFunctionsLocal = stepFunctionsLocal;

    this.hooks = {
      'offline:start': this.startHandler.bind(this),
      'offline:start:init': this.startHandler.bind(this),
      'offline:start:end': this.endHandler.bind(this),
    };
  }

  async startHandler() {
    await this.yamlParse();

    process.env.AWS_ACCESS_KEY_ID =
      process.env.AWS_ACCESS_KEY_ID ||
      (AWS.config.credentials && AWS.config.credentials.accessKeyId) ||
      'fake';
    process.env.AWS_SECRET_ACCESS_KEY =
      process.env.AWS_SECRET_ACCESS_KEY ||
      (AWS.config.credentials && AWS.config.credentials.secretAccessKey) ||
      'fake';

    this.serverlessHost =
      this.options.host ||
      this.serverless.service.custom['serverless-offline'].host ||
      'localhost';

    this.serverlessPort =
      this.options.port ||
      this.serverless.service.custom['serverless-offline'].port ||
      3000;
    this.startStepFunctionsLocal();
  }

  startStepFunctionsLocal() {
    this.serverlessLog('Starting stepfunctions-local');

    // eslint-disable-next-line prettier/prettier
    const lambdaEndpoint = `http://${this.serverlessHost}:${this.serverlessPort}`;
    this.stepFunctionsLocal.start({
      lambdaEndpoint,
      lambdaRegion: this.region,
      ecsRegion: this.region,
      region: this.region,
      stripLambdaArn: true,
    });
  }

  endHandler() {
    this.serverlessLog('Stopping stepfunctions-local');
    if (this.startServer) {
      this.stepFunctionsLocal.stop();
    }
  }

  yamlParse() {
    const { servicePath } = this.serverless.config;
    if (!servicePath) {
      return Promise.resolve();
    }

    const serverlessYmlPath = path.join(servicePath, 'serverless.yml');
    return this.serverless.yamlParser
      .parse(serverlessYmlPath)
      .then(serverlessFileParam =>
        this.serverless.variables
          .populateObject(serverlessFileParam)
          .then(parsedObject => {
            this.serverless.service.stepFunctions = {};
            this.serverless.service.stepFunctions.stateMachines =
              parsedObject.stepFunctions &&
              parsedObject.stepFunctions.stateMachines
                ? parsedObject.stepFunctions.stateMachines
                : {};
            this.serverless.service.stepFunctions.activities =
              parsedObject.stepFunctions &&
              parsedObject.stepFunctions.activities
                ? parsedObject.stepFunctions.activities
                : [];

            if (!this.serverless.pluginManager.cliOptions.stage) {
              this.serverless.pluginManager.cliOptions.stage =
                this.options.stage ||
                (this.serverless.service.provider &&
                  this.serverless.service.provider.stage) ||
                'dev';
            }

            if (!this.serverless.pluginManager.cliOptions.region) {
              this.serverless.pluginManager.cliOptions.region =
                this.options.region ||
                (this.serverless.service.provider &&
                  this.serverless.service.provider.region) ||
                'us-east-1';
            }

            this.serverless.variables.populateService(
              this.serverless.pluginManager.cliOptions,
            );
            return Promise.resolve();
          }),
      );
  }
}

module.exports = ServerlessPlugin;
