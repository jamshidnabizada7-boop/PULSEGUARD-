import { Config } from '@remotion/cli/config';

Config.setBrowserExecutable('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(6);
Config.setChromiumOpenGlRenderer('angle');
Config.setTimeoutInMilliseconds(60000);
