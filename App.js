/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import ScaleUtility from './ScaleUtility';

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Animated,
  PanResponder,
  Easing
} from 'react-native';

const tabbarHeight = ScaleUtility.getSize(60);
const playingbarInitialNonOverlappingDistance = ScaleUtility.getSize(70);

const springAnimationTension = 50;
const springAnimationFriction = 15;

const musicNoteNormalXOffset = ScaleUtility.getSize(0);
const musicNoteScaledXOffset = ScaleUtility.getSize(33);
const musicNoteNormalYOffset = ScaleUtility.getSize(0);
const musicNoteScaledYOffset = ScaleUtility.getSize(20);

const musicNoteNormalScale = 1;
const musicNoteScaledScale = 5;

const musicNoteNoteWidth = ScaleUtility.getSize(50);
const musicNoteContainerVerticalPadding = ScaleUtility.getSize(10);
const musicNoteContainerHorizontalPadding = ScaleUtility.getSize(15);

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const playingbarHeight = windowHeight;
const playingbarMovingDistance =
  windowHeight -
  tabbarHeight -
  playingbarInitialNonOverlappingDistance -
  ScaleUtility.getSize(40);
const movingRate = tabbarHeight / playingbarMovingDistance;
const panResponderYMinValue = -playingbarMovingDistance;
const panResponderYMaxValue = 0;

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    console.log('windowWidth', windowWidth);
    super(props);
    this.state = {
      panResponderY: new Animated.Value(0),
      tabbarY: new Animated.Value(0)
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        console.log('onPanResponderGrant');
        const { _value, _offset } = this.state.panResponderY;
        this.state.panResponderY.setOffset(_value + _offset);
        this.state.panResponderY.setValue(0);
      },

      onPanResponderMove: (event, state) => {
        const expectedValue = state.dy + this.state.panResponderY._offset;
        if (
          expectedValue > panResponderYMaxValue ||
          expectedValue < panResponderYMinValue
        ) {
          return null;
        }

        return Animated.event([
          null,
          {
            dy: this.state.panResponderY
          }
        ])(event, state);
      },

      onPanResponderEnd: (event, state) => {
        let targetValue;
        if (state.vy > 0) {
          targetValue = panResponderYMaxValue;
        } else if (state.vy < 0) {
          targetValue = panResponderYMinValue;
        } else {
          if (this._expanded) {
            targetValue = panResponderYMaxValue;
          } else {
            targetValue = panResponderYMinValue;
          }
        }

        const { _value, _offset } = this.state.panResponderY;
        this.state.panResponderY.setOffset(0);
        this.state.panResponderY.setValue(_value + _offset);

        Animated.spring(this.state.panResponderY, {
          toValue: targetValue,
          tension: springAnimationTension,
          friction: springAnimationFriction
        }).start(({ finished }) => {
          if (finished) {
            this._expanded = !this._expanded;
          }
        });
      }
    });

    this._expanded = false;
  }

  split(minValue: number, maxValue: number) {
    const difference = maxValue - minValue;
    const slowSplittingRatios = [0, 0.4, 0.7, 0.9, 1.0];
    const slowResult = [];
    const fastSplittingRatios = [0, 0.1, 0.3, 0.6, 1.0];
    const fastResult = [];
    for (let i = 0; i < fastSplittingRatios.length; i++) {
      fastResult.push(minValue + fastSplittingRatios[i] * difference);
    }
    for (let i = 0; i < slowSplittingRatios.length; i++) {
      slowResult.push(minValue + slowSplittingRatios[i] * difference);
    }
    return { fastResult, slowResult };
  }

  render() {
    const playingbarTransform = {
      transform: [
        {
          translateY: this.state.panResponderY
        }
      ]
    };

    const tabbarTransform = {
      transform: [
        {
          translateY: Animated.multiply(this.state.panResponderY, -movingRate)
        }
      ]
    };

    const musicNoteTransform = {
      transform: [
        {
          scale: this.state.panResponderY.interpolate({
            inputRange: [panResponderYMinValue, panResponderYMaxValue],
            outputRange: [musicNoteScaledScale, musicNoteNormalScale]
          })
        },
        {
          translateX: this.state.panResponderY.interpolate({
            inputRange: this.split(panResponderYMinValue, panResponderYMaxValue)
              .slowResult,
            outputRange: this.split(
              musicNoteScaledXOffset,
              musicNoteNormalXOffset
            ).fastResult
          })
        },
        {
          translateY: this.state.panResponderY.interpolate({
            inputRange: this.split(panResponderYMinValue, panResponderYMaxValue)
              .slowResult,
            outputRange: this.split(
              musicNoteScaledYOffset,
              musicNoteNormalYOffset
            ).fastResult
          })
        }
      ]
    };

    return (
      <View style={styles.container}>
        <Animated.View
          {...this._panResponder.panHandlers}
          style={[playingbarTransform, styles.playingbar]}
        >
          <View style={styles.musicNoteContainer}>
            <Animated.View style={[musicNoteTransform, styles.musicNote]}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: ScaleUtility.getSize(12)
                }}
              >{`đây là cái nốt nhạc`}</Text>
            </Animated.View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.tabbar, tabbarTransform]}>
          <View style={styles.tabbarItem}>
            <Text style={styles.tabbarText}>Thư viện</Text>
          </View>
          <View style={styles.tabbarItem}>
            <Text style={styles.tabbarText}>Cho bạn</Text>
          </View>
          <View style={styles.tabbarItem}>
            <Text style={styles.tabbarText}>Duyệt</Text>
          </View>
          <View style={styles.tabbarItem}>
            <Text style={styles.tabbarText}>Radio</Text>
          </View>
          <View style={styles.tabbarItem}>
            <Text style={styles.tabbarText}>Tìm kiếm</Text>
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },

  playingbar: {
    position: 'absolute',
    flexDirection: 'row',

    height: playingbarHeight,
    width: windowWidth,
    top: windowHeight - playingbarInitialNonOverlappingDistance - tabbarHeight,

    backgroundColor: 'white',

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgb(175, 175, 175)',

    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },

  tabbar: {
    position: 'absolute',
    flexDirection: 'row',
    zIndex: 1,

    height: tabbarHeight,
    width: windowWidth,
    bottom: 0,

    backgroundColor: 'white'
  },

  tabbarItem: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgb(175, 175, 175)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  tabbarText: {
    color: 'rgb(175, 175, 175)',
    fontSize: ScaleUtility.getSize(13),
    fontWeight: '600'
  },

  musicNoteContainer: {
    height: playingbarInitialNonOverlappingDistance,
    flex: 1,
    paddingVertical: musicNoteContainerVerticalPadding,
    paddingHorizontal: musicNoteContainerHorizontalPadding
  },

  musicNote: {
    flex: 1,
    width: musicNoteNoteWidth,
    borderRadius: ScaleUtility.getSize(3),
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
