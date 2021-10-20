import { LogMessage } from '../logdna';

const SSN = () => ({
  name: 'SSNFilterPlugin',
  hooks: {
    beforeSend: ({ level, message, lineContext }: LogMessage) => {
      if (typeof message === 'string') {
        message = message.replace(/\d{3}-\d{2}-\d{4}/g, 'XXX-XX-XXXX');
      }
      return {
        level,
        message,
        lineContext,
      };
    },
  },
});

export default SSN;
