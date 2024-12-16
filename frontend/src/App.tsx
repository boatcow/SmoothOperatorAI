import React, { useEffect, useRef, useState } from "react";
import { View, Colors, OverlaySpinner } from 'react-native-native-ui';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { auth } from './FirebaseConfig';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import DrawerComponent from "./components/Drawer";
import Header from "./components/Header";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";
import axios from "axios";

const queryClient = new QueryClient();

const Drawer = createDrawerNavigator<NavigationParams>();

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: ['http://localhost:8081/', 'https://smooth-operator.web.app/'],
    config: {
        screens: {
            Login: { path: '/login', exact: true },
			App: { path: '/app', exact: true },
        },
    },
}

export default function App()
{
	const [user, setUser] = useState<FirebaseAuthTypes.User>();

	const routes: IRoute[] = user ? [
		{ key: 'Dashboard', title: 'Dashboard', icon: 'view-dashboard' },
	] : [];

	useEffect(() => {
		const authUnsubscribe = auth().onAuthStateChanged(user => {
			setUser(user);
		});

		const idTokenUnsubscribe = auth().onIdTokenChanged(async user => {
			if (user)
			{
				const token = await user.getIdTokenResult();
				axios.defaults.headers.common['Authorization'] = `Bearer ${token.token}`;
			}
			else
			{
				axios.defaults.headers.common['Authorization'] = null;
			}
		});

		return () => {
			authUnsubscribe();
			idTokenUnsubscribe();
		}
	}, []);

	if (user === undefined) {
		return <OverlaySpinner message='Loading...' />;
	}

	return (
		<QueryClientProvider client={queryClient}>
		<NavigationContainer linking={linking}>
			<Drawer.Navigator
				drawerContent={props => <DrawerComponent routes={routes} {...props} />}
				screenOptions={{
					header: props => <Header {...props} routes={routes} />,
					headerShown: true,
					// sceneContainerStyle: { backgroundColor: 'transparent' },
                    // headerStyle: { backgroundColor: 'transparent' },
				}}
				backBehavior='history'
			>
				{!user && <Drawer.Group>
					<Drawer.Screen name="Login" component={Login} />
				</Drawer.Group>}
				{user &&  <Drawer.Group>
					<Drawer.Screen name="Dashboard" component={Dashboard} />
				</Drawer.Group>}
			</Drawer.Navigator>
		</NavigationContainer>
		</QueryClientProvider>
	);
}