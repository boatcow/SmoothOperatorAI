import React, { useEffect, useRef, useState } from "react";
import { View, Colors } from 'react-native-native-ui';
import { useSessionAPI } from "../api/ApiHooks";

import Carousel, { CarouselRef } from "../components/Carousel";
import Chat from "../components/Chat";
import Strategy from "../components/Strategy";
import Calling from "../components/Calling";

export default function Dashboard()
{
	const { session } = useSessionAPI();

	const [activeSlide, setActiveSlide] = useState(0);
	const carouselRef = useRef<CarouselRef>();
	const screens = ['chat', 'strategy', 'call', 'recommendation'];
	const renderItem = ({ item, index }: { item: string; index: number }): React.JSX.Element =>
	{
		switch (item) {
			case 'chat':
				return <Chat />;
			case 'strategy':
				return <Strategy />;
			case 'call':
				return <Calling />;
		}
	}

	useEffect(()=> {
		if (!carouselRef.current || !session)
			return;

		switch (session.status) {
			case 'info_collection':
				carouselRef.current.moveToSlide(0);
				break;
			case 'strategizing':
				carouselRef.current.moveToSlide(1);
				break;
			case 'negotiating':
			case 'completed':
				carouselRef.current.moveToSlide(2);
				break;
			default:
				break;
		}
	}, [session?.status]);

	return (
		<View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
			<Carousel
				ref={carouselRef}
				screens={screens}
				renderItem={renderItem} onMoveToSlide={setActiveSlide}
			/>
		</View>
	);
}