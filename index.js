const stepFunctionsLocal = require('stepfunctions-local');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
    this.region = this.provider.getRegion();
    this.serverlessHost = this.options.host || 'localhost';
    this.serverlessPort = this.options.port || 3000;
    this.serverlessLog = serverless.cli.log.bind(serverless.cli);
    this.stepFunctionsLocal = stepFunctionsLocal;

    this.hooks = {
      'offline:start': this.startHandler.bind(this),
      'offline:start:init': this.startHandler.bind(this),
      'offline:start:end': this.endHandler.bind(this),
    };
  }

  async startHandler() {
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
}

module.exports = ServerlessPlugin;
