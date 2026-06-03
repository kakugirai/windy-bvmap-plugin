import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-gsi-bvmap',
    version: '0.1.0',
    icon: '🗾',
    title: '地理院淡色地図レイヤー',
    description: '国土地理院の淡色地図をレイヤーとして表示します。',
    author: 'kakugirai',
    repository: 'https://github.com/kakugirai/windy-bvmap-plugin',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/gsi-bvmap',
    private: false,
};

export default config;
