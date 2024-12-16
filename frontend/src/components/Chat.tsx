import React, { useState } from "react";
import { View, Box, Text, Card, Colors, VStack, Divider, ScrollView, Input, Button, Image, HStack } from 'react-native-native-ui';
import Markdown from 'react-native-markdown-display';
import { useChatAPI, useSessionAPI } from "../api/ApiHooks";
import CollectionImage from '../assets/collection.png';

function MessageBox({ isIncoming = false, message = 'Test message', showAvatar = false })
{
	return (
		<View
			style={{ alignItems: isIncoming ? 'flex-start' : 'flex-end' }}
		>
			<Box style={{ maxWidth: '80%',
				backgroundColor: isIncoming ? Colors.background : Colors.primary,
				padding: 10, borderRadius: 15 }}
			>
				{!isIncoming && <Text style={{ color: isIncoming ? Colors.black : Colors.white }}>{message}</Text>}
				{isIncoming && <Markdown>{message}</Markdown>}
			</Box>
			{showAvatar && <Box style={{ position: 'absolute',
				...(isIncoming ? { left: -15 } : { right: -15 }),
				bottom: -20,
				// top: -20,
				backgroundColor: isIncoming ? Colors.dark : Colors.white,
				borderRadius: 15, width: 30, height: 30, alignItems: 'center', justifyContent: 'center'
			}}>
				<Text style={{ color: Colors.white }}>{isIncoming ? 'AI' : 'You' }</Text>
			</Box>}
		</View>
	)
}

export default function ChatScreen() {

	const [prompt, setPrompt] = useState('');
	const { messages, addMessage } = useChatAPI();
	const { session } = useSessionAPI();

	return (
        <ScrollView>
        <View style={{ maxWidth: 1000 }}>

			<Card>
				<VStack>
					<Text style={{  }} variant="heading">Smooth Operator</Text>
					<Divider style={{ marginBottom: 20 }} />
					<Image source={CollectionImage} style={{ width: '100%', height: 200, resizeMode: 'contain' }} />
					{messages.length <= 1 && <View style={{ alignItems: 'center'}}>
						<Text style={{ fontSize: 14, padding: 20, maxWidth: 800, lineHeight: 20 }}>
							Hi, this is Smooth Operator your one stop shop for all negotiations. We here at Eyecognito know how
							painful negotiations can be and we are here to help you get the best deal possible so that you're not leaving
							any money on the table unnecessarily. We've built a multi stage pipelined negotiation process using AI Agents
							that communicate to various businesses and find you the best deal that suits your specific needs.
						</Text>
					</View>}
					<MessageBox isIncoming={true}
						message="Hi, I'm Smooth Operator. Your AI negotiation expert. Let's start by answering some questions about your move."
						// please provide you're current zip code and the zip code you're looking to move to along with your timelines.
						// Followed by that please provide the size of your apartment, number of rooms and the large furniture you have.
						showAvatar={messages.length == 0}
					/>
					{messages.map((message, index) => (
						<MessageBox key={index}
							isIncoming={message.role == 'assistant'} message={message.content}
							showAvatar={message.role == 'assistant' && index >= messages.length - 2}
						/>
					))}
					<Divider />
					<Input placeholder="Tell us what you're looking for" value={prompt} onChangeText={setPrompt} />
					<Button title="Submit" onPress={() => { addMessage(prompt); setPrompt(''); }} />
				</VStack>
			</Card>

        </View>
        </ScrollView>
	)
}