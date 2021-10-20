import { LogDNAMethods } from './LogDNAMethods';

import { init, config, methods } from './init';
import plugins from './plugins';
import { addContext } from './context-manager';
import { setSessionId } from './session-manager';

LogDNAMethods.prototype.init = init;
LogDNAMethods.prototype.config = config;
LogDNAMethods.prototype.addContext = addContext;
LogDNAMethods.prototype.setSessionId = setSessionId;
LogDNAMethods.prototype.plugins = plugins;

export default methods;
