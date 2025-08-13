import * as line from '@line/bot-sdk';

const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export const lineConfig = {
  channelAccessToken: lineChannelAccessToken || '',
  channelSecret: lineChannelSecret || '',
};

export const lineClient = (lineChannelSecret && lineChannelAccessToken)
  ? new line.Client(lineConfig)
  : null;

export const isLineConfigured = !!(lineChannelSecret && lineChannelAccessToken);
