import React, { useImperativeHandle, useState, useRef, useEffect } from 'react';
import { View, HStack, Button, Colors } from 'react-native-native-ui';
import * as Animatable from 'react-native-animatable';

interface Props {
    screens: string[];
    renderItem({ item, index }: { item: string; index: number }): React.JSX.Element;
    onMoveToSlide?(activeSlide: number): void;
}

export interface CarouselRef {
    nextSlide(): void;
    prevSlide(): void;
    moveToSlide(index: number): void;
}

export default React.forwardRef<CarouselRef, Props>(function Carousel({ onMoveToSlide, screens, renderItem }: Props, ref: React.ForwardedRef<CarouselRef>)
{
    const [activeSlide, setActiveSlide] = useState(0);
    const [animation, setAnimation] = useState('fadeIn');
    const carouselRef = useRef(null);

    const nextSlide = () => {
        setActiveSlide(Math.min(activeSlide + 1, screens.length));
        setAnimation('fadeInRight');
        //carouselRef.current.goToNext();
    }
    const prevSlide = () => {
        setActiveSlide(Math.max(activeSlide - 1, 0));
        setAnimation('fadeInLeft');
        //carouselRef.current.goToPrev();
    }
    const moveToSlide = (index: number) => {
        index = Math.max(Math.min(index, screens.length), 0);
        setActiveSlide(index);
        setAnimation(activeSlide > index ? 'fadeInLeft' : 'fadeInRight');
        //carouselRef.current.goTo(index);
    }

    useEffect(() => {
        if (onMoveToSlide)
            onMoveToSlide(activeSlide);
    }, [activeSlide])

    useImperativeHandle(ref, () => ({ nextSlide, prevSlide, moveToSlide }));

    return (
        <View style={{ flex: 1 }}>
            <Animatable.View ref={carouselRef} animation={animation} style={{ flex: 1 }} key={`Slide${activeSlide}`}>
                {renderItem({ item: screens[activeSlide], index: activeSlide })}
            </Animatable.View>
            <HStack style={{ width: '100%', justifyContent: 'center', zIndex: 1 }}>
                {Array.from(Array(screens.length - 1).keys()).map(item =>
                    <Button
                        key={`dot_${item}`} variant='link'
                        onPress={()=>moveToSlide(item)}
                        style={{
                            width: 8, height: 8, borderRadius: 8,
                            backgroundColor: `${Colors.dark}${item == activeSlide ? 'FF' : '75'}`,
                        }}
                    />
                )}
            </HStack>
        </View>
    )
})