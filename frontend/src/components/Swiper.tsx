import React, { useState, Children, useRef } from 'react';
import { ScrollView, FlatList } from 'react-native';
import { View, Box, HStack, Button, Icon, Colors } from 'react-native-native-ui';

interface Props {
    showArrows?: boolean;
    showPagination?: boolean;
    children: React.JSX.Element | React.JSX.Element[];
}

export default function Swiper({ showArrows = false, showPagination = true, children } : Props)
{
    const ref = useRef<any>();
    const [width, setWidth] = useState<number>();
    const [index, setIndex] = useState<number>(0);
    const count = Children.count(children);

    return (
        <View>
            <View style={{ paddingBottom: (showPagination && count > 1) ? 10 : 0 }}>
                <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
                    <ScrollView
                        ref={ref}
                        onScroll={event => { setIndex(Math.round(event.nativeEvent.contentOffset.x / (width))); }}
                        scrollEventThrottle={3}
                        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                    >
                        {width != null && Children.map(children, (child, index) => (
                            <Box key={`view_${index}`} style={{ width, padding: 10 }}>{child}</Box>)
                        )}
                    </ScrollView>
                </View>
                {showArrows && count > 1 && width != null && <HStack style={{ position: 'absolute', width: '100%', height: '100%', justifyContent:'space-between' }} pointerEvents='box-none'>
                    <Button variant='ghost'
                        style={{ borderRadius: 0 }}
                        onPress={()=>{ ref.current.scroll({ x: (index - 1) * width, animated: true }); }}
                        focusable={false}
                        disabled={index == 0}
                    >
                        <Icon name='chevron-left' color='black' />
                    </Button>
                    <Button variant='ghost'
                        style={{ borderRadius: 0 }}
                        onPress={()=>{ ref.current.scrollTo({ x: (index + 1) * width, animated: true }) }}
                        focusable={false}
                        disabled={index == count - 1}
                    >
                        <Icon name='chevron-right' color='black' />
                    </Button>
                </HStack>}
                {showPagination && count > 1 && width != null && <HStack style={{ width: '100%', justifyContent: 'center', zIndex: 1 }}>
                    {Array.from(Array(count).keys()).map(item =>
                        <Button
                            key={`dot_${item}`} variant='link'
                            onPress={()=>ref.current.scrollTo({ x: item * width, animated: true })}
                            style={{
                                width: 8, height: 8, borderRadius: 8,
                                backgroundColor: `${Colors.dark}${item == index ? 'FF' : '75'}`,
                            }}
                        />
                    )}
                </HStack>}
            </View>
        </View>
    )
}