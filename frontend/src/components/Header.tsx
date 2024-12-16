import React from "react";
import { HStack, Text, Box, View, Colors, IconButton } from "react-native-native-ui";
import { useRoute } from "@react-navigation/native";
import { Platform, SafeAreaView } from "react-native";
import { DrawerHeaderProps, DrawerNavigationOptions } from "@react-navigation/drawer";

interface Options extends DrawerNavigationOptions {
    backButton?(): void;
    extraAction?: React.JSX.Element;
}

interface Props extends DrawerHeaderProps {
    routes: IRoute[];
    options: Options;
}

export default function Header({ navigation, options, routes }: Props)
{
	const route = useRoute();

    const mainRoutes = routes.map(r => r.key);
	const isMainRoute = [...mainRoutes, 'Login'].includes(route.name);

    const title = options.title || route.name;

    const headerStyle = (options.headerStyle as any);
    return (
        <Box style={{ backgroundColor: headerStyle?.backgroundColor || Colors.white }}>
            <SafeAreaView>
            <HStack style={{ height: 50 }}>
                <HStack style={{ flex: 1 }}>
                    <View style={{ width: 50 }}>
                        {isMainRoute && <IconButton name='menu' color='black' onPress={()=>navigation.toggleDrawer()} />}
                        {(!isMainRoute || options.backButton) && <IconButton
                            name="arrow-left" color='black'
                            onPress={()=> {
                                if (options.backButton)
                                {
                                    options.backButton();
                                    return;
                                }

                                if (navigation.canGoBack())
                                    navigation.goBack();
                                else
                                    navigation.navigate('Dashboard');
                            }}
                        />}
                    </View>
                    <Text variant='heading' style={{ flex: 1, textAlign: 'center' }}>{title}</Text>
                    <View style={{ width: 50 }}>
                        {options.extraAction}
                    </View>
                </HStack>


                {/* {Platform.OS == 'web' && user == null && route.name != 'Login' && <Button variant='link'
                    leftElement={<Icon name='login-variant' />}
                    onPress={()=>navigation.navigate('Login')}
                >
                    <Text>Login</Text>
                </Button>} */}
                {Platform.OS == 'web' && <IconButton style={{ position: 'absolute', right: 10 }} name='refresh' onPress={()=>{ window.location.reload() }} />}

            </HStack>
            </SafeAreaView>
        </Box>
	);
}