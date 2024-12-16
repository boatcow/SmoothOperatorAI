import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { VStack, Button, Icon, Divider, Text, Box, HStack, View, Image, Colors } from 'react-native-native-ui';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

import { version } from '../../package.json';
import { auth } from '../FirebaseConfig';
import axios from 'axios';

interface Props extends DrawerContentComponentProps {
    title?: string;
    routes: IRoute[];
}

export default function Drawer({ state, navigation, routes } : Props) {

    const user = auth().currentUser;
    const paddingSettings = Platform.OS == 'web' ? { paddingTop: 20, paddingBottom: 10 } : { paddingTop: 50, paddingBottom: 25 };

    return (
        <View style={{ flex: 1,  backgroundColor: 'white', ...paddingSettings, width: '100%' }}>
            <HStack space={0} style={{ padding: 5 }}>
                {/* <Image source={Logo} size={40} /> */}
                <Text variant='heading' style={{ padding: 5, fontSize: 20 }}>Smooth Operator</Text>
            </HStack>
            <View style={{ paddingHorizontal: 5 }}><Divider /></View>
            <VStack space={5} style={{ flex: 1, marginTop: 5 }}>
                {routes.map(route =>
                    <Button key={route.key}
                        disableShadow={true}
                        onPress={()=>navigation.navigate(route.key)}
                        color={state.routes[state.index].name == route.key ? 'primary' : 'white'}
                        style={{ borderRadius: 0 }}
                        leftElement={
                            <Icon name={route.icon}
                                color={state.routes[state.index].name == route.key ? Colors.white : Colors.primary}
                                size={20}
                            />
                        }
                    >
                        <Text style={{ flex: 1, fontSize: 13, color: state.routes[state.index].name == route.key ? Colors.white : Colors.dark }}>
                            {route.title || route.key}
                        </Text>
                    </Button>
                )}
            </VStack>

            <Text style={{ textAlign: 'right', marginHorizontal: 5 }}>v{version}</Text>
            {/* {isOlder && <Text style={{ textAlign: 'right', marginHorizontal: 5 }}>Please update to the latest version</Text>} */}
            <>
                <Box style={{ paddingHorizontal: 5 }}>
                    <Divider/>
                </Box>
                <VStack style={{ marginBottom: 5 }}>
                    <Button
                        variant='ghost'
                        style={{ marginHorizontal: 5 }}
                        leftElement={<Icon size={20} name='redo' color={Colors.dark} />}
                        onPress={() => { axios.get(`${BASE_URL}/api/chat/new`); navigation.closeDrawer(); }}
                    >
                        <Text style={{ color: Colors.dark, flex: 1 }}>New Quote</Text>
                    </Button>
                    {user && <Button
                        onPress={() => { auth().signOut(); navigation.closeDrawer(); }}
                        variant='ghost'
                        style={{ marginHorizontal: 5 }}
                        leftElement={<Icon size={20} name='exit-to-app' color={Colors.dark} />}
                    >
                        <Text style={{ color: Colors.dark, flex: 1 }}>Logout</Text>
                    </Button>}
                    {!user && <Button
                        onPress={() => { navigation.navigate('Login'); navigation.closeDrawer(); }}
                        variant='ghost'
                        style={{ borderRadius: 0, marginHorizontal: 5 }}
                        leftElement={<Icon size={20} name='login-variant' color={Colors.dark} />}
                    >
                        <Text style={{ color: Colors.grey, flex: 1 }}>Login</Text>
                    </Button>}
                </VStack>
            </>
        </View>
    )
}