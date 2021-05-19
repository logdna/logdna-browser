export class InvalidConsoleIntegrationError extends Error {
  constructor() {
    super(`LogDNA Browser Logger console integration types must be an array`);
  }
}

export class InvalidConsoleMethodError extends Error {
  constructor() {
    super(
      `LogDNA Browser Logger console plugin was passed an invalid console methods`,
    );
  }
}

export class UndefinedIngestionKeyError extends Error {
  constructor() {
    super(`Ingestion key can not be undefined when calling init`);
  }
}

export class InvalidHostnameError extends Error {
  constructor(public readonly hostname: string) {
    super(
      `LogDNA Browser Logger: \`${hostname}\` is not a valid hostname, see documentation for the \`hostname\` configuration option for details.`,
    );
  }
}

export class InvalidSampleRateError extends Error {
  constructor() {
    super(
      `LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`,
    );
  }
}

export class DuplicatePluginMethodError extends Error {
  constructor() {
    super(
      'A LogDNA Browser Logger plugin is attempting to register a method that already exists.',
    );
  }
}

export class MissingPluginNameError extends Error {
  constructor() {
    super(`A LogDNA Browser Logger plugin must contain a name property`);
  }
}

export class MissingPluginInitError extends Error {
  constructor() {
    super(`A LogDNA Browser Logger plugin must contain an init function`);
  }
}

export class DuplicatePluginRegistrationError extends Error {
  constructor(public readonly pluginName: string) {
    super(`The plugin ${pluginName} is already registered with LogDNA Browser`);
  }
}

export class PrematureLogLineError extends Error {
  constructor() {
    super(
      `LogDNA Browser Logger: Attempting send to log lines before calling "init()"`,
    );
  }
}
