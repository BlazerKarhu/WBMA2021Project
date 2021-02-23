import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import {Button, Card, CheckBox} from 'react-native-elements';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({navigation}) => {
  const {user, setIsLoggedIn} = useContext(MainContext);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    setIsLoggedIn(false);
    await AsyncStorage.clear();
    navigation.navigate('Login');
    setLoading(false);
  };

  const doUpdate = () => {
    navigation.navigate('Update Profile');
  };

  useEffect(() => {
    console.log('profile', user);
  }, []);

  return (
    <Card>
      <Card.Title h3>{user.username}</Card.Title>
      <View style={styles.cardInfo}>
        <Card.Image
          source={{uri: 'http://placekitten.com/150'}}
          style={styles.img}
        />
        <View style={styles.userDetails}>
          <Text style={styles.desc}>Full name</Text>
          <Text style={styles.userInfo}>{user.full_name}</Text>
          <Text style={styles.desc}>Employer</Text>
          <CheckBox checked={user.employer} containerStyle={styles.checkBox} />
        </View>
      </View>
      <Card.Divider />
      <Button title="Update" buttonStyle={styles.update} onPress={doUpdate} />
      <Button
        title="Logout"
        type="solid"
        buttonStyle={styles.logout}
        loading={loading}
        onPress={logout}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'center',
  },
  userDetails: {
    flexGrow: 1,
  },
  img: {
    height: 150,
    width: 150,
    aspectRatio: 1,
    borderRadius: 75,
    marginEnd: 10,
  },
  desc: {
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 20,
    marginBottom: 10,
  },
  logout: {
    backgroundColor: 'red',
  },
  update: {
    marginBottom: 10,
  },
  checkBox: {
    padding: 0,
  },
});

Profile.propTypes = {
  navigation: PropTypes.object,
};

export default Profile;