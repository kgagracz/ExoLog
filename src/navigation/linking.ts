import { LinkingOptions } from '@react-navigation/native';

const linking: LinkingOptions<any> = {
    prefixes: ['exolog://'],
    config: {
        screens: {
            Main: {
                screens: {
                    Community: {
                        screens: {
                            UserProfile: 'profile/:userId',
                        },
                    },
                },
            },
        },
    },
};

export default linking;
