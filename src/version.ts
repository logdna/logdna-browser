/**
 * Version will get injected post build and pre npm
 */
const version = '{{{INJECT_VERSION}}}';

export const getVersion = () => version;
