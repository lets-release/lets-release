/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export default {
  verifyConditions: ({ env, logger }) => {
    // eslint-disable-next-line no-undef
    console.log(`Console: Exposing token ${env.MY_TOKEN}`);
    logger.log(`Log: Exposing token ${env.MY_TOKEN}`);
    logger.error(`Error: Console token ${env.MY_TOKEN}`);
    throw new Error(`Throw error: Exposing token ${env.MY_TOKEN}`);
  },
};
