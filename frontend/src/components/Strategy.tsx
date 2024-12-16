import React, { useState } from "react";
import { View, Box, Text, Card, Colors, VStack, Divider, ScrollView, Input, Button, OverlaySpinner, Image, HStack, Icon } from 'react-native-native-ui';
import Markdown from 'react-native-markdown-display';
import moment from 'moment';
import { useSessionAPI } from "../api/ApiHooks";
import StrategyImage from '../assets/strategy.png';

export default function StrategyScreen() {

    const { session } = useSessionAPI();

    if (!session)
        return <OverlaySpinner />;

    return (
        <ScrollView>
        <View style={{ maxWidth: 1000, gap: 20 }}>

            <Card>
				<VStack>
					<View>
						<Text variant="heading">Customer Info</Text>
						<Divider />
					</View>
					{session?.customerInfo && <View>
						<HStack>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Name</Text>
								<Text variant="key">{session.customerInfo.name}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Phone</Text>
								<Text variant="key">{session.customerInfo.phone}</Text>
							</View>
						</HStack>
						<HStack>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Current Address</Text>
								<Text variant="key">{session.customerInfo.current_address}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Destination</Text>
								<Text variant="key">{session.customerInfo.destination_address}</Text>
							</View>
						</HStack>
						<HStack>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Move Out Date</Text>
								<Text variant="key">{moment(session.customerInfo.move_out_date).format("DD MMM YYYY")}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Move In Date</Text>
								<Text variant="key">{moment(session.customerInfo.move_in_date).format("DD MMM YYYY")}</Text>
							</View>
						</HStack>
						<HStack>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Apartment Size</Text>
								<Text variant="key">{session.customerInfo.apartment_size}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Inventory</Text>
								<Text variant="key">{session.customerInfo.inventory.join(', ')}</Text>
							</View>
						</HStack>
						<HStack>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Packing Assistance</Text>
								<Text variant="key">{session.customerInfo.packing_assistance ? "Required": "Not Required"}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text variant="subtitle">Special Items</Text>
								<Text variant="key">{session.customerInfo.special_items || 'None'}</Text>
							</View>
						</HStack>
					</View>}
				</VStack>
			</Card>

            {session.movers?.length >= 0 && <VStack>
            <Card>
                <View>
                    <Text variant="heading">Best Movers</Text>
                    <Divider />
                </View>
                {/* <Text>These are the list of movers that aptly fit and we believe are best the for you based on your needs</Text> */}
                <Markdown>{session.moverRationale}</Markdown>
            </Card>
            <HStack style={{ flexWrap: 'wrap', gap: 20 }}>
                {session.movers?.map((mover: any, index) => (
                    <Card style={{ flex: 1, maxWidth: 400 }}>
                        <View>
                            <Text variant="key">{mover.name}</Text>
                            <Text variant="subtitle">{mover.phone}</Text>
                            <Icon name="truck" size={80} />
                            <Text variant="key">Specialties</Text>
                            {mover.specialties.split(',').map((specialty: string) => <Text>{specialty}</Text>)}
                        </View>
                    </Card>
                ))}
            </HStack>
            </VStack>}

            <Card>
                <VStack>
                    <Text style={{  }} variant="heading">Current Strategy</Text>
                    <Divider style={{ marginBottom: 20 }} />
                    <Image source={StrategyImage} style={{ width: '100%', height: 200, resizeMode: 'contain' }} />
                    <Markdown>{session.strategy}</Markdown>
                </VStack>
                {!session.strategy && <OverlaySpinner message="Cooking up a strategy..." />}
            </Card>

        </View>
        </ScrollView>
    );
}
