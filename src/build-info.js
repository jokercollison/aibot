import packageInfo from '../package.json' with {type:'json'};
export const VERSION=packageInfo.version;
export const SCOPE=`tts_ai_bot_v${VERSION.replaceAll('.','_')}`;
export const ROBOT_ID=`${SCOPE}:robot`;
export const SOUND_ID=`${SCOPE}.robot.chirp`;
