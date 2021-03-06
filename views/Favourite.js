import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {StatusBar} from 'expo-status-bar';
import FavouriteList from '../components/FavouriteList';
import {colors} from '../utils/variables';

const Favourite = ({navigation}) => {
  return (
    <View style={{flex: 1}}>
      <FavouriteList navigation={navigation} />
      <StatusBar style="light" backgroundColor={colors.statusbar} />
    </View>
  );
};

Favourite.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default Favourite;
