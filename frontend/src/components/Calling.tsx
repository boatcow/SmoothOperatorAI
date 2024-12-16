import React, { useState } from "react";
import { View, Box, Text, Card, Colors, VStack, Divider, ScrollView, Input, Button, OverlaySpinner, Image, HStack, Icon } from 'react-native-native-ui';
import Markdown from 'react-native-markdown-display';
import { useSessionAPI } from "../api/ApiHooks";
import CallingImage from '../assets/calling.png';
import axios from "axios";
import Swiper from "./Swiper";

export default function CallingScreen() {

    const { session } = useSessionAPI();

    if (!session)
        return <OverlaySpinner />;

    return (
        <ScrollView>
        <View style={{ maxWidth: 1000, gap: 20 }}>

            {session.status == 'completed' && <Card>
                <HStack style={{ flexWrap: 'wrap' }}>
                    <Image source={CallingImage} style={{ height: 200, width: '100%', maxWidth: 200, resizeMode: 'contain' }} />
                    <View style={{ flex: 1 }} >
                        <Text variant="heading">Recommendation</Text>
                        <Divider />
                        <Markdown>{session.recommendation}</Markdown>
                    </View>
                </HStack>
            </Card>}

            <Card>
                <View>
                    <Text variant="heading">Current Strategy</Text>
                    <Divider />
                </View>
                <Swiper>
                    {session.strategies?.map((strategy, index) => <View>
                        <Markdown key={index}>{strategy}</Markdown>
                    </View>)}
                </Swiper>
            </Card>

            {session.status == 'negotiating' && <View>
                <Text variant="heading">Ongoing Negotiations</Text>
                <Divider />
                <View style={{ alignItems: 'center'}}>
                    <Image source={CallingImage} style={{ height: 200, width: '100%', maxWidth: 400, resizeMode: 'contain' }} />
                    <Text>Performing calls</Text>
                </View>
            </View>}

            {/* {session.callSummaries?.length == 0 && <></> */}
            <HStack style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                {session.callSummaries && session.movers.map((mover, index) => (
                    <Card style={{ flex: 1, maxWidth: 400, minHeight: 300 }}>
                        <VStack>
                            <HStack>
                                <Icon name="phone" />
                                <View style={{ flex: 1 }} >
                                    <Text style={{ flex: 1 }} variant="key">{mover.name}</Text>
                                    <Text style={{ flex: 1 }} variant="subtitle">{mover.phone}</Text>
                                </View>
                            </HStack>
                            <Divider />
                            {session.callSummaries[index] && <Markdown>{session.callSummaries[index]}</Markdown>}
                            {session.callSummaries.length < index && <Text>
                                We will call and negotiate with {mover.name} once the previous call is done.
                            </Text>}
                        </VStack>
                        {session.callSummaries.length == index && <OverlaySpinner message={`Calling ${mover.name}...`} />}
                    </Card>
                ))}
            </HStack>

            {session.status == 'completed' && <View>
                <Button onPress={() => { axios.get(`${BASE_URL}/api/chat/new`); }}>Start a new Quote</Button>
            </View>}

        </View>
        </ScrollView>
    );
}
